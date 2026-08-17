import request from 'supertest';
import { createApp } from '../src/server';

const app = createApp();

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /api/calculate', () => {
  it('returns a successful calculation', async () => {
    const res = await request(app)
      .post('/api/calculate')
      .send({ expression: '१२३ + ٤٥٦ × (2 − 1)', outputNumeralSystem: 'ascii' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      normalizedExpression: '123+456*(2-1)',
      result: '579',
      formattedResult: '579',
      detectedNumeralSystems: expect.arrayContaining(['devanagari', 'arabic-indic']),
    });
  });

  it('returns a structured 400 error for invalid input', async () => {
    const res = await request(app)
      .post('/api/calculate')
      .send({ expression: '(1 + 2' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('UNBALANCED_PARENTHESES');
  });

  it('returns DIVISION_BY_ZERO for division by zero', async () => {
    const res = await request(app).post('/api/calculate').send({ expression: '5 / 0' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('DIVISION_BY_ZERO');
  });

  it('returns EMPTY_EXPRESSION for missing expression', async () => {
    const res = await request(app).post('/api/calculate').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('EMPTY_EXPRESSION');
  });
});
