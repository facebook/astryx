// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @fileoverview The text a PowerSearch filter token shows for a value.
 *
 * @input `OperatorValue`, `FilterValue`, a width budget, and the locale.
 * @output `formatTokenValueText` — one string, or null for an empty value.
 * @position Shared by the token itself (`PowerSearch.tsx`) and the sheet
 * presentation's Filters rows and removal announcement
 * (`PowerSearchBottomSheet.tsx`), so every reading of a value on the field
 * uses the same words and the same zone handling.
 */

import type {OperatorValue, FilterValue, EnumItem} from './types';
import type {Locale, TranslatorFn} from '../i18n';
import {truncateCharacters} from '../utils/characters';
import {
  formatDateAbsoluteCompact,
  formatSharedList,
  formatSharedNumber,
} from './formatFilterValue';

function truncateString(value: string, limit: number): string {
  // Same semantics as before — strings within limit + 3 pass through, longer
  // ones cut to limit + '...' — but counted in characters, not code units.
  return truncateCharacters(value, limit + 3, '...');
}

function getEnumLabel(values: ReadonlyArray<EnumItem>, value: string): string {
  return values.find(v => v.value === value)?.label ?? value;
}

// Intl's maximum fraction cap: no number the row formats is rounded.
const MAX_FRACTION_DIGITS = 100;

// Whether a locale writes a number with the token's own numerals: Latin
// digits and a `.` decimal mark, so `String(value)` is already the locale's
// reading. Probed once per locale through the shared number helper.
const tokenNumeralLocales = new Map<string, boolean>();
function usesTokenNumerals(locale: Locale): boolean {
  let uses = tokenNumeralLocales.get(locale);
  if (uses == null) {
    uses =
      formatSharedNumber(1234567.5, locale, {
        useGrouping: false,
        maximumFractionDigits: MAX_FRACTION_DIGITS,
      }) === '1234567.5';
    tokenNumeralLocales.set(locale, uses);
  }
  return uses;
}

// A number as the token reads it (`component:PowerSearch` FR12): where the
// locale's digits and decimal mark are the token's, the token's own text —
// `String(value)`, so `1e21`, `1e-7`, and `-0` read as `1e+21`, `1e-7`, and
// `0`, exactly as on the token; elsewhere the locale's digits and decimal
// mark with no grouping and no rounding — the fraction cap is Intl's maximum,
// so a value as small as `1e-21` keeps its digits — which differs from the
// token only in notation.
function formatNumberAsToken(value: number, locale: Locale): string {
  return usesTokenNumerals(locale)
    ? String(value)
    : formatSharedNumber(value, locale, {
        useGrouping: false,
        maximumFractionDigits: MAX_FRACTION_DIGITS,
      });
}

// The summaries, lists, and numbers the token writes as English literals, and
// the locale-aware readings of the same: with a translator (the sheet
// presentation's rows and announcements) the summaries resolve through the
// catalog, lists through the provider locale's list format, and numbers
// through its number format (`architecture:internationalization` INV1a,
// INV8); without one they stay the token's own literals. In English the two
// read identically.
function itemsSummary(count: number, t: TranslatorFn | undefined): string {
  return t
    ? t('@astryx.powersearch.valueEditor.itemsCount', {count})
    : `${count} items`;
}

function formatListText(
  labels: ReadonlyArray<string>,
  maxLength: number,
  locale: Locale,
  t: TranslatorFn | undefined,
): string | null {
  if (labels.length === 0) {
    return null;
  }
  if (labels.length === 1) {
    return truncateString(labels[0], maxLength);
  }
  const totalLength = labels.reduce((sum, s) => sum + s.length, 0);
  if (totalLength > maxLength) {
    return itemsSummary(labels.length, t);
  }
  return t ? formatSharedList(labels, locale) : labels.join(', ');
}

/**
 * The text a filter token shows for a value: the one place that decides how
 * a value reads on the field, so every other reading of the same value —
 * the sheet presentation's Filters rows and its removal announcement — can
 * use the same words and the same zone handling. `maxLength` is the token's
 * width budget; pass `Number.MAX_SAFE_INTEGER` for the untruncated text.
 * With `t`, the list, date-range and nested summaries resolve through the
 * catalog (`@astryx.powersearch.valueEditor.*`); without it they are the
 * token's own literals.
 */
export function formatTokenValueText(
  operatorValue: OperatorValue,
  filterValue: FilterValue,
  maxLength: number,
  locale: Locale,
  t?: TranslatorFn,
): string | null {
  switch (filterValue.type) {
    case 'empty':
      return null;

    case 'string':
      return truncateString(filterValue.value, maxLength);

    case 'integer':
    case 'float':
      return t
        ? formatNumberAsToken(filterValue.value, locale)
        : String(filterValue.value);

    case 'enum':
      if (operatorValue.type === 'enum') {
        return truncateString(
          getEnumLabel(operatorValue.values, filterValue.value),
          maxLength,
        );
      }
      return truncateString(filterValue.value, maxLength);

    case 'string_list':
      return formatListText(filterValue.value, maxLength, locale, t);

    case 'enum_list': {
      const items = filterValue.value;
      if (items.length === 0) {
        return null;
      }
      if (operatorValue.type === 'enum_list') {
        return formatListText(
          items.map(v => getEnumLabel(operatorValue.values, v)),
          maxLength,
          locale,
          t,
        );
      }
      if (items.length === 1) {
        return truncateString(items[0], maxLength);
      }
      return itemsSummary(items.length, t);
    }

    case 'entity_list':
      return formatListText(
        filterValue.value.map(e => e.label),
        maxLength,
        locale,
        t,
      );

    case 'time':
      return filterValue.value;

    case 'date_absolute':
      return truncateString(
        formatDateAbsoluteCompact(filterValue.unixSeconds, locale),
        maxLength,
      );

    case 'date_relative':
      return truncateString(filterValue.value, maxLength);

    case 'date_range':
      return t ? t('@astryx.powersearch.valueEditor.dateRange') : 'date range';

    case 'custom':
      if (operatorValue.type === 'custom') {
        return truncateString(
          operatorValue.getString(filterValue.value),
          maxLength,
        );
      }
      return filterValue.value;

    case 'nested': {
      const count = filterValue.value.length;
      if (t) {
        return t('@astryx.powersearch.valueEditor.filtersCount', {count});
      }
      return count === 1 ? '1 filter' : `${count} filters`;
    }

    default:
      return null;
  }
}
