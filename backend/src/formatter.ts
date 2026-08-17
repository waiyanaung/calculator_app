import Decimal from 'decimal.js';
import { CalculatorError } from './errors';
import { NumeralSystem, NUMERAL_SYSTEMS } from './unicodeNormalizer';

const DIGIT_CHARS: Partial<Record<NumeralSystem, string[]>> = {
  ascii: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  'arabic-indic': ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'],
  'extended-arabic-indic': ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  devanagari: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  bengali: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
  myanmar: ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'],
  thai: ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'],
  fullwidth: ['０', '１', '２', '３', '４', '５', '６', '７', '８', '９'],
  superscript: ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'],
  subscript: ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'],
  circled: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'],
};

const ROMAN_NUMERALS: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

function intToRoman(n: number): string {
  let remaining = n;
  let out = '';
  for (const [value, symbol] of ROMAN_NUMERALS) {
    while (remaining >= value) {
      out += symbol;
      remaining -= value;
    }
  }
  return out;
}

export function isSupportedNumeralSystem(value: string): value is NumeralSystem {
  return (NUMERAL_SYSTEMS as string[]).includes(value);
}

/**
 * Decides which numeral system results should be rendered in, given the
 * caller's request and the systems detected in the input expression.
 */
export function resolveTargetSystem(
  requested: string | undefined,
  detected: NumeralSystem[]
): NumeralSystem {
  if (!requested || requested === 'ascii') return 'ascii';
  if (requested === 'auto') {
    return detected.length === 1 ? detected[0] : 'ascii';
  }
  if (!isSupportedNumeralSystem(requested)) {
    throw new CalculatorError(
      'SYNTAX_ERROR',
      `Unsupported output numeral system: "${requested}"`
    );
  }
  return requested;
}

export function formatResult(value: Decimal, targetSystem: NumeralSystem): string {
  if (targetSystem === 'roman') {
    if (!value.isInteger() || value.lessThanOrEqualTo(0)) {
      throw new CalculatorError(
        'UNSUPPORTED_OPERATION',
        'Roman numerals can only represent positive integers.'
      );
    }
    return intToRoman(value.toNumber());
  }

  const digits = DIGIT_CHARS[targetSystem];
  if (!digits) {
    throw new CalculatorError(
      'SYNTAX_ERROR',
      `Unsupported output numeral system: "${targetSystem}"`
    );
  }

  const ascii = value.toString();
  let out = '';
  for (const ch of ascii) {
    if (ch === '-' || ch === '.') {
      out += ch;
    } else {
      out += digits[Number(ch)];
    }
  }
  return out;
}
