import Decimal from 'decimal.js';
import { CalculatorError } from './errors';
import { ASTNode } from './parser';

/**
 * Walks the AST computing an arbitrary-precision result via decimal.js.
 * Postfix `%` divides its operand by 100 (e.g. `50%` -> 0.5).
 */
export function evaluate(node: ASTNode): Decimal {
  switch (node.type) {
    case 'Number':
      return new Decimal(node.value);

    case 'Unary': {
      const val = evaluate(node.operand);
      return node.op === '-' ? val.negated() : val;
    }

    case 'Percent': {
      const val = evaluate(node.operand);
      return val.dividedBy(100);
    }

    case 'Binary': {
      const left = evaluate(node.left);
      const right = evaluate(node.right);
      switch (node.op) {
        case '+':
          return left.plus(right);
        case '-':
          return left.minus(right);
        case '*':
          return left.times(right);
        case '/':
          if (right.isZero()) {
            throw new CalculatorError('DIVISION_BY_ZERO', 'Division by zero is not allowed.');
          }
          return left.dividedBy(right);
      }
    }
  }
}
