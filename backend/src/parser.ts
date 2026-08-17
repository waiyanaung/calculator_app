import { CalculatorError } from './errors';
import { Token } from './tokenizer';

export type ASTNode =
  | { type: 'Number'; value: string }
  | { type: 'Binary'; op: '+' | '-' | '*' | '/'; left: ASTNode; right: ASTNode }
  | { type: 'Unary'; op: '+' | '-'; operand: ASTNode }
  | { type: 'Percent'; operand: ASTNode };

/**
 * Recursive-descent parser implementing standard precedence:
 * addition/subtraction < multiplication/division < postfix percent < unary sign < parentheses.
 */
class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  parse(): ASTNode {
    const node = this.parseExpression();
    if (this.peek().type !== 'EOF') {
      if (this.peek().type === 'RPAREN') {
        throw new CalculatorError('UNBALANCED_PARENTHESES', 'Expression has mismatched parentheses.');
      }
      throw new CalculatorError('SYNTAX_ERROR', 'Unexpected token in expression.');
    }
    return node;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  private parseExpression(): ASTNode {
    let node = this.parseTerm();
    while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.advance().type === 'PLUS' ? '+' : '-';
      const right = this.parseTerm();
      node = { type: 'Binary', op, left: node, right };
    }
    return node;
  }

  private parseTerm(): ASTNode {
    let node = this.parseFactor();
    while (this.peek().type === 'STAR' || this.peek().type === 'SLASH') {
      const op = this.advance().type === 'STAR' ? '*' : '/';
      const right = this.parseFactor();
      node = { type: 'Binary', op, left: node, right };
    }
    return node;
  }

  private parseFactor(): ASTNode {
    let node = this.parseUnary();
    while (this.peek().type === 'PERCENT') {
      this.advance();
      node = { type: 'Percent', operand: node };
    }
    return node;
  }

  private parseUnary(): ASTNode {
    if (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.advance().type === 'PLUS' ? '+' : '-';
      const operand = this.parseUnary();
      return { type: 'Unary', op, operand };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();

    if (token.type === 'NUMBER') {
      this.advance();
      return { type: 'Number', value: token.value! };
    }

    if (token.type === 'LPAREN') {
      this.advance();
      const node = this.parseExpression();
      if (this.peek().type !== 'RPAREN') {
        throw new CalculatorError('UNBALANCED_PARENTHESES', 'Expression has mismatched parentheses.');
      }
      this.advance();
      return node;
    }

    if (token.type === 'RPAREN') {
      throw new CalculatorError('UNBALANCED_PARENTHESES', 'Expression has mismatched parentheses.');
    }

    throw new CalculatorError('SYNTAX_ERROR', 'Unexpected end of expression or invalid syntax.');
  }
}

export function parse(tokens: Token[]): ASTNode {
  return new Parser(tokens).parse();
}
