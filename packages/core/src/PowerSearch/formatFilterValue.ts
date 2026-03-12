/**
 * @file formatFilterValue.ts
 * @input OperatorValue, FilterValue, config
 * @output Formatted display string for a filter value
 * @position Pure utility; consumed by XDSPowerSearch token rendering
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 */

import type {
  OperatorValue,
  FilterValue,
  EnumItem,
  CustomOperatorValue,
} from './types';
import type {InternalConfig} from './useInternalConfig';

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
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

function formatDateRange(value: {start: unknown; end: unknown}): string {
  return 'date range';
}

export function formatFilterValue(
  _config: InternalConfig,
  operatorValue: OperatorValue,
  filterValue: FilterValue,
  maxLength: number,
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
      if (items.length === 0) return '';
      if (items.length === 1) return truncate(items[0], maxLength);
      const joined = items.join(', ');
      if (joined.length <= maxLength) return joined;
      return `${items.length} items`;
    }

    case 'enum_list': {
      const items = filterValue.value;
      if (items.length === 0) return '';
      if (operatorValue.type === 'enum_list') {
        const labels = items.map(v => formatEnumLabel(v, operatorValue.values));
        if (labels.length === 1) return truncate(labels[0], maxLength);
        const joined = labels.join(', ');
        if (joined.length <= maxLength) return joined;
        return `${labels.length} items`;
      }
      if (items.length === 1) return truncate(items[0], maxLength);
      return `${items.length} items`;
    }

    case 'entity_list': {
      const entities = filterValue.value;
      if (entities.length === 0) return '';
      if (entities.length === 1) return truncate(entities[0].label, maxLength);
      const joined = entities.map(e => e.label).join(', ');
      if (joined.length <= maxLength) return joined;
      return `${entities.length} entities`;
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
      return formatDateRange(filterValue.value);

    case 'custom':
      if (operatorValue.type === 'custom') {
        return truncate(
          (operatorValue as CustomOperatorValue).getString(filterValue.value),
          maxLength,
        );
      }
      return filterValue.value;

    case 'nested': {
      const count = filterValue.value.length;
      return count === 1 ? '1 filter' : `${count} filters`;
    }

    default:
      return '';
  }
}
