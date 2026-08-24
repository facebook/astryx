// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {parseLocaleNumber} from './numberParser';

const NBSP = '\u00A0';
const NARROW_NBSP = '\u202F';
const APOSTROPHE = '\u2019';

/**
 * The contract, enumerated. A row is `[input, locale, expected]`, and `null`
 * means the field stays visibly invalid rather than committing a guess.
 */
const CORPUS: [string, string, number | null][] = [
  // Grouped — the case this exists for, and it holds in every locale because
  // a repeated separator with three digits after it cannot be a decimal point.
  ['1,234,234,234', 'en-US', 1234234234],
  ['1,234,234,234', 'de-DE', 1234234234],
  ['1,234,234,234', 'fr-FR', 1234234234],
  ['1,234,234,234', 'ar-SA', 1234234234],
  ['1.234.234.234', 'de-DE', 1234234234],
  ['1.234.234.234', 'en-US', 1234234234],
  [`1${NARROW_NBSP}234${NARROW_NBSP}234${NARROW_NBSP}234`, 'fr-FR', 1234234234],
  [`1${NBSP}234${NBSP}234`, 'fr-FR', 1234234],
  [`1${NBSP}234`, 'en-US', 1234],
  [`1${APOSTROPHE}234${APOSTROPHE}234`, 'de-CH', 1234234],
  ["1'234'234", 'de-CH', 1234234],
  ['1,234', 'en-US', 1234],
  ['1,234', 'de-DE', 1.234],

  // Indian lakh grouping, derived from the locale's own group sizes.
  ['12,34,567', 'en-IN', 1234567],
  ['12,34,567', 'en-US', null],

  // Ragged grouping is a typo, not a number: the last group is not three.
  ['1,23,4', 'en-US', null],
  ['1,2345', 'en-US', null],
  ['12 34', 'en-US', null],

  // One separator, one meaning per locale, and no meaning across them.
  ['1,5', 'de-DE', 1.5],
  ['1,5', 'en-US', null],
  ['1.5', 'en-US', 1.5],
  ['1.5', 'de-DE', null],

  // Decimals and signs.
  ['1,234.56', 'en-US', 1234.56],
  ['1.234,56', 'de-DE', 1234.56],
  ['1,234.56', 'de-DE', null],
  ['-1,234.56', 'en-US', -1234.56],
  ['+7', 'en-US', 7],
  ['-7', 'en-US', -7],
  ['7-', 'ar-SA', -7],
  ['.5', 'en-US', 0.5],
  ['5.', 'en-US', 5],
  ['-', 'en-US', null],
  ['', 'en-US', null],
  ['   ', 'en-US', null],

  // Spreadsheet cells arrive with their whitespace attached.
  ['  42  ', 'en-US', 42],
  ['\t1,234\n', 'en-US', 1234],
  ['1,234\n5,678', 'en-US', null],

  // Digit scripts, derived from \p{Nd} rather than enumerated.
  ['١٢٣', 'ar-SA', 123],
  ['۱۲۳', 'fa-IR', 123],
  ['१२३', 'hi-IN', 123],
  ['１２３', 'ja-JP', 123],
  ['١,٢٣٤', 'en-US', 1234],
  ['٣٫٥', 'ar-SA', 3.5],

  // Currency decorates the number without changing its magnitude, so the
  // symbol is dropped and the separators still decide. A number written for
  // another locale still refuses.
  ['$1,234.56', 'en-US', 1234.56],
  ['£1,234', 'en-US', 1234],
  ['1.234,56 €', 'de-DE', 1234.56],
  ['1.234,56 €', 'en-US', null],
  ['-$1,234', 'en-US', -1234],

  // A unit suffix is not dropped: `B` and `k` carry magnitude, so guessing
  // which trailing letters are inert is how a wrong number gets committed.
  ['1,234 GB', 'en-US', null],
  ['72°F', 'en-US', null],
  ['1,234 kg', 'en-US', null],

  // Accounting negatives.
  ['(1,234)', 'en-US', -1234],
  ['($1,234.50)', 'en-US', -1234.5],
  ['(1,234', 'en-US', null],

  // Typographic minus signs.
  ['\u22121234', 'en-US', -1234],
  ['\u20131234', 'en-US', -1234],

  // Exponents, including the shape a spreadsheet exports.
  ['1.23E+09', 'en-US', 1230000000],
  ['1.23e9', 'en-US', 1230000000],
  ['1.5e-3', 'en-US', 0.0015],
  ['1e', 'en-US', null],

  // Invisible characters Excel and Sheets attach.
  ['\uFEFF1,234', 'en-US', 1234],
  ['1,234\u200B', 'en-US', 1234],
  ['\u200E1,234', 'en-US', 1234],

  // Junk.
  ['NaN', 'en-US', null],
  ['Infinity', 'en-US', null],
  ['abc', 'en-US', null],
  ['12abc', 'en-US', null],
  ['1/2', 'en-US', null],
  ['1 234 (approx)', 'en-US', null],
  ['--5', 'en-US', null],
  ['1..234', 'en-US', null],
];

describe('parseLocaleNumber', () => {
  it.each(CORPUS)('parses %j in %s', (input, locale, expected) => {
    expect(parseLocaleNumber(input, locale)).toBe(expected);
  });

  it('reads back the grouping every locale writes', () => {
    for (const locale of [
      'en-US',
      'de-DE',
      'fr-FR',
      'de-CH',
      'en-IN',
      'ar-SA',
    ]) {
      const text = new Intl.NumberFormat(locale).format(1234234234);
      expect(parseLocaleNumber(text, locale)).toBe(1234234234);
    }
  });
});
