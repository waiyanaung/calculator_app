import { CalculatorError } from '../src/errors';
import { normalizeExpression } from '../src/unicodeNormalizer';

describe('normalizeExpression', () => {
  const cases: { name: string; input: string; expected: string }[] = [
    { name: 'ascii', input: '123 + 456', expected: '123+456' },
    { name: 'arabic-indic', input: '١٢٣ + ٤٥٦', expected: '123+456' },
    { name: 'extended-arabic-indic', input: '۱۲۳ + ۴۵۶', expected: '123+456' },
    { name: 'devanagari', input: '१२३ + ४५६', expected: '123+456' },
    { name: 'bengali', input: '১২৩ + ৪৫৬', expected: '123+456' },
    { name: 'myanmar', input: '၁၂၃ + ၄၅၆', expected: '123+456' },
    { name: 'thai', input: '๑๒๓ + ๔๕๖', expected: '123+456' },
    { name: 'fullwidth', input: '１２３ ＋ ４５６', expected: '123+456' },
    { name: 'superscript', input: '¹²³ + ⁴⁵⁶', expected: '123+456' },
    { name: 'subscript', input: '₁₂₃ + ₄₅₆', expected: '123+456' },
    { name: 'circled', input: '①②③ + ④⑤⑥', expected: '123+456' },
    { name: 'roman', input: 'XII + IV', expected: '12+4' },
  ];

  it.each(cases)('normalizes $name digits to ASCII', ({ input, expected }) => {
    const { normalizedExpression } = normalizeExpression(input);
    expect(normalizedExpression).toBe(expected);
  });

  it('detects the numeral systems used, excluding ascii', () => {
    const { detectedNumeralSystems } = normalizeExpression('१२३ + ٤٥٦ × (2 − 1)');
    expect(detectedNumeralSystems.sort()).toEqual(['arabic-indic', 'devanagari'].sort());
  });

  it('supports mixing numeral systems within one expression', () => {
    const { normalizedExpression } = normalizeExpression('१२ + ١٢');
    expect(normalizedExpression).toBe('12+12');
  });

  it('normalizes unicode math operator variants', () => {
    const { normalizedExpression } = normalizeExpression('2 × 3 ÷ 1 − 1 ﹢ 1');
    expect(normalizedExpression).toBe('2*3/1-1+1');
  });

  it('throws INVALID_CHARACTER for unsupported characters', () => {
    try {
      normalizeExpression('12 & 3');
      fail('expected to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(CalculatorError);
      expect((err as CalculatorError).code).toBe('INVALID_CHARACTER');
    }
  });

  it('throws UNSUPPORTED_OPERATION for Roman numerals with a decimal point', () => {
    try {
      normalizeExpression('X.5 + 1');
      fail('expected to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(CalculatorError);
      expect((err as CalculatorError).code).toBe('UNSUPPORTED_OPERATION');
    }
  });
});
