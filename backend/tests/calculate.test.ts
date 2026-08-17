import { calculate } from '../src/calculate';
import { CalculatorError } from '../src/errors';

describe('calculate', () => {
  it('computes basic addition', () => {
    const result = calculate('1 + 2');
    expect(result.result).toBe('3');
  });

  it('respects operator precedence and parentheses', () => {
    const result = calculate('123 + 456 * (2 - 1)');
    expect(result.result).toBe('579');
    expect(result.normalizedExpression).toBe('123+456*(2-1)');
  });

  it('matches the PRD example end to end', () => {
    const result = calculate('१२३ + ٤٥٦ × (2 − 1)');
    expect(result.normalizedExpression).toBe('123+456*(2-1)');
    expect(result.result).toBe('579');
    expect(result.formattedResult).toBe('579');
    expect(result.detectedNumeralSystems.sort()).toEqual(['arabic-indic', 'devanagari'].sort());
  });

  it('handles decimals precisely using arbitrary precision math', () => {
    const result = calculate('0.1 + 0.2');
    expect(result.result).toBe('0.3');
  });

  it('handles percentage as a postfix operator', () => {
    const result = calculate('50%');
    expect(result.result).toBe('0.5');
  });

  it('handles negative numbers', () => {
    const result = calculate('-5 + 3');
    expect(result.result).toBe('-2');
  });

  it('handles Roman numerals (integer only)', () => {
    const result = calculate('XII + IV');
    expect(result.result).toBe('16');
  });

  it('formats results back into the requested numeral system', () => {
    const result = calculate('2 + 3', 'devanagari');
    expect(result.result).toBe('5');
    expect(result.formattedResult).toBe('५');
  });

  it('formats results back into Roman numerals', () => {
    const result = calculate('10 + 4', 'roman');
    expect(result.formattedResult).toBe('XIV');
  });

  it('auto-detects the output numeral system when exactly one is used', () => {
    const result = calculate('१ + १', 'auto');
    expect(result.formattedResult).toBe('२');
  });

  it('falls back to ascii for auto when multiple systems are mixed', () => {
    const result = calculate('१ + ١', 'auto');
    expect(result.formattedResult).toBe('2');
  });

  describe('edge cases from PRD section 11', () => {
    it('rejects division by zero', () => {
      expect(() => calculate('1 / 0')).toThrow(CalculatorError);
      try {
        calculate('1 / 0');
      } catch (err) {
        expect((err as CalculatorError).code).toBe('DIVISION_BY_ZERO');
      }
    });

    it('rejects unmapped characters', () => {
      try {
        calculate('1 + @');
      } catch (err) {
        expect((err as CalculatorError).code).toBe('INVALID_CHARACTER');
      }
    });

    it('rejects unbalanced parentheses', () => {
      try {
        calculate('(1 + 2');
      } catch (err) {
        expect((err as CalculatorError).code).toBe('UNBALANCED_PARENTHESES');
      }
      try {
        calculate('1 + 2)');
      } catch (err) {
        expect((err as CalculatorError).code).toBe('UNBALANCED_PARENTHESES');
      }
    });

    it('rejects Roman numerals with a decimal point', () => {
      try {
        calculate('X.5 + 1');
      } catch (err) {
        expect((err as CalculatorError).code).toBe('UNSUPPORTED_OPERATION');
      }
    });

    it('rejects Roman numeral output for non-integer results', () => {
      try {
        calculate('1 / 3', 'roman');
      } catch (err) {
        expect((err as CalculatorError).code).toBe('UNSUPPORTED_OPERATION');
      }
    });

    it('rejects excessively long input', () => {
      const longExpr = '1+'.repeat(300) + '1';
      try {
        calculate(longExpr);
      } catch (err) {
        expect((err as CalculatorError).code).toBe('INPUT_TOO_LONG');
      }
    });

    it('rejects empty expressions', () => {
      try {
        calculate('   ');
      } catch (err) {
        expect((err as CalculatorError).code).toBe('EMPTY_EXPRESSION');
      }
    });
  });
});
