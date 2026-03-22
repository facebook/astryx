'use client';

/**
 * @file PowerSearchValueEditor.tsx
 * @input OperatorValue, FilterValue, onChange callback
 * @output Renders the appropriate editor for a filter value type
 * @position Sub-component; consumed by PowerSearchEditPopover
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 */


import React, {useCallback, useMemo} from 'react';
import type {
  OperatorValue,
  FilterValue,
  EnumItem,
  PowerSearchEntity,
} from './types';
import type {InternalConfig} from './useInternalConfig';
import type {XDSSearchableItem, XDSSearchSource} from '../Typeahead/types';
import type {ISODateString} from '../Calendar';
import type {ISOTimeString} from '../utils';

// Lazy import to avoid circular deps — these are all from the same package
import {XDSTextInput} from '../TextInput';
import {XDSNumberInput} from '../NumberInput';
import {XDSDateInput} from '../DateInput';
import {XDSTimeInput} from '../TimeInput';
import {XDSSelector} from '../Selector';
import {XDSTokenizer} from '../Tokenizer';

export interface PowerSearchValueEditorProps {
  operatorValue: OperatorValue;
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue, shouldSave?: boolean) => void;
  onEnter?: () => void;
  config: InternalConfig;
  isDisabled?: boolean;
  timezoneID?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function createStaticSource(
  items: XDSSearchableItem[],
): XDSSearchSource<XDSSearchableItem> {
  return {
    search(query: string) {
      const lower = query.toLowerCase();
      return items.filter(item => item.label.toLowerCase().includes(lower));
    },
    bootstrap() {
      return items;
    },
  };
}

function enumItemsToSearchableItems(
  values: ReadonlyArray<EnumItem>,
): XDSSearchableItem[] {
  return values.map(item => ({
    id: item.value,
    label: item.label,
  }));
}

// =============================================================================
// Individual Editors
// =============================================================================

function StringEditor({
  operatorValue,
  filterValue,
  onChange,
  onEnter,
}: {
  operatorValue: OperatorValue & {type: 'string'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue, shouldSave?: boolean) => void;
  onEnter?: () => void;
}) {
  const currentValue = filterValue?.type === 'string' ? filterValue.value : '';

  return (
    <XDSTextInput
      label="Value"
      isLabelHidden
      value={currentValue}
      placeholder="Enter value..."
      onChange={(value: string) => {
        onChange({type: 'string', value});
      }}
    />
  );
}

function StringListEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  operatorValue: OperatorValue & {type: 'string_list'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
}) {
  const currentValue: XDSSearchableItem[] = useMemo(() => {
    if (filterValue?.type !== 'string_list') return [];
    return filterValue.value.map(v => ({id: v, label: v}));
  }, [filterValue]);

  const source = useMemo<XDSSearchSource<XDSSearchableItem>>(() => {
    if (operatorValue.searchSource) {
      return operatorValue.searchSource;
    }
    // Free-text: accept anything typed
    return {
      search: () => [],
      bootstrap: () => [],
    };
  }, [operatorValue.searchSource]);

  return (
    <XDSTokenizer
      label="Values"
      isLabelHidden
      searchSource={source}
      value={currentValue}
      onChange={items => {
        onChange({
          type: 'string_list',
          value: items.map(item => item.label),
        });
      }}
      placeholder="Add values..."
      debounceMs={operatorValue.searchSource ? 150 : 0}
    />
  );
}

function IntegerEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  operatorValue: OperatorValue & {type: 'integer'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
}) {
  const currentValue =
    filterValue?.type === 'integer' ? filterValue.value : undefined;

  return (
    <XDSNumberInput
      label="Value"
      isLabelHidden
      value={currentValue ?? null}
      onChange={(value: number) => {
        onChange({type: 'integer', value});
      }}
      min={operatorValue.minValue}
      max={operatorValue.maxValue}
      units={operatorValue.units}
      isIntegerOnly
      placeholder="Enter number..."
    />
  );
}

function FloatEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  operatorValue: OperatorValue & {type: 'float'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
}) {
  const currentValue =
    filterValue?.type === 'float' ? filterValue.value : undefined;

  return (
    <XDSNumberInput
      label="Value"
      isLabelHidden
      value={currentValue ?? null}
      onChange={(value: number) => {
        onChange({type: 'float', value});
      }}
      min={operatorValue.minValue}
      max={operatorValue.maxValue}
      units={operatorValue.units}
      placeholder="Enter number..."
    />
  );
}

function TimeEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  operatorValue: OperatorValue & {type: 'time'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
}) {
  const currentValue =
    filterValue?.type === 'time'
      ? (filterValue.value as ISOTimeString)
      : undefined;

  return (
    <XDSTimeInput
      label="Time"
      isLabelHidden
      value={currentValue}
      onChange={value => {
        if (value != null) {
          onChange({type: 'time', value});
        }
      }}
      min={operatorValue.minValue as ISOTimeString | undefined}
      max={operatorValue.maxValue as ISOTimeString | undefined}
    />
  );
}

function DateAbsoluteEditor({
  filterValue,
  onChange,
}: {
  operatorValue: OperatorValue & {type: 'date_absolute'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
}) {
  // Convert unixSeconds to ISO date string for the date input
  const currentValue = useMemo(() => {
    if (filterValue?.type !== 'date_absolute') return undefined;
    const date = new Date(filterValue.unixSeconds * 1000);
    return date.toISOString().split('T')[0] as ISODateString;
  }, [filterValue]);

  return (
    <XDSDateInput
      label="Date"
      isLabelHidden
      value={currentValue}
      onChange={value => {
        if (value != null) {
          const unixSeconds = Math.floor(new Date(value).getTime() / 1000);
          onChange({type: 'date_absolute', unixSeconds});
        }
      }}
    />
  );
}

function DateRelativeEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  operatorValue: OperatorValue & {type: 'date_relative'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue, shouldSave?: boolean) => void;
}) {
  const currentValue =
    filterValue?.type === 'date_relative' ? filterValue.value : undefined;

  const options = useMemo(() => {
    const result: Array<{value: string; label: string}> = [];
    const units = [
      {unit: 'day', plural: 'days'},
      {unit: 'week', plural: 'weeks'},
      {unit: 'month', plural: 'months'},
    ];
    for (const {unit, plural} of units) {
      const amounts =
        unit === 'day'
          ? [1, 3, 7, 14, 30]
          : unit === 'week'
            ? [1, 2, 4]
            : [1, 3, 6, 12];
      for (const amount of amounts) {
        if (operatorValue.isPastAllowed !== false) {
          result.push({
            value: `${amount}${unit[0]}_ago`,
            label: `${amount} ${amount === 1 ? unit : plural} ago`,
          });
        }
        if (operatorValue.isFutureAllowed !== false) {
          result.push({
            value: `${amount}${unit[0]}_from_now`,
            label: `${amount} ${amount === 1 ? unit : plural} from now`,
          });
        }
      }
    }
    return result;
  }, [operatorValue.isPastAllowed, operatorValue.isFutureAllowed]);

  return (
    <XDSSelector
      label="Relative date"
      isLabelHidden
      options={options}
      value={currentValue}
      onChange={value => {
        onChange({type: 'date_relative', value}, true);
      }}
    />
  );
}

function DateRangeEditor({
  filterValue,
  onChange,
}: {
  operatorValue: OperatorValue & {type: 'date_range'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
}) {
  const startValue = useMemo(() => {
    if (filterValue?.type !== 'date_range') return undefined;
    const part = filterValue.value.start;
    if (part.type === 'ABSOLUTE') {
      return new Date(part.unixSeconds * 1000)
        .toISOString()
        .split('T')[0] as ISODateString;
    }
    return undefined;
  }, [filterValue]);

  const endValue = useMemo(() => {
    if (filterValue?.type !== 'date_range') return undefined;
    const part = filterValue.value.end;
    if (part.type === 'ABSOLUTE') {
      return new Date(part.unixSeconds * 1000)
        .toISOString()
        .split('T')[0] as ISODateString;
    }
    return undefined;
  }, [filterValue]);

  const handleStartChange = useCallback(
    (value: string | undefined) => {
      const startUnix = value
        ? Math.floor(new Date(value).getTime() / 1000)
        : 0;
      const existingEnd =
        filterValue?.type === 'date_range'
          ? filterValue.value.end
          : {type: 'NOW' as const};
      onChange({
        type: 'date_range',
        value: {
          start: {type: 'ABSOLUTE', unixSeconds: startUnix},
          end: existingEnd,
        },
      });
    },
    [filterValue, onChange],
  );

  const handleEndChange = useCallback(
    (value: string | undefined) => {
      const endUnix = value ? Math.floor(new Date(value).getTime() / 1000) : 0;
      const existingStart =
        filterValue?.type === 'date_range'
          ? filterValue.value.start
          : {type: 'NOW' as const};
      onChange({
        type: 'date_range',
        value: {
          start: existingStart,
          end: {type: 'ABSOLUTE', unixSeconds: endUnix},
        },
      });
    },
    [filterValue, onChange],
  );

  return (
    <>
      <XDSDateInput
        label="Start date"
        isLabelHidden
        value={startValue}
        onChange={handleStartChange}
      />
      <XDSDateInput
        label="End date"
        isLabelHidden
        value={endValue}
        onChange={handleEndChange}
      />
    </>
  );
}

function EnumEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  operatorValue: OperatorValue & {type: 'enum'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue, shouldSave?: boolean) => void;
}) {
  const currentValue =
    filterValue?.type === 'enum' ? filterValue.value : undefined;

  const options = useMemo(
    () =>
      operatorValue.values.map(item => ({
        value: item.value,
        label: item.label,
      })),
    [operatorValue.values],
  );

  return (
    <XDSSelector
      label="Value"
      isLabelHidden
      options={options}
      value={currentValue}
      onChange={value => {
        onChange({type: 'enum', value}, true);
      }}
    />
  );
}

function EnumListEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  operatorValue: OperatorValue & {type: 'enum_list'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
}) {
  const items = useMemo(
    () => enumItemsToSearchableItems(operatorValue.values),
    [operatorValue.values],
  );

  const source = useMemo(() => createStaticSource(items), [items]);

  const currentValue: XDSSearchableItem[] = useMemo(() => {
    if (filterValue?.type !== 'enum_list') return [];
    return filterValue.value.map(v => {
      const item = operatorValue.values.find(e => e.value === v);
      return {id: v, label: item?.label ?? v};
    });
  }, [filterValue, operatorValue.values]);

  return (
    <XDSTokenizer
      label="Values"
      isLabelHidden
      searchSource={source}
      value={currentValue}
      onChange={selectedItems => {
        onChange({
          type: 'enum_list',
          value: selectedItems.map(item => item.id),
        });
      }}
      placeholder="Select values..."
      hasEntriesOnFocus
      debounceMs={0}
    />
  );
}

function EntityListEditor({
  operatorValue,
  filterValue,
  onChange,
}: {
  operatorValue: OperatorValue & {type: 'entity_list'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
}) {
  const source = useMemo<XDSSearchSource<XDSSearchableItem>>(() => {
    if (operatorValue.searchSource) {
      return operatorValue.searchSource;
    }
    return {
      search: () => [],
      bootstrap: () => [],
    };
  }, [operatorValue.searchSource]);

  const currentValue: XDSSearchableItem[] = useMemo(() => {
    if (filterValue?.type !== 'entity_list') return [];
    return filterValue.value.map((entity: PowerSearchEntity) => ({
      id: entity.id,
      label: entity.label,
    }));
  }, [filterValue]);

  return (
    <XDSTokenizer
      label="Entities"
      isLabelHidden
      searchSource={source}
      value={currentValue}
      onChange={items => {
        onChange({
          type: 'entity_list',
          value: items.map(item => ({
            id: item.id,
            label: item.label,
          })),
        });
      }}
      placeholder="Search..."
      debounceMs={operatorValue.searchSource ? 150 : 0}
    />
  );
}

function CustomEditor({
  operatorValue,
  filterValue,
  onChange,
  isDisabled,
}: {
  operatorValue: OperatorValue & {type: 'custom'};
  filterValue: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
  isDisabled?: boolean;
}) {
  const currentValue =
    filterValue?.type === 'custom' ? filterValue.value : null;
  const EditorComponent = operatorValue.Editor;

  return (
    <EditorComponent
      isDisabled={isDisabled}
      onChange={value => {
        if (value != null) {
          onChange({type: 'custom', value});
        }
      }}
      placeholder="Enter value..."
      value={currentValue}
    />
  );
}

// =============================================================================
// Main Dispatcher
// =============================================================================

export function PowerSearchValueEditor({
  operatorValue,
  filterValue,
  onChange,
  onEnter,
  isDisabled,
}: PowerSearchValueEditorProps) {
  switch (operatorValue.type) {
    case 'empty':
      return null;

    case 'string':
      return (
        <StringEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
          onEnter={onEnter}
        />
      );

    case 'string_list':
      return (
        <StringListEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
        />
      );

    case 'integer':
      return (
        <IntegerEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
        />
      );

    case 'float':
      return (
        <FloatEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
        />
      );

    case 'time':
      return (
        <TimeEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
        />
      );

    case 'date_absolute':
      return (
        <DateAbsoluteEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
        />
      );

    case 'date_relative':
      return (
        <DateRelativeEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
        />
      );

    case 'date_range':
      return (
        <DateRangeEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
        />
      );

    case 'enum':
      return (
        <EnumEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
        />
      );

    case 'enum_list':
      return (
        <EnumListEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
        />
      );

    case 'entity_list':
      return (
        <EntityListEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
        />
      );

    case 'custom':
      return (
        <CustomEditor
          operatorValue={operatorValue}
          filterValue={filterValue}
          onChange={onChange}
          isDisabled={isDisabled}
        />
      );

    case 'nested':
      // Nested filters are complex — simplified v1 just shows a message
      return null;

    default:
      return null;
  }
}
