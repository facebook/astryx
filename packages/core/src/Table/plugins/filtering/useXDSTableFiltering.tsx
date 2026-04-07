'use client';

/**
 * @file useXDSTableFiltering.tsx
 * @input React, types, XDS components, theme tokens
 * @output Exports useXDSTableFiltering hook and filter type definitions
 * @position Filtering plugin; consumed by XDSTable via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (filtering documentation)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {
  createContext,
  useContext,
  useRef,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars, radiusVars} from '../../../theme/tokens.stylex';
import {XDSIcon} from '../../../Icon';
import {XDSButton} from '../../../Button';
import {XDSPopover} from '../../../Popover';
import {XDSTextInput} from '../../../TextInput';
import {XDSNumberInput} from '../../../NumberInput';
import {XDSDateInput} from '../../../DateInput';
import type {ISODateString} from '../../../Calendar';
import {XDSTimeInput} from '../../../TimeInput';
import type {ISOTimeString} from '../../../utils/timeParser';
import {XDSSelector} from '../../../Selector';
import {XDSMultiSelector} from '../../../MultiSelector';
import {XDSTokenizer} from '../../../Tokenizer';
import type {
  TablePlugin,
  XDSTableColumn,
  HeaderCellRenderProps,
} from '../../types';
import {proportional} from '../../columnUtils';
import type {
  PowerSearchConfig,
  PowerSearchField,
  PowerSearchOperator,
  PowerSearchFilter,
  FilterValue,
  OperatorValue,
} from '../../../PowerSearch/types';

// =============================================================================
// Filter Value Types
// =============================================================================

/** Text filter: free-form string search */
export type XDSTableFilterTextValue = string;

/** Number filter: exact numeric match */
export type XDSTableFilterNumberValue = number;

/** Number range filter: min/max bounds (either or both may be set) */
export interface XDSTableFilterNumberRangeValue {
  min?: number;
  max?: number;
}

/** Selector filter: single selected value */
export type XDSTableFilterSelectorValue = string;

/** Multi-selector filter: set of selected values */
export type XDSTableFilterMultiSelectorValue = string[];

/** Date filter: ISO date string (YYYY-MM-DD) */
export type XDSTableFilterDateValue = string;

/** Time filter: ISO time string (HH:MM) */
export type XDSTableFilterTimeValue = string;

/** String list filter: array of free-form string tags */
export type XDSTableFilterStringListValue = string[];

/** Union of all filter value types */
export type XDSTableFilterValue =
  | XDSTableFilterTextValue
  | XDSTableFilterNumberValue
  | XDSTableFilterNumberRangeValue
  | XDSTableFilterSelectorValue
  | XDSTableFilterMultiSelectorValue
  | XDSTableFilterDateValue
  | XDSTableFilterTimeValue
  | XDSTableFilterStringListValue;

// =============================================================================
// Filter Type Discriminated Union (per-column config)
// =============================================================================

/** Option for selector-based filters. */
export interface XDSTableFilterOption {
  /** The value stored when this option is selected */
  value: string;
  /** Display label. Defaults to `value` if omitted. */
  label?: string;
}

/** Text filter — free-form text input. */
export interface XDSTableFilterTypeText {
  type: 'text';
  /** Placeholder text for the input. @default 'Filter <column header>' */
  placeholder?: string;
}

/** Number filter — numeric input for exact match. */
export interface XDSTableFilterTypeNumber {
  type: 'number';
  /** Placeholder text. @default 'Filter <column header>' */
  placeholder?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment. @default 1 */
  step?: number;
}

/** Number range filter — two numeric inputs for min/max bounds. */
export interface XDSTableFilterTypeNumberRange {
  type: 'number-range';
  /** Placeholder for min input. @default 'Min' */
  minPlaceholder?: string;
  /** Placeholder for max input. @default 'Max' */
  maxPlaceholder?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment. @default 1 */
  step?: number;
}

/** Selector filter — single-select dropdown. */
export interface XDSTableFilterTypeSelector {
  type: 'selector';
  /** Available options */
  options: XDSTableFilterOption[];
  /** Placeholder when no value is selected. @default 'All' */
  placeholder?: string;
}

/** Multi-selector filter — multi-select checkboxes. */
export interface XDSTableFilterTypeMultiSelector {
  type: 'multi-selector';
  /** Available options */
  options: XDSTableFilterOption[];
  /** Show a "Select all" option. @default true */
  hasSelectAll?: boolean;
  /** Enable typeahead search within options. @default false */
  isSearchable?: boolean;
  /** Placeholder when no values are selected. @default 'All' */
  placeholder?: string;
}

/** Date filter — date picker input (ISO date string). */
export interface XDSTableFilterTypeDate {
  type: 'date';
  /** Placeholder text. @default 'Filter <column header>' */
  placeholder?: string;
  /** Minimum allowed date (ISO string) */
  min?: string;
  /** Maximum allowed date (ISO string) */
  max?: string;
}

/** Time filter — time picker input (ISO time string). */
export interface XDSTableFilterTypeTime {
  type: 'time';
  /** Placeholder text. @default 'Filter <column header>' */
  placeholder?: string;
  /** Minimum allowed time */
  min?: string;
  /** Maximum allowed time */
  max?: string;
}

/** String list filter — tokenizer for free-form string tags. */
export interface XDSTableFilterTypeStringList {
  type: 'string-list';
  /** Placeholder text. @default 'Add...' */
  placeholder?: string;
}

/** Discriminated union of all filter type configs. */
export type XDSTableFilterType =
  | XDSTableFilterTypeText
  | XDSTableFilterTypeNumber
  | XDSTableFilterTypeNumberRange
  | XDSTableFilterTypeSelector
  | XDSTableFilterTypeMultiSelector
  | XDSTableFilterTypeDate
  | XDSTableFilterTypeTime
  | XDSTableFilterTypeStringList;

/**
 * Reference to a PowerSearch field.
 * Instead of defining the filter inline, point to a field in a shared
 * `PowerSearchConfig`. The plugin resolves the operator's value type
 * and renders the appropriate control.
 *
 * - **String form** — field key only, uses the field's `defaultOperator`:
 *   `filter: 'status'`
 *
 * - **Object form** — field key + explicit operator:
 *   `filter: { field: 'status', operator: 'is_not' }`
 *
 * Both require `searchConfig` on the plugin config.
 */
export interface XDSTableFilterFieldRef {
  /** Key of the PowerSearchField in the searchConfig. */
  field: string;
  /**
   * Key of the operator on that field. When omitted, uses the field's
   * `defaultOperator` or the first operator.
   */
  operator?: string;
}

// =============================================================================
// PowerSearch → Table Filter Resolution
// =============================================================================

/**
 * Resolve the operator for a PowerSearch field.
 * Uses the specified operator key, the field's defaultOperator, or the first.
 */
function resolveOperator(
  field: PowerSearchField,
  operatorKey?: string,
): PowerSearchOperator | undefined {
  if (operatorKey) {
    return field.operators.find(o => o.key === operatorKey);
  }
  if (field.defaultOperator) {
    return field.operators.find(o => o.key === field.defaultOperator);
  }
  return field.operators[0];
}

/**
 * Convert a PowerSearch OperatorValue to the table filter's XDSTableFilterType.
 *
 * Maps:
 * - string → text
 * - integer / float → number
 * - enum → selector
 * - enum_list → multi-selector
 *
 * Unsupported operator value types (date, entity_list, nested, custom, etc.)
 * return undefined — the column is treated as non-filterable.
 */
function operatorValueToFilterType(
  opValue: OperatorValue,
): XDSTableFilterType | undefined {
  switch (opValue.type) {
    case 'string':
      return {type: 'text'};
    case 'integer':
      return {
        type: 'number',
        min: opValue.minValue,
        max: opValue.maxValue,
        step: 1,
      };
    case 'float':
      return {
        type: 'number',
        min: opValue.minValue,
        max: opValue.maxValue,
      };
    case 'enum':
      return {
        type: 'selector',
        options: opValue.values.map(v => ({value: v.value, label: v.label})),
      };
    case 'enum_list':
      return {
        type: 'multi-selector',
        options: opValue.values.map(v => ({value: v.value, label: v.label})),
      };
    case 'date_absolute':
      return {type: 'date'};
    case 'time':
      return {type: 'time'};
    case 'string_list':
    case 'entity_list':
      return {type: 'string-list'};
    default:
      // date_relative, date_range, nested, custom, empty —
      // no simple single-control equivalent yet
      return undefined;
  }
}

/**
 * Resolve a column's filter field reference to a concrete filter type.
 *
 * - String → field key, uses defaultOperator.
 * - Object with `field` → look up field + optional operator.
 * - Returns undefined if the field/operator can't be resolved.
 */
function resolveFilterConfig(
  filter: XDSTableFilterFieldRef | string,
  searchConfig: PowerSearchConfig,
): XDSTableFilterType | undefined {
  const fieldKey = typeof filter === 'string' ? filter : filter.field;
  const operatorKey = typeof filter === 'string' ? undefined : filter.operator;

  const field = searchConfig.fields.find(f => f.key === fieldKey);
  if (!field) return undefined;

  const operator = resolveOperator(field, operatorKey);
  if (!operator) return undefined;

  return operatorValueToFilterType(operator.value);
}

/**
 * Convert table filter state to PowerSearchFilter[] for use with `applyFilters`.
 *
 * Maps each non-empty entry in the filter state to a `PowerSearchFilter`,
 * resolving the field and operator from the column config + searchConfig.
 * This bridges the table filtering UI with PowerSearch's client-side
 * filter engine — define filters once, apply everywhere.
 *
 * @example
 * ```
 * const { config, applyFilters } = usePowerSearchConfig(defs);
 * const searchFilters = toSearchFilters(filters, columns, config);
 * const filteredData = applyFilters(searchFilters, data);
 * ```
 */
export function toSearchFilters<T extends Record<string, unknown>>(
  filters: XDSTableFilterState,
  columns: ReadonlyArray<{
    key: string;
    filter?: XDSTableFilterFieldRef | string;
  }>,
  searchConfig: PowerSearchConfig,
): PowerSearchFilter[] {
  const result: PowerSearchFilter[] = [];

  for (const col of columns) {
    if (!col.filter) continue;
    const value = filters[col.key];
    if (value == null) continue;

    const fieldKey =
      typeof col.filter === 'string' ? col.filter : col.filter.field;
    const operatorKey =
      typeof col.filter === 'string' ? undefined : col.filter.operator;

    const field = searchConfig.fields.find(f => f.key === fieldKey);
    if (!field) continue;

    const operator = resolveOperator(field, operatorKey);
    if (!operator) continue;

    const filterValue = tableValueToFilterValue(value, operator.value);
    if (!filterValue) continue;

    result.push({field: fieldKey, operator: operator.key, value: filterValue});
  }

  return result;
}

/**
 * Convert a table filter value to a PowerSearch FilterValue
 * based on the operator's value type.
 */
function tableValueToFilterValue(
  value: XDSTableFilterValue,
  opValue: OperatorValue,
): FilterValue | undefined {
  switch (opValue.type) {
    case 'string':
      return typeof value === 'string' ? {type: 'string', value} : undefined;
    case 'integer':
      return typeof value === 'number' ? {type: 'integer', value} : undefined;
    case 'float':
      return typeof value === 'number' ? {type: 'float', value} : undefined;
    case 'enum':
      return typeof value === 'string' ? {type: 'enum', value} : undefined;
    case 'enum_list':
      return Array.isArray(value)
        ? {type: 'enum_list', value: value as string[]}
        : undefined;
    case 'date_absolute':
      return typeof value === 'string'
        ? {
            type: 'date_absolute',
            unixSeconds: Math.floor(new Date(value).getTime() / 1000),
          }
        : undefined;
    case 'time':
      return typeof value === 'string' ? {type: 'time', value} : undefined;
    case 'string_list':
      return Array.isArray(value)
        ? {type: 'string_list', value: value as string[]}
        : undefined;
    case 'entity_list':
      return Array.isArray(value)
        ? {
            type: 'entity_list',
            value: (value as string[]).map(id => ({id, label: id})),
          }
        : undefined;
    default:
      return undefined;
  }
}

// =============================================================================
// Filter State
// =============================================================================

/**
 * Complete filter state — a map from column key to filter value.
 * Missing keys or `undefined` values mean "no filter applied" for that column.
 *
 * @example
 * ```
 * const filters: XDSTableFilterState = {
 *   name: 'alice',
 *   status: 'active',
 *   age: { min: 18, max: 65 },
 *   tags: ['admin', 'user'],
 * };
 * ```
 */
export type XDSTableFilterState = Record<
  string,
  XDSTableFilterValue | undefined
>;

/**
 * Display variant for the filter UI.
 *
 * - `'popover'` — filter icon in header; clicking opens a popover with the filter control
 * - `'inline'` — filter control rendered directly below header text inside the header cell
 * - `'inline-compact'` — same as inline but with compact-sized controls
 */
export type XDSTableFilterVariant = 'popover' | 'inline' | 'inline-compact';

// =============================================================================
// Hook Config
// =============================================================================

/**
 * Configuration for useXDSTableFiltering.
 *
 * @example
 * ```
 * const [filters, setFilters] = useState<XDSTableFilterState>({});
 *
 * const filterPlugin = useXDSTableFiltering({
 *   filters,
 *   onFilterChange: (columnKey, value) => {
 *     setFilters(prev => {
 *       const next = { ...prev };
 *       if (value == null) {
 *         delete next[columnKey];
 *       } else {
 *         next[columnKey] = value;
 *       }
 *       return next;
 *     });
 *   },
 * });
 *
 * <XDSTable plugins={[filterPlugin]} ... />
 * ```
 */
export interface UseXDSTableFilteringConfig {
  /** Current filter state — map from column key to filter value. */
  filters: XDSTableFilterState;
  /** Called when the user changes a filter value. `null` clears the filter. */
  onFilterChange: (
    columnKey: string,
    value: XDSTableFilterValue | null,
  ) => void;
  /**
   * Display variant for filter controls.
   *
   * @default 'popover'
   */
  variant?: XDSTableFilterVariant;
  /**
   * PowerSearch configuration that defines the available filter fields.
   * Columns reference fields by key; the plugin resolves the operator's
   * value type and renders the matching control.
   *
   * Use `createPowerSearchConfig` or `usePowerSearchConfig` to build this
   * from field definitions — the same config can be shared with
   * `XDSPowerSearch` for a unified filtering experience.
   */
  searchConfig: PowerSearchConfig;
}

// =============================================================================
// Filter Store & Context
// =============================================================================

interface FilterStore {
  getConfig: () => UseXDSTableFilteringConfig;
}

const FilterStoreContext = createContext<FilterStore | null>(null);

/** Variant is stable per plugin instance — kept in a separate context so
 *  slot components can read it without going through the mutable store. */
const FilterVariantContext = createContext<XDSTableFilterVariant>('popover');

// =============================================================================
// Styles
// =============================================================================

const filterStyles = stylex.create({
  afterPopover: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  afterInline: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    marginTop: spacingVars['--spacing-1'],
    minWidth: 0,
  },
  triggerButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: radiusVars['--radius-element'],
    flexShrink: 0,
    // Minimum 44px touch target on coarse pointer devices (iOS guideline).
    '@media (pointer: coarse)': {
      minWidth: '44px',
      minHeight: '44px',
    },
  },
  triggerInactive: {
    opacity: {
      default: 0.35,
      ':is(th:hover *)': 1,
      ':focus-visible': 1,
    },
  },
  triggerActive: {
    opacity: 1,
  },
  popoverContent: {
    width: '240px',
  },
  popoverActions: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    marginTop: spacingVars['--spacing-2'],
  },
  popoverActionsSpacer: {
    flex: 1,
  },
  numberRangeRow: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
  },
  placeholder: {
    height: '32px',
  },
  placeholderCompact: {
    height: '28px',
  },
});

// =============================================================================
// Filter Control Components
// =============================================================================

function TextFilterControl({
  columnKey,
  header,
  filterConfig,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterTypeText;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const config = store.getConfig();
  const value = config.filters[columnKey];
  const strValue = typeof value === 'string' ? value : '';

  return (
    <XDSTextInput
      label={`Filter ${header}`}
      isLabelHidden
      value={strValue}
      onChange={(newValue: string) => {
        store
          .getConfig()
          .onFilterChange(columnKey, newValue === '' ? null : newValue);
      }}
      placeholder={filterConfig.placeholder ?? `Filter ${header}`}
      size={size}
      hasClear={hasClear}
    />
  );
}

function NumberFilterControl({
  columnKey,
  header,
  filterConfig,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterTypeNumber;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const config = store.getConfig();
  const value = config.filters[columnKey];
  const numValue = typeof value === 'number' ? value : null;

  const handleChange = useCallback(
    (newValue: number | null) => {
      store.getConfig().onFilterChange(columnKey, newValue);
    },
    [store, columnKey],
  );

  if (hasClear) {
    return (
      <XDSNumberInput
        label={`Filter ${header}`}
        isLabelHidden
        value={numValue}
        onChange={handleChange}
        placeholder={filterConfig.placeholder ?? `Filter ${header}`}
        min={filterConfig.min ?? null}
        max={filterConfig.max ?? null}
        step={filterConfig.step ?? null}
        size={size}
        hasClear
      />
    );
  }

  return (
    <XDSNumberInput
      label={`Filter ${header}`}
      isLabelHidden
      value={numValue}
      onChange={handleChange as (value: number) => void}
      placeholder={filterConfig.placeholder ?? `Filter ${header}`}
      min={filterConfig.min ?? null}
      max={filterConfig.max ?? null}
      step={filterConfig.step ?? null}
      size={size}
    />
  );
}

function NumberRangeFilterControl({
  columnKey,
  header,
  filterConfig,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterTypeNumberRange;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const config = store.getConfig();
  const value = config.filters[columnKey];
  const rangeValue =
    value != null && typeof value === 'object' && !Array.isArray(value)
      ? (value as XDSTableFilterNumberRangeValue)
      : undefined;

  const handleMinChange = useCallback(
    (newMin: number | null) => {
      const cfg = store.getConfig();
      const current = cfg.filters[columnKey];
      const existing =
        current != null &&
        typeof current === 'object' &&
        !Array.isArray(current)
          ? (current as XDSTableFilterNumberRangeValue)
          : {};
      if (newMin == null) {
        // Cleared — if max is also empty, clear the whole filter
        const {min: _min, ...rest} = existing;
        cfg.onFilterChange(columnKey, rest.max != null ? rest : null);
      } else {
        cfg.onFilterChange(columnKey, {...existing, min: newMin});
      }
    },
    [store, columnKey],
  );

  const handleMaxChange = useCallback(
    (newMax: number | null) => {
      const cfg = store.getConfig();
      const current = cfg.filters[columnKey];
      const existing =
        current != null &&
        typeof current === 'object' &&
        !Array.isArray(current)
          ? (current as XDSTableFilterNumberRangeValue)
          : {};
      if (newMax == null) {
        // Cleared — if min is also empty, clear the whole filter
        const {max: _max, ...rest} = existing;
        cfg.onFilterChange(columnKey, rest.min != null ? rest : null);
      } else {
        cfg.onFilterChange(columnKey, {...existing, max: newMax});
      }
    },
    [store, columnKey],
  );

  if (hasClear) {
    return (
      <div {...stylex.props(filterStyles.numberRangeRow)}>
        <XDSNumberInput
          label={`Min ${header}`}
          isLabelHidden
          value={rangeValue?.min ?? null}
          onChange={handleMinChange}
          placeholder={filterConfig.minPlaceholder ?? 'Min'}
          min={filterConfig.min ?? null}
          max={filterConfig.max ?? null}
          step={filterConfig.step ?? null}
          size={size}
          hasClear
        />
        <XDSNumberInput
          label={`Max ${header}`}
          isLabelHidden
          value={rangeValue?.max ?? null}
          onChange={handleMaxChange}
          placeholder={filterConfig.maxPlaceholder ?? 'Max'}
          min={filterConfig.min ?? null}
          max={filterConfig.max ?? null}
          step={filterConfig.step ?? null}
          size={size}
          hasClear
        />
      </div>
    );
  }

  return (
    <div {...stylex.props(filterStyles.numberRangeRow)}>
      <XDSNumberInput
        label={`Min ${header}`}
        isLabelHidden
        value={rangeValue?.min ?? null}
        onChange={handleMinChange as (value: number) => void}
        placeholder={filterConfig.minPlaceholder ?? 'Min'}
        min={filterConfig.min ?? null}
        max={filterConfig.max ?? null}
        step={filterConfig.step ?? null}
        size={size}
      />
      <XDSNumberInput
        label={`Max ${header}`}
        isLabelHidden
        value={rangeValue?.max ?? null}
        onChange={handleMaxChange as (value: number) => void}
        placeholder={filterConfig.maxPlaceholder ?? 'Max'}
        min={filterConfig.min ?? null}
        max={filterConfig.max ?? null}
        step={filterConfig.step ?? null}
        size={size}
      />
    </div>
  );
}

function SelectorFilterControl({
  columnKey,
  header,
  filterConfig,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterTypeSelector;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const config = store.getConfig();
  const value = config.filters[columnKey];
  const strValue = typeof value === 'string' ? value : '';

  const options = filterConfig.options.map(opt => ({
    value: opt.value,
    label: opt.label,
  }));

  const handleChange = useCallback(
    (newValue: string | null) => {
      store
        .getConfig()
        .onFilterChange(
          columnKey,
          newValue === '' || newValue == null ? null : newValue,
        );
    },
    [store, columnKey],
  );

  if (hasClear) {
    return (
      <XDSSelector
        label={`Filter ${header}`}
        isLabelHidden
        options={options}
        value={strValue || null}
        onChange={handleChange}
        placeholder={filterConfig.placeholder ?? 'All'}
        size={size}
        hasClear
      />
    );
  }

  return (
    <XDSSelector
      label={`Filter ${header}`}
      isLabelHidden
      options={options}
      value={strValue}
      onChange={handleChange as (value: string) => void}
      placeholder={filterConfig.placeholder ?? 'All'}
      size={size}
    />
  );
}

function MultiSelectorFilterControl({
  columnKey,
  header,
  filterConfig,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterTypeMultiSelector;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const config = store.getConfig();
  const value = config.filters[columnKey];
  const arrValue = Array.isArray(value) ? value : [];

  const options = filterConfig.options.map(opt => ({
    value: opt.value,
    label: opt.label,
  }));

  return (
    <XDSMultiSelector
      label={`Filter ${header}`}
      isLabelHidden
      options={options}
      value={arrValue}
      onChange={(newValue: string[]) => {
        store
          .getConfig()
          .onFilterChange(columnKey, newValue.length === 0 ? null : newValue);
      }}
      placeholder={filterConfig.placeholder ?? 'All'}
      size={size}
      hasSelectAll={filterConfig.hasSelectAll ?? true}
      hasSearch={filterConfig.isSearchable ?? false}
      hasClear={hasClear}
    />
  );
}

function DateFilterControl({
  columnKey,
  header,
  filterConfig,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterTypeDate;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const value = store.getConfig().filters[columnKey] as string | undefined;

  return (
    <XDSDateInput
      label={`Filter ${header}`}
      isLabelHidden
      value={(value as ISODateString | undefined) ?? undefined}
      onChange={newValue => {
        store.getConfig().onFilterChange(columnKey, newValue ?? null);
      }}
      min={filterConfig.min as ISODateString | undefined}
      max={filterConfig.max as ISODateString | undefined}
      size={size}
      hasClear={hasClear}
    />
  );
}

function TimeFilterControl({
  columnKey,
  header,
  filterConfig,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterTypeTime;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const value = store.getConfig().filters[columnKey] as string | undefined;

  return (
    <XDSTimeInput
      label={`Filter ${header}`}
      isLabelHidden
      value={(value as ISOTimeString | undefined) ?? undefined}
      onChange={newValue => {
        store.getConfig().onFilterChange(columnKey, newValue ?? null);
      }}
      min={filterConfig.min as ISOTimeString | undefined}
      max={filterConfig.max as ISOTimeString | undefined}
      size={size}
      hasClear={hasClear}
    />
  );
}

function StringListFilterControl({
  columnKey,
  header,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const value =
    (store.getConfig().filters[columnKey] as string[] | undefined) ?? [];

  // Simple static search source that accepts any typed text as a new tag
  const searchSource = useMemo(
    () => ({
      search: async (query: string) =>
        query.trim() ? [{id: query.trim(), label: query.trim()}] : [],
      bootstrap: () => [] as {id: string; label: string}[],
    }),
    [],
  );

  return (
    <XDSTokenizer
      label={`Filter ${header}`}
      isLabelHidden
      searchSource={searchSource}
      value={value.map(v => ({id: v, label: v}))}
      onChange={items => {
        const newValues = items.map(item => item.id);
        store
          .getConfig()
          .onFilterChange(columnKey, newValues.length > 0 ? newValues : null);
      }}
      size={size}
      hasClear={hasClear}
    />
  );
}

/** Renders the appropriate filter control for a column's filter type. */
function FilterControl({
  columnKey,
  header,
  filterConfig,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterType;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  switch (filterConfig.type) {
    case 'text':
      return (
        <TextFilterControl
          columnKey={columnKey}
          header={header}
          filterConfig={filterConfig}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'number':
      return (
        <NumberFilterControl
          columnKey={columnKey}
          header={header}
          filterConfig={filterConfig}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'number-range':
      return (
        <NumberRangeFilterControl
          columnKey={columnKey}
          header={header}
          filterConfig={filterConfig}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'selector':
      return (
        <SelectorFilterControl
          columnKey={columnKey}
          header={header}
          filterConfig={filterConfig}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'multi-selector':
      return (
        <MultiSelectorFilterControl
          columnKey={columnKey}
          header={header}
          filterConfig={filterConfig}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'date':
      return (
        <DateFilterControl
          columnKey={columnKey}
          header={header}
          filterConfig={filterConfig}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'time':
      return (
        <TimeFilterControl
          columnKey={columnKey}
          header={header}
          filterConfig={filterConfig}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'string-list':
      return (
        <StringListFilterControl
          columnKey={columnKey}
          header={header}
          size={size}
          hasClear={hasClear}
        />
      );
  }
}

// =============================================================================
// Popover Filter Trigger
// =============================================================================

function PopoverFilterTrigger({
  columnKey,
  header,
  filterConfig,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterType;
}) {
  const store = useContext(FilterStoreContext)!;
  const config = store.getConfig();
  const value = config.filters[columnKey];
  const hasValue = value != null;
  const [isOpen, setIsOpen] = useState(false);

  // Buffer the filter value locally while the popover is open.
  // Only commit to the consumer's state on explicit "Apply".
  const [draft, setDraft] = useState<XDSTableFilterValue | null>(null);

  const handleOpen = useCallback(
    (open: boolean) => {
      if (open) {
        // Seed draft from current value when opening
        setDraft(value ?? null);
      }
      setIsOpen(open);
    },
    [value],
  );

  const handleApply = useCallback(() => {
    store.getConfig().onFilterChange(columnKey, draft);
    setIsOpen(false);
  }, [store, columnKey, draft]);

  const handleClear = useCallback(() => {
    store.getConfig().onFilterChange(columnKey, null);
    setIsOpen(false);
  }, [store, columnKey]);

  // Build a local store override so FilterControl writes to the draft
  // instead of the consumer's state.
  const draftStore: FilterStore = {
    getConfig() {
      return {
        ...store.getConfig(),
        filters: {
          ...store.getConfig().filters,
          [columnKey]: draft ?? undefined,
        },
        onFilterChange: (_key: string, val: XDSTableFilterValue | null) => {
          setDraft(val);
        },
      };
    },
  };

  return (
    <XDSPopover
      isOpen={isOpen}
      onOpenChange={handleOpen}
      label={`Filter ${header}`}
      placement="below"
      alignment="start"
      content={
        <FilterStoreContext.Provider value={draftStore}>
          <div {...stylex.props(filterStyles.popoverContent)}>
            <FilterControl
              columnKey={columnKey}
              header={header}
              filterConfig={filterConfig}
              size="md"
            />
            <div {...stylex.props(filterStyles.popoverActions)}>
              <XDSButton
                label="Reset"
                variant="ghost"
                size="sm"
                onClick={handleClear}
              />
              <div {...stylex.props(filterStyles.popoverActionsSpacer)} />
              <XDSButton
                label="Apply"
                variant="primary"
                size="sm"
                onClick={handleApply}
              />
            </div>
          </div>
        </FilterStoreContext.Provider>
      }>
      <button
        type="button"
        aria-label={`Filter ${header}`}
        aria-haspopup="dialog"
        {...stylex.props(
          filterStyles.triggerButton,
          hasValue ? filterStyles.triggerActive : filterStyles.triggerInactive,
        )}>
        <XDSIcon
          icon="funnel"
          size="xsm"
          color={hasValue ? 'accent' : 'secondary'}
        />
      </button>
    </XDSPopover>
  );
}

// =============================================================================
// Helper
// =============================================================================

function getHeaderString(
  column: XDSTableColumn<Record<string, unknown>>,
): string {
  if (typeof column.header === 'string') return column.header;
  return column.key;
}

// =============================================================================
// Filter Slot Components
//
// These are stable components rendered by transformHeaderCell. Because the
// component *type* (`FilterSlot` / `InlineFilterSlot`) never changes across
// renders, React keeps the same fiber and no remount occurs when filter state
// updates. All dynamic data (filters, onFilterChange, filterConfig) is read
// from FilterStoreContext at render time — not passed as props.
// =============================================================================

/**
 * Popover variant slot — renders the funnel trigger button for one column.
 * Reads filter state and column config from context.
 */
function FilterSlot({
  columnKey,
  header,
  filterConfig,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterType;
}) {
  return (
    <div {...stylex.props(filterStyles.afterPopover)}>
      <PopoverFilterTrigger
        columnKey={columnKey}
        header={header}
        filterConfig={filterConfig}
      />
    </div>
  );
}

/**
 * Inline variant slot — renders the filter control (or placeholder) for one
 * column. Uses native `hasClear` on each input component for clearing.
 */
function InlineFilterSlot({
  columnKey,
  header,
  filterConfig,
}: {
  columnKey: string;
  header: string;
  filterConfig: XDSTableFilterType | undefined;
}) {
  const variant = useContext(FilterVariantContext);
  const size = 'sm';
  const placeholderStyle =
    variant === 'inline-compact'
      ? filterStyles.placeholderCompact
      : filterStyles.placeholder;

  return (
    <div {...stylex.props(filterStyles.afterInline)}>
      {filterConfig != null ? (
        <FilterControl
          columnKey={columnKey}
          header={header}
          filterConfig={filterConfig}
          size={size}
          hasClear
        />
      ) : (
        <div aria-hidden="true" {...stylex.props(placeholderStyle)} />
      )}
    </div>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * useXDSTableFiltering — table plugin for column filtering.
 *
 * Returns a stable TablePlugin that transforms header cells to add
 * filter controls. Follows the headless pattern: consumer owns filter state,
 * plugin provides UI and interaction.
 *
 * Filter types are configured per-column via the `filter` field on
 * XDSTableColumn. The plugin reads filter config from columns and
 * renders the appropriate control (text input, selector, etc.).
 *
 * @template T - Row data type
 *
 * @example
 * ```
 * const [filters, setFilters] = useState<XDSTableFilterState>({});
 *
 * const filterPlugin = useXDSTableFiltering({
 *   filters,
 *   onFilterChange: (key, value) => {
 *     setFilters(prev => ({
 *       ...prev,
 *       [key]: value ?? undefined,
 *     }));
 *   },
 *   variant: 'popover',
 * });
 *
 * <XDSTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', filter: { type: 'text' } },
 *     { key: 'status', header: 'Status', filter: {
 *       type: 'selector',
 *       options: [{ value: 'active' }, { value: 'inactive' }],
 *     }},
 *     { key: 'age', header: 'Age', filter: { type: 'number-range', min: 0 } },
 *   ]}
 *   plugins={[filterPlugin]}
 * />
 * ```
 */
export function useXDSTableFiltering<T extends Record<string, unknown>>(
  config: UseXDSTableFilteringConfig,
): TablePlugin<T> {
  const configRef = useRef(config);
  configRef.current = config;

  const storeRef = useRef<FilterStore | null>(null);
  if (storeRef.current == null) {
    storeRef.current = {
      getConfig() {
        return configRef.current;
      },
    };
  }
  const store = storeRef.current;

  const variant = config.variant ?? 'popover';

  return useMemo(
    (): TablePlugin<T> => ({
      // For inline variants, upgrade columns with filters and no explicit width
      // to proportional(1) so they get a default minWidth from the width resolver.
      // Without this, inline filter inputs can collapse to unusable sizes.
      transformColumns:
        variant === 'inline' || variant === 'inline-compact'
          ? (columns: XDSTableColumn<T>[]) =>
              columns.map(col => {
                if (col.filter != null && col.width == null) {
                  return {...col, width: proportional(1)};
                }
                return col;
              })
          : undefined,

      transformTableContext(children: ReactNode) {
        return (
          <FilterStoreContext.Provider value={store}>
            <FilterVariantContext.Provider value={variant}>
              {children}
            </FilterVariantContext.Provider>
          </FilterStoreContext.Provider>
        );
      },

      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: XDSTableColumn<T>,
      ): HeaderCellRenderProps {
        const rawFilter = column.filter;
        const header = getHeaderString(
          column as XDSTableColumn<Record<string, unknown>>,
        );

        // Resolve field references to concrete filter types
        const filterConfig = rawFilter
          ? resolveFilterConfig(rawFilter, store.getConfig().searchConfig)
          : undefined;

        if (variant === 'popover') {
          // No filter config on this column — nothing to render.
          if (!filterConfig) return props;

          return {
            ...props,
            after: (
              <>
                {props.after}
                <FilterSlot
                  columnKey={column.key}
                  header={header}
                  filterConfig={filterConfig}
                />
              </>
            ),
          };
        }

        // Inline or inline-compact: render filter controls below the header
        // label row. Uses the `below` slot so controls sit underneath the
        // header content rather than inline after it.
        return {
          ...props,
          below: (
            <>
              {props.below}
              <InlineFilterSlot
                columnKey={column.key}
                header={header}
                filterConfig={filterConfig}
              />
            </>
          ),
        };
      },
    }),
    [store, variant],
  );
}
