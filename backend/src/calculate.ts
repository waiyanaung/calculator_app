import { CalculatorError } from './errors';
import { evaluate } from './evaluator';
import { formatResult, resolveTargetSystem } from './formatter';
import { parse } from './parser';
import { tokenize } from './tokenizer';
import { normalizeExpression, NumeralSystem } from './unicodeNormalizer';

export const MAX_EXPRESSION_LENGTH = 500;

export interface CalculateResult {
  success: true;
  normalizedExpression: string;
  result: string;
  formattedResult: string;
  detectedNumeralSystems: NumeralSystem[];
}

export function calculate(rawExpression: string, outputNumeralSystem?: string): CalculateResult {
  if (typeof rawExpression !== 'string') {
    throw new CalculatorError('EMPTY_EXPRESSION', 'Expression must not be empty.');
  }
  if (rawExpression.length > MAX_EXPRESSION_LENGTH) {
    throw new CalculatorError(
      'INPUT_TOO_LONG',
      `Expression exceeds the maximum length of ${MAX_EXPRESSION_LENGTH} characters.`
    );
  }
  if (rawExpression.trim().length === 0) {
    throw new CalculatorError('EMPTY_EXPRESSION', 'Expression must not be empty.');
  }

  const { normalizedExpression, detectedNumeralSystems } = normalizeExpression(rawExpression);
  const tokens = tokenize(normalizedExpression);
  const ast = parse(tokens);
  const resultDecimal = evaluate(ast);

  if (!resultDecimal.isFinite()) {
    throw new CalculatorError('OVERFLOW', 'Result is too large to represent.');
  }

  const targetSystem = resolveTargetSystem(outputNumeralSystem, detectedNumeralSystems);
  const formattedResult = formatResult(resultDecimal, targetSystem);

  return {
    success: true,
    normalizedExpression,
    result: resultDecimal.toString(),
    formattedResult,
    detectedNumeralSystems,
  };
}
