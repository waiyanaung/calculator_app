export type ErrorCode =
  | 'EMPTY_EXPRESSION'
  | 'INPUT_TOO_LONG'
  | 'INVALID_CHARACTER'
  | 'UNBALANCED_PARENTHESES'
  | 'UNSUPPORTED_OPERATION'
  | 'DIVISION_BY_ZERO'
  | 'SYNTAX_ERROR'
  | 'OVERFLOW';

export class CalculatorError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'CalculatorError';
  }
}
