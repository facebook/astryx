// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file formatFilterValue.ts
 * @input OperatorValue, FilterValue, config
 * @output Formatted display string for a filter value
 * @position Pure utility; consumed by PowerSearch token rendering
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 */

import type {OperatorValue, FilterValue, EnumItem} from './types';
import type {InternalConfig} from './useInternalConfig';
import type {TranslatorFn} from '../i18n';

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 1) + '\u2026';
}

function formatEnumLabel(
  value: string,
  enumValues: ReadonlyArray<EnumItem>,
): string {
  const item = enumValues.find(v => v.value === value);
  return item?.label ?? value;
}

function formatNumber(value: number, units?: string): string {
  const formatted = new Intl.NumberFormat().format(value);
  return units ? `${formatted} ${units}` : formatted;
}

function formatDateAbsolute(unixSeconds: number, timezoneID?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...(timezoneID ? {timeZone: timezoneID} : {}),
  };
  return new Intl.DateTimeFormat(undefined, options).format(unixSeconds * 1000);
}

function formatRelativeDate(value: string): string {
  // value is stored as a descriptive string like "7d" or "1w"
  return value;
}

function formatDateRange(
  _value: {start: unknown; end: unknown},
  t: TranslatorFn,
): string {
  return t('@astryx.powersearch.valueEditor.dateRange');
}

export function formatFilterValue(
  _config: InternalConfig,
  operatorValue: OperatorValue,
  filterValue: FilterValue,
  maxLength: number,
  t: TranslatorFn,
  timezoneID?: string,
): string {
  switch (filterValue.type) {
    case 'empty':
      return '';

    case 'string':
      return truncate(filterValue.value, maxLength);

    case 'integer':
      return formatNumber(
        filterValue.value,
        operatorValue.type === 'integer' ? operatorValue.units : undefined,
      );

    case 'float':
      return formatNumber(
        filterValue.value,
        operatorValue.type === 'float' ? operatorValue.units : undefined,
      );

    case 'enum':
      if (operatorValue.type === 'enum') {
        return truncate(
          formatEnumLabel(filterValue.value, operatorValue.values),
          maxLength,
        );
      }
      return truncate(filterValue.value, maxLength);

    case 'string_list': {
      const items = filterValue.value;
      if (items.length === 0) {
        return '';
      }
      if (items.length === 1) {
        return truncate(items[0], maxLength);
      }
      const joined = items.join(', ');
      if (joined.length <= maxLength) {
        return joined;
      }
      return t('@astryx.powersearch.valueEditor.itemsCount', {
        count: items.length,
      });
    }

    case 'enum_list': {
      const items = filterValue.value;
      if (items.length === 0) {
        return '';
      }
      if (operatorValue.type === 'enum_list') {
        const labels = items.map(v => formatEnumLabel(v, operatorValue.values));
        if (labels.length === 1) {
          return truncate(labels[0], maxLength);
        }
        const joined = labels.join(', ');
        if (joined.length <= maxLength) {
          return joined;
        }
        return t('@astryx.powersearch.valueEditor.itemsCount', {
          count: labels.length,
        });
      }
      if (items.length === 1) {
        return truncate(items[0], maxLength);
      }
      return t('@astryx.powersearch.valueEditor.itemsCount', {
        count: items.length,
      });
    }

    case 'entity_list': {
      const entities = filterValue.value;
      if (entities.length === 0) {
        return '';
      }
      if (entities.length === 1) {
        return truncate(entities[0].label, maxLength);
      }
      const joined = entities.map(e => e.label).join(', ');
      if (joined.length <= maxLength) {
        return joined;
      }
      return t('@astryx.powersearch.valueEditor.entitiesCount', {
        count: entities.length,
      });
    }

    case 'time':
      return filterValue.value;

    case 'date_absolute':
      return truncate(
        formatDateAbsolute(filterValue.unixSeconds, timezoneID),
        maxLength,
      );

    case 'date_relative':
      return formatRelativeDate(filterValue.value);

    case 'date_range':
      return formatDateRange(filterValue.value, t);

    case 'custom':
      if (operatorValue.type === 'custom') {
        return truncate(operatorValue.getString(filterValue.value), maxLength);
      }
      return filterValue.value;

    case 'nested': {
      const count = filterValue.value.length;
      return t('@astryx.powersearch.valueEditor.filtersCount', {count});
    }

    default:
      return '';
  }
}
