import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { calculate } from './calculate';
import { CalculatorError } from './errors';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.post('/api/calculate', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { expression, outputNumeralSystem } = req.body ?? {};
      const result = calculate(expression, outputNumeralSystem);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof CalculatorError) {
      res.status(400).json({ success: false, error: err.code, message: err.message });
      return;
    }
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: 'Unexpected server error.' });
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 4000;
  const app = createApp();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Unicode Calculator backend listening on port ${port}`);
  });
}
