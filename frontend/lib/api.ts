export interface CalculateSuccessResponse {
  success: true;
  normalizedExpression: string;
  result: string;
  formattedResult: string;
  detectedNumeralSystems: string[];
}

export interface CalculateErrorResponse {
  success: false;
  error: string;
  message: string;
}

export type CalculateResponse = CalculateSuccessResponse | CalculateErrorResponse;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function calculateExpression(
  expression: string,
  outputNumeralSystem: string
): Promise<CalculateResponse> {
  const res = await fetch(`${API_URL}/api/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression, outputNumeralSystem }),
  });

  const body = await res.json();
  return body as CalculateResponse;
}
