// Copyright (c) Meta Platforms, Inc. and affiliates.

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
  IntegerOperatorValue,
  FloatOperatorValue,
  EnumOperatorValue,
  EnumListOperatorValue,
  StringListOperatorValue,
  EntityListOperatorValue,
} from '../../../PowerSearch/types';

// =============================================================================
// Filter Value Types
// =============================================================================

/** Union of all filter value types (text=string, number=number, enum/list=string[]) */
export type XDSTableFilterValue = string | number | string[];

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
 * Resolve a column's filter field reference to a concrete OperatorValue.
 *
 * - String → field key, uses defaultOperator.
 * - Object with `field` → look up field + optional operator.
 * - Returns undefined if the field/operator can't be resolved.
 */
function resolveFilterConfig(
  filter: XDSTableFilterFieldRef | string,
  searchConfig: PowerSearchConfig,
): OperatorValue | undefined {
  const fieldKey = typeof filter === 'string' ? filter : filter.field;
  const operatorKey = typeof filter === 'string' ? undefined : filter.operator;

  const field = searchConfig.fields.find(f => f.key === fieldKey);
  if (!field) return undefined;

  const operator = resolveOperator(field, operatorKey);
  if (!operator) return undefined;

  return operator.value;
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
export function toSearchFilters<_T extends Record<string, unknown>>(
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
 * const {filters, onFilterChange} = useXDSTableFilterState();
 * const filterPlugin = useXDSTableFiltering({
 *   filters,
 *   onFilterChange,
 *   variant: 'inline',
 * });
 * <XDSTable plugins={{ filter: filterPlugin }} columns={columns} data={data} />
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
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
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
      placeholder={`Filter ${header}`}
      size={size}
      hasClear={hasClear}
    />
  );
}

function NumberFilterControl({
  columnKey,
  header,
  operatorValue,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  operatorValue: IntegerOperatorValue | FloatOperatorValue;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const config = store.getConfig();
  const value = config.filters[columnKey];
  const numValue = typeof value === 'number' ? value : null;

  const step = operatorValue.type === 'integer' ? 1 : null;

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
        placeholder={`Filter ${header}`}
        min={operatorValue.minValue ?? null}
        max={operatorValue.maxValue ?? null}
        step={step}
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
      placeholder={`Filter ${header}`}
      min={operatorValue.minValue ?? null}
      max={operatorValue.maxValue ?? null}
      step={step}
      size={size}
    />
  );
}

function SelectorFilterControl({
  columnKey,
  header,
  operatorValue,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  operatorValue: EnumOperatorValue;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const config = store.getConfig();
  const value = config.filters[columnKey];
  const strValue = typeof value === 'string' ? value : '';

  const options = operatorValue.values.map(v => ({
    value: v.value,
    label: v.label,
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
        placeholder="All"
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
      placeholder="All"
      size={size}
    />
  );
}

function MultiSelectorFilterControl({
  columnKey,
  header,
  operatorValue,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  operatorValue: EnumListOperatorValue;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const config = store.getConfig();
  const value = config.filters[columnKey];
  const arrValue = Array.isArray(value) ? value : [];

  const options = operatorValue.values.map(v => ({
    value: v.value,
    label: v.label,
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
      placeholder="All"
      size={size}
      hasSelectAll
      hasSearch={false}
      hasClear={hasClear}
    />
  );
}

function DateFilterControl({
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
  const value = store.getConfig().filters[columnKey] as string | undefined;

  return (
    <XDSDateInput
      label={`Filter ${header}`}
      isLabelHidden
      value={(value as ISODateString | undefined) ?? undefined}
      onChange={newValue => {
        store.getConfig().onFilterChange(columnKey, newValue ?? null);
      }}
      size={size}
      hasClear={hasClear}
    />
  );
}

function TimeFilterControl({
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
  const value = store.getConfig().filters[columnKey] as string | undefined;

  return (
    <XDSTimeInput
      label={`Filter ${header}`}
      isLabelHidden
      value={(value as ISOTimeString | undefined) ?? undefined}
      onChange={newValue => {
        store.getConfig().onFilterChange(columnKey, newValue ?? null);
      }}
      size={size}
      hasClear={hasClear}
    />
  );
}

function StringListFilterControl({
  columnKey,
  header,
  operatorValue,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  operatorValue: StringListOperatorValue | EntityListOperatorValue;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  const store = useContext(FilterStoreContext)!;
  const value =
    (store.getConfig().filters[columnKey] as string[] | undefined) ?? [];

  // Use the operator's search source if provided, otherwise fall back
  // to a simple static source that accepts any typed text as a new tag.
  const fallbackSource = useMemo(
    () => ({
      search: async (query: string) =>
        query.trim() ? [{id: query.trim(), label: query.trim()}] : [],
      bootstrap: () => [] as {id: string; label: string}[],
    }),
    [],
  );

  const searchSource = operatorValue.searchSource ?? fallbackSource;

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

/** Renders the appropriate filter control for a column's operator value type. */
function FilterControl({
  columnKey,
  header,
  operatorValue,
  size,
  hasClear,
}: {
  columnKey: string;
  header: string;
  operatorValue: OperatorValue;
  size: 'sm' | 'md';
  hasClear?: boolean;
}) {
  switch (operatorValue.type) {
    case 'string':
      return (
        <TextFilterControl
          columnKey={columnKey}
          header={header}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'integer':
    case 'float':
      return (
        <NumberFilterControl
          columnKey={columnKey}
          header={header}
          operatorValue={operatorValue}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'enum':
      return (
        <SelectorFilterControl
          columnKey={columnKey}
          header={header}
          operatorValue={operatorValue}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'enum_list':
      return (
        <MultiSelectorFilterControl
          columnKey={columnKey}
          header={header}
          operatorValue={operatorValue}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'date_absolute':
      return (
        <DateFilterControl
          columnKey={columnKey}
          header={header}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'time':
      return (
        <TimeFilterControl
          columnKey={columnKey}
          header={header}
          size={size}
          hasClear={hasClear}
        />
      );
    case 'string_list':
    case 'entity_list':
      return (
        <StringListFilterControl
          columnKey={columnKey}
          header={header}
          operatorValue={operatorValue}
          size={size}
          hasClear={hasClear}
        />
      );
    default:
      return null;
  }
}

// =============================================================================
// Popover Filter Trigger
// =============================================================================

function PopoverFilterTrigger({
  columnKey,
  header,
  operatorValue,
}: {
  columnKey: string;
  header: string;
  operatorValue: OperatorValue;
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
              operatorValue={operatorValue}
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
// updates. All dynamic data (filters, onFilterChange, operatorValue) is read
// from FilterStoreContext at render time — not passed as props.
// =============================================================================

/**
 * Popover variant slot — renders the funnel trigger button for one column.
 * Reads filter state and column config from context.
 */
function FilterSlot({
  columnKey,
  header,
  operatorValue,
}: {
  columnKey: string;
  header: string;
  operatorValue: OperatorValue;
}) {
  return (
    <div {...stylex.props(filterStyles.afterPopover)}>
      <PopoverFilterTrigger
        columnKey={columnKey}
        header={header}
        operatorValue={operatorValue}
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
  operatorValue,
}: {
  columnKey: string;
  header: string;
  operatorValue: OperatorValue | undefined;
}) {
  const variant = useContext(FilterVariantContext);
  const size = 'sm';
  const placeholderStyle =
    variant === 'inline-compact'
      ? filterStyles.placeholderCompact
      : filterStyles.placeholder;

  return (
    <div {...stylex.props(filterStyles.afterInline)}>
      {operatorValue != null ? (
        <FilterControl
          columnKey={columnKey}
          header={header}
          operatorValue={operatorValue}
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
 * const {filters, onFilterChange} = useXDSTableFilterState();
 * const filterPlugin = useXDSTableFiltering({
 *   filters,
 *   onFilterChange,
 *   variant: 'popover',
 * });
 * <XDSTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', filter: 'name' },
 *     { key: 'status', header: 'Status', filter: 'status' },
 *   ]}
 *   plugins={{ filter: filterPlugin }}
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

        // Resolve field references to concrete OperatorValue
        const operatorValue = rawFilter
          ? resolveFilterConfig(rawFilter, store.getConfig().searchConfig)
          : undefined;

        if (variant === 'popover') {
          // No operator value on this column — nothing to render.
          if (!operatorValue) return props;

          return {
            ...props,
            after: (
              <>
                {props.after}
                <FilterSlot
                  columnKey={column.key}
                  header={header}
                  operatorValue={operatorValue}
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
                operatorValue={operatorValue}
              />
            </>
          ),
        };
      },
    }),
    [store, variant],
  );
}
