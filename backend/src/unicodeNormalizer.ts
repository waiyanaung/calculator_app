import { CalculatorError } from './errors';

export type NumeralSystem =
  | 'ascii'
  | 'arabic-indic'
  | 'extended-arabic-indic'
  | 'devanagari'
  | 'bengali'
  | 'myanmar'
  | 'thai'
  | 'fullwidth'
  | 'superscript'
  | 'subscript'
  | 'circled'
  | 'roman';

export const NUMERAL_SYSTEMS: NumeralSystem[] = [
  'ascii',
  'arabic-indic',
  'extended-arabic-indic',
  'devanagari',
  'bengali',
  'myanmar',
  'thai',
  'fullwidth',
  'superscript',
  'subscript',
  'circled',
  'roman',
];

interface ContiguousDigitSet {
  system: NumeralSystem;
  base: number;
}

// Systems whose digits 0-9 occupy ten consecutive code points.
const CONTIGUOUS_DIGIT_SETS: ContiguousDigitSet[] = [
  { system: 'ascii', base: 0x30 },
  { system: 'arabic-indic', base: 0x0660 },
  { system: 'extended-arabic-indic', base: 0x06f0 },
  { system: 'devanagari', base: 0x0966 },
  { system: 'bengali', base: 0x09e6 },
  { system: 'myanmar', base: 0x1040 },
  { system: 'thai', base: 0x0e50 },
  { system: 'fullwidth', base: 0xff10 },
  { system: 'subscript', base: 0x2080 },
];

// Superscript digits are not contiguous in Unicode (0/4-9 vs 1/2/3).
const SUPERSCRIPT_DIGITS: Record<string, number> = {
  '⁰': 0,
  '¹': 1,
  '²': 2,
  '³': 3,
  '⁴': 4,
  '⁵': 5,
  '⁶': 6,
  '⁷': 7,
  '⁸': 8,
  '⁹': 9,
};

// Circled digits: no standard "circled zero" adjacent to 1-9's block.
const CIRCLED_DIGITS: Record<string, number> = {
  '⓪': 0,
  '①': 1,
  '②': 2,
  '③': 3,
  '④': 4,
  '⑤': 5,
  '⑥': 6,
  '⑦': 7,
  '⑧': 8,
  '⑨': 9,
};

export const ROMAN_VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

const OPERATOR_MAP: Record<string, string> = {
  '+': '+',
  '﹢': '+', // small plus sign
  '＋': '+', // fullwidth plus sign
  '-': '-',
  '−': '-', // minus sign
  '－': '-', // fullwidth hyphen-minus
  '*': '*',
  '×': '*', // multiplication sign
  '/': '/',
  '÷': '/', // division sign
  '／': '/', // fullwidth solidus
  '(': '(',
  ')': ')',
  '（': '(', // fullwidth left parenthesis
  '）': ')', // fullwidth right parenthesis
  '%': '%',
  '％': '%', // fullwidth percent sign
  '.': '.',
  '．': '.', // fullwidth full stop
};

export interface NormalizeResult {
  normalizedExpression: string;
  detectedNumeralSystems: NumeralSystem[];
}

function digitToSystem(ch: string): { system: NumeralSystem; digit: number } | null {
  const cp = ch.codePointAt(0)!;
  for (const { system, base } of CONTIGUOUS_DIGIT_SETS) {
    if (cp >= base && cp <= base + 9) {
      return { system, digit: cp - base };
    }
  }
  if (ch in SUPERSCRIPT_DIGITS) {
    return { system: 'superscript', digit: SUPERSCRIPT_DIGITS[ch] };
  }
  if (ch in CIRCLED_DIGITS) {
    return { system: 'circled', digit: CIRCLED_DIGITS[ch] };
  }
  return null;
}

function romanToInt(token: string): number {
  let total = 0;
  for (let i = 0; i < token.length; i++) {
    const value = ROMAN_VALUES[token[i]];
    const next = ROMAN_VALUES[token[i + 1]];
    if (next && value < next) {
      total -= value;
    } else {
      total += value;
    }
  }
  return total;
}

/**
 * Normalizes a mixed-numeral-system expression into a canonical ASCII
 * expression, tracking which non-ASCII numeral systems were encountered.
 */
export function normalizeExpression(raw: string): NormalizeResult {
  const detected = new Set<NumeralSystem>();
  let out = '';
  const chars = Array.from(raw);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (/\s/.test(ch)) continue;

    const digitInfo = digitToSystem(ch);
    if (digitInfo) {
      out += String(digitInfo.digit);
      if (digitInfo.system !== 'ascii') detected.add(digitInfo.system);
      continue;
    }

    if (ch in OPERATOR_MAP) {
      out += OPERATOR_MAP[ch];
      continue;
    }

    if (ROMAN_VALUES[ch] !== undefined) {
      let j = i;
      let token = '';
      while (j < chars.length && ROMAN_VALUES[chars[j]] !== undefined) {
        token += chars[j];
        j++;
      }
      // A decimal point directly attached to a Roman numeral token means
      // someone is trying to put a fractional part on it, which Roman
      // numerals cannot represent.
      if (chars[j] === '.') {
        throw new CalculatorError(
          'UNSUPPORTED_OPERATION',
          'Roman numerals do not support decimal points.'
        );
      }
      const value = romanToInt(token);
      out += String(value);
      detected.add('roman');
      i = j - 1;
      continue;
    }

    throw new CalculatorError('INVALID_CHARACTER', `Unsupported character: "${ch}"`);
  }

  return { normalizedExpression: out, detectedNumeralSystems: Array.from(detected) };
}
