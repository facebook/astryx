// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file numberParser.ts
 * @input Text a person typed or pasted, plus the resolved BCP 47 locale
 * @output Exports parseLocaleNumber and formatEditableNumber
 * @position Internal to NumberInput; not part of the public surface
 *
 * People paste numbers out of spreadsheets, and a spreadsheet writes them
 * grouped, signed, and decorated. This reads those back. Everything locale
 * specific — the grouping and decimal separators, the group sizes, the digit
 * script — is derived from Intl and Unicode rather than a table, and anything
 * that could mean two different numbers returns null so the field stays
 * visibly invalid instead of committing a guess.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/NumberInput/NumberInput.tsx
 * - /packages/core/src/NumberInput/numberParser.test.ts
 */

import type {Locale} from '../i18n';

interface LocaleNumberSymbols {
  group: string;
  decimal: string;
  /** Digits in the rightmost group — 3 nearly everywhere, 3 in en-IN too. */
  primaryGroupSize: number;
  /** Digits in every group left of it — 2 in en-IN's lakh grouping. */
  secondaryGroupSize: number;
}

const symbolsByLocale = new Map<string, LocaleNumberSymbols>();

function getLocaleNumberSymbols(locale: Locale | undefined) {
  const key = locale ?? '';
  let symbols = symbolsByLocale.get(key);
  if (symbols === undefined) {
    let format: Intl.NumberFormat;
    try {
      format = new Intl.NumberFormat(locale);
    } catch {
      format = new Intl.NumberFormat('en');
    }
    const parts = format.formatToParts(12345.6);
    // A probe long enough to expose a second grouping size where one exists.
    const groupSizes = format
      .formatToParts(11111111111)
      .filter(part => part.type === 'integer')
      .map(part => part.value.length);
    const hasGrouping = groupSizes.length > 1;
    symbols = {
      // Normalized so the space-family separators compare equal to the plain
      // space that input text is normalized to.
      group: (parts.find(p => p.type === 'group')?.value ?? ',').normalize(
        'NFKC',
      ),
      decimal: parts.find(p => p.type === 'decimal')?.value ?? '.',
      primaryGroupSize: hasGrouping ? groupSizes[groupSizes.length - 1] : 3,
      secondaryGroupSize: hasGrouping ? groupSizes[groupSizes.length - 2] : 3,
    };
    symbolsByLocale.set(key, symbols);
  }
  return symbols;
}

// Built at runtime rather than written as literals: Babel's
// transform-unicode-property-regex rewrites a `\p{...}` regex LITERAL into an
// enumerated character class, and the copy bundled with Next rejects the
// General_Category short names, failing the sandbox build. Property escapes are
// ES2018 and need no transform in any browser this package supports.
const DECIMAL_DIGIT = new RegExp('\\p{Nd}', 'u');
const LETTER = new RegExp('\\p{L}', 'u');
const CURRENCY = new RegExp('\\p{Sc}', 'u');
// Zero-width joiners, bidi isolates and the BOM Excel prepends.
const INVISIBLES = /[\u200B-\u200D\u200E\u200F\u061C\u2066-\u2069\uFEFF]/g;
// Hyphen last: inside the character class this builds, a leading one would
// open a range.
const MINUS_SIGNS = '\u2212\u2012\u2013-';

/**
 * Value of any Unicode decimal digit. Each digit script lays its ten digits
 * out consecutively, so walking back to the script's zero derives the value
 * for Arabic-Indic, Devanagari, full-width and the rest without shipping a
 * table of them. Returns null in the one shape the walk cannot resolve: two
 * digit blocks adjacent in code space (the mathematical alphanumerics).
 */
function digitValue(char: string): number | null {
  const codePoint = char.codePointAt(0);
  if (codePoint == null) {
    return null;
  }
  for (let zero = codePoint; codePoint - zero < 10; zero--) {
    if (!DECIMAL_DIGIT.test(String.fromCodePoint(zero - 1))) {
      return codePoint - zero;
    }
  }
  return null;
}

function toAsciiDigits(text: string): string | null {
  let out = '';
  for (const char of text) {
    if (!DECIMAL_DIGIT.test(char)) {
      out += char;
      continue;
    }
    const value = digitValue(char);
    if (value == null) {
      return null;
    }
    out += String(value);
  }
  return out;
}

/**
 * Reduce a digits-and-separators string to a plain machine number under one
 * candidate reading, or null when it is not well formed under that reading.
 * `minGroups` is how many grouping separators the reading has to see before it
 * believes the separator is grouping at all.
 */
function readUnder(
  core: string,
  group: string,
  decimal: string,
  primaryGroupSize: number,
  secondaryGroupSize: number,
  minGroups: number,
): string | null {
  let intText = core;
  let fracText: string | null = null;

  if (decimal !== '' && core.includes(decimal)) {
    const at = core.indexOf(decimal);
    if (core.includes(decimal, at + decimal.length)) {
      return null;
    }
    intText = core.slice(0, at);
    fracText = core.slice(at + decimal.length);
    if (!/^\d*$/.test(fracText)) {
      return null;
    }
  }

  let digits: string;
  if (group !== '' && intText.includes(group)) {
    const chunks = intText.split(group);
    if (
      chunks.length - 1 < minGroups ||
      !chunks.every(chunk => /^\d+$/.test(chunk))
    ) {
      return null;
    }
    const first = chunks[0];
    const last = chunks[chunks.length - 1];
    if (last.length !== primaryGroupSize || first.length > secondaryGroupSize) {
      return null;
    }
    for (let i = 1; i < chunks.length - 1; i++) {
      if (chunks[i].length !== secondaryGroupSize) {
        return null;
      }
    }
    digits = chunks.join('');
  } else {
    if (!/^\d*$/.test(intText)) {
      return null;
    }
    digits = intText;
  }

  if (digits === '' && (fracText == null || fracText === '')) {
    return null;
  }
  return fracText == null ? digits : `${digits}.${fracText}`;
}

/**
 * A separator that no locale uses as a decimal point, so one well-formed group
 * of it is already unambiguous. Everything else needs two before grouping
 * beats the decimal-point reading.
 */
function isGroupOnlySeparator(separator: string): boolean {
  return /^[\s'\u2019\u00B7]$/.test(separator);
}

function toPlainNumber(
  core: string,
  locale: Locale | undefined,
): string | null {
  if (LETTER.test(core)) {
    return null;
  }

  const {group, decimal, primaryGroupSize, secondaryGroupSize} =
    getLocaleNumberSymbols(locale);
  const inLocale = readUnder(
    core,
    group,
    decimal,
    primaryGroupSize,
    secondaryGroupSize,
    1,
  );
  if (inLocale != null) {
    return inLocale;
  }

  // The locale could not read it. A repeated separator with three digits after
  // each occurrence can only be grouping — a decimal point appears once — so
  // that shape reads the same in every locale, which is what lets a
  // `1,234,234,234` pasted out of a spreadsheet land in a de-DE app.
  const separators = [...new Set(core.replace(/\d/g, ''))];
  if (separators.length === 0 || separators.length > 2) {
    return null;
  }
  for (const candidate of separators) {
    const occurrences = core.split(candidate).length - 1;
    const minGroups = isGroupOnlySeparator(candidate) ? 1 : 2;
    if (occurrences < minGroups) {
      continue;
    }
    const other = separators.find(s => s !== candidate) ?? '';
    if (other !== '' && core.split(other).length - 1 !== 1) {
      continue;
    }
    const read = readUnder(core, candidate, other, 3, 3, minGroups);
    if (read != null) {
      return read;
    }
  }
  return null;
}

/**
 * Read a number out of text the way a person in `locale` writes one: their
 * grouping and decimal separators, their group sizes, their digit script, an
 * optional currency symbol, and the shapes a spreadsheet pastes.
 *
 * Returns null rather than a guess. Grouping is validated, so en-US `1,23` —
 * a comma that is neither a decimal point nor a well-formed group — is not
 * silently read as 123, and neither is a number written for another locale.
 *
 * @example
 * ```
 * parseLocaleNumber('1,234,234,234', 'en-US')  // 1234234234
 * parseLocaleNumber('1,234,234,234', 'de-DE')  // 1234234234
 * parseLocaleNumber('1,5', 'de-DE')            // 1.5
 * parseLocaleNumber('1,5', 'en-US')            // null
 * ```
 */
export function parseLocaleNumber(
  text: string,
  locale?: Locale,
): number | null {
  const normalized = toAsciiDigits(
    text.normalize('NFKC').replace(INVISIBLES, ''),
  );
  if (normalized == null) {
    return null;
  }

  let rest = normalized.trim();
  let sign = 1;

  // Accounting negatives: spreadsheets write -1234 as (1,234).
  const accounting = /^\((.*)\)$/s.exec(rest);
  if (accounting) {
    sign = -1;
    rest = accounting[1].trim();
  }

  rest = stripCurrency(rest);

  // The sign lands on either end — RTL locales trail it, and Intl writes
  // U+2212 where a keyboard writes a hyphen.
  const leadingSign = new RegExp(`^([+${MINUS_SIGNS}])\\s*`).exec(rest);
  if (leadingSign) {
    sign = leadingSign[1] === '+' ? sign : -sign;
    rest = rest.slice(leadingSign[0].length);
  } else {
    const trailingSign = new RegExp(`\\s*([+${MINUS_SIGNS}])$`).exec(rest);
    if (trailingSign) {
      sign = trailingSign[1] === '+' ? sign : -sign;
      rest = rest.slice(0, rest.length - trailingSign[0].length);
    }
  }

  rest = stripCurrency(rest);

  let exponent = 0;
  const exponentMatch = /\s*[eE]\s*([+-]?\d+)$/.exec(rest);
  if (exponentMatch) {
    exponent = Number(exponentMatch[1]);
    rest = rest.slice(0, rest.length - exponentMatch[0].length);
  }

  const core = rest.trim();
  if (core === '') {
    return null;
  }

  const plain = toPlainNumber(core, locale);
  if (plain == null) {
    return null;
  }

  const magnitude = Number(plain);
  if (!Number.isFinite(magnitude)) {
    return null;
  }

  const scaled =
    exponent === 0
      ? magnitude
      : // 1.23 * 1e3 is 1229.9999999999998 in binary floating point, and a
        // field that commits that instead of 1230 has not round-tripped.
        Number((magnitude * 10 ** exponent).toPrecision(15));
  if (!Number.isFinite(scaled)) {
    return null;
  }
  const result = sign * scaled;
  return Object.is(result, -0) ? 0 : result;
}

function stripCurrency(text: string): string {
  let out = text.trim();
  if (CURRENCY.test(out.charAt(0))) {
    out = out.slice(1).trim();
  }
  if (CURRENCY.test(out.charAt(out.length - 1))) {
    out = out.slice(0, -1).trim();
  }
  return out;
}

/**
 * The text shown while the field is focused: the plain machine number in the
 * locale's decimal separator, so what a person sees mid-edit is what the
 * parser reads back on blur.
 */
export function formatEditableNumber(value: number, locale?: Locale): string {
  const {decimal} = getLocaleNumberSymbols(locale);
  const raw = String(value);
  return decimal === '.' ? raw : raw.replace('.', decimal);
}
