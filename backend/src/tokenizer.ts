import { CalculatorError } from './errors';

export type TokenType =
  | 'NUMBER'
  | 'PLUS'
  | 'MINUS'
  | 'STAR'
  | 'SLASH'
  | 'PERCENT'
  | 'LPAREN'
  | 'RPAREN'
  | 'EOF';

export interface Token {
  type: TokenType;
  value?: string;
}

const NUMBER_LITERAL = /^(\d+(\.\d+)?|\.\d+)$/;

/**
 * Tokenizes an already-normalized (ASCII-only) expression string.
 */
export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      if (!NUMBER_LITERAL.test(num)) {
        throw new CalculatorError('SYNTAX_ERROR', `Invalid number literal: "${num}"`);
      }
      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }

    switch (ch) {
      case '+':
        tokens.push({ type: 'PLUS' });
        break;
      case '-':
        tokens.push({ type: 'MINUS' });
        break;
      case '*':
        tokens.push({ type: 'STAR' });
        break;
      case '/':
        tokens.push({ type: 'SLASH' });
        break;
      case '%':
        tokens.push({ type: 'PERCENT' });
        break;
      case '(':
        tokens.push({ type: 'LPAREN' });
        break;
      case ')':
        tokens.push({ type: 'RPAREN' });
        break;
      default:
        throw new CalculatorError('INVALID_CHARACTER', `Unsupported character: "${ch}"`);
    }
    i++;
  }

  tokens.push({ type: 'EOF' });
  return tokens;
}
