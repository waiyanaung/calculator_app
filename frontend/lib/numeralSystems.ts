export interface NumeralSystemDef {
  id: string;
  label: string;
  digits: string[] | null; // null for non-positional systems (Roman numerals)
}

export const NUMERAL_SYSTEMS: NumeralSystemDef[] = [
  { id: 'ascii', label: 'ASCII (0-9)', digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  {
    id: 'arabic-indic',
    label: 'Arabic-Indic',
    digits: ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'],
  },
  {
    id: 'extended-arabic-indic',
    label: 'Persian/Urdu',
    digits: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  },
  {
    id: 'devanagari',
    label: 'Devanagari',
    digits: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  },
  { id: 'bengali', label: 'Bengali', digits: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] },
  { id: 'myanmar', label: 'Myanmar', digits: ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'] },
  { id: 'thai', label: 'Thai', digits: ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'] },
  {
    id: 'fullwidth',
    label: 'Fullwidth',
    digits: ['０', '１', '２', '３', '４', '５', '６', '７', '８', '９'],
  },
  {
    id: 'superscript',
    label: 'Superscript',
    digits: ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'],
  },
  { id: 'subscript', label: 'Subscript', digits: ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'] },
  { id: 'circled', label: 'Circled', digits: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'] },
  { id: 'roman', label: 'Roman Numerals', digits: null },
];

export const OUTPUT_SYSTEM_OPTIONS = [
  { id: 'auto', label: 'Auto-detect' },
  ...NUMERAL_SYSTEMS,
];

export function getNumeralSystem(id: string): NumeralSystemDef {
  return NUMERAL_SYSTEMS.find((s) => s.id === id) ?? NUMERAL_SYSTEMS[0];
}

export const ERROR_MESSAGES: Record<string, string> = {
  EMPTY_EXPRESSION: 'Enter an expression to calculate.',
  INPUT_TOO_LONG: 'That expression is too long (max 500 characters).',
  INVALID_CHARACTER: 'That expression contains a character the calculator does not understand.',
  UNBALANCED_PARENTHESES: 'Parentheses do not match up.',
  UNSUPPORTED_OPERATION: 'Roman numerals only support whole, positive numbers.',
  DIVISION_BY_ZERO: 'Cannot divide by zero.',
  SYNTAX_ERROR: 'That expression is not valid.',
  OVERFLOW: 'That result is too large to display.',
};
