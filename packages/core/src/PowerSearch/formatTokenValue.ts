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
      // The provider locale's digits and decimal mark, but no grouping and no
      // rounding, so in English the row reads exactly as the token does
      // (`1234`, `2.3456`).
      return t
        ? formatSharedNumber(filterValue.value, locale, {
            useGrouping: false,
            maximumFractionDigits: 20,
          })
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
