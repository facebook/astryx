'use client';

/**
 * @file useXDSTableSortableState.tsx
 * @input React, XDSTableSortState types
 * @output Exports useXDSTableSortableState hook and config types
 * @position Sort state helper; manages sort state + applies local sort to data.
 *   Pairs with useXDSTableSortable (the headless sort plugin).
 *
 * Modeled after useXDSTableSelectionState — a convenience layer that owns state
 * and produces a ready-to-use config for the headless plugin.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/plugins/sortable/index.ts (exports)
 * - /packages/core/src/Table/Table.doc.mjs (sort documentation)
 */

import {useState, useMemo, useCallback, useRef} from 'react';
import type {
  XDSTableSortState,
  UseXDSTableSortableConfig,
} from './useXDSTableSortable';

// =============================================================================
// Comparator Types
// =============================================================================

/**
 * Custom comparator for a single sort key.
 * Receives two row values and returns a standard comparison number.
 * Direction (ascending/descending) is applied automatically by the hook —
 * comparators should always sort in ascending order.
 */
export type XDSTableSortComparator<T> = (a: T, b: T) => number;

// =============================================================================
// Hook Config
// =============================================================================

/**
 * Configuration for useXDSTableSortableState.
 *
 * @template T - The row data type
 * @template TSortKey - Union of valid sort key strings
 *
 * @example
 * ```
 * const { sortedData, sortConfig } = useXDSTableSortableState({
 *   data: users,
 *   defaultSort: [{ sortKey: 'name', direction: 'ascending' }],
 * });
 *
 * const sortPlugin = useXDSTableSortable(sortConfig);
 * <XDSTable data={sortedData} plugins={{ sort: sortPlugin }} />
 * ```
 *
 * @example
 * ```
 * const [sort, setSort] = useState<XDSTableSortState>([]);
 * const { sortedData, sortConfig } = useXDSTableSortableState({
 *   data: users,
 *   sort,
 *   onSortChange: setSort,
 * });
 * ```
 */
export interface UseXDSTableSortableStateConfig<
  T extends Record<string, unknown>,
  TSortKey extends string = string,
> {
  /**
   * The data array to sort.
   * The hook returns a new sorted copy — the original is never mutated.
   */
  data: T[];

  /**
   * Initial sort state for uncontrolled mode.
   * Ignored when `sort` is provided.
   * @default []
   */
  defaultSort?: XDSTableSortState<TSortKey>;

  /**
   * Controlled sort state. When provided, the hook uses this instead of
   * internal state. Must be paired with `onSortChange`.
   */
  sort?: XDSTableSortState<TSortKey>;

  /**
   * Called when the sort state changes. Required when `sort` is provided.
   */
  onSortChange?: (sort: XDSTableSortState<TSortKey>) => void;

  /**
   * Custom comparators per sort key.
   * Keys are sort key strings; values are comparator functions that receive
   * two row items. Comparators should sort ascending — the hook flips the
   * sign for descending.
   *
   * For keys not in this map, the hook falls back to `localeCompare` with
   * `{ numeric: true }` on the stringified values.
   *
   * @example
   * ```
   * comparators: {
   *   age: (a, b) => a.age - b.age,
   *   name: (a, b) => a.name.localeCompare(b.name),
   * }
   * ```
   */
  comparators?: Partial<Record<TSortKey, XDSTableSortComparator<T>>>;

  /**
   * Allow returning to unsorted state.
   * Passed through to the sortable plugin config.
   * @default true
   */
  allowUnsortedState?: boolean;

  /**
   * Enable multi-sort via modifier key.
   * Passed through to the sortable plugin config.
   * @default false
   */
  isMultiSortEnabled?: boolean;
}

// =============================================================================
// Hook Result
// =============================================================================

export interface UseXDSTableSortableStateResult<
  T extends Record<string, unknown>,
  TSortKey extends string = string,
> {
  /** Sorted copy of the input data. Memoized — stable when sort state and data don't change. */
  sortedData: T[];

  /** Current sort state. */
  sort: XDSTableSortState<TSortKey>;

  /** Ready-to-use config for useXDSTableSortable. */
  sortConfig: UseXDSTableSortableConfig<TSortKey>;

  /**
   * Apply the current sort state to arbitrary data.
   * Useful when you have multiple data sources or need to sort a subset.
   */
  applySort: (data: T[]) => T[];
}

// =============================================================================
// Default Comparator
// =============================================================================

function defaultCompare<T extends Record<string, unknown>>(
  a: T,
  b: T,
  sortKey: string,
): number {
  const aVal = a[sortKey];
  const bVal = b[sortKey];

  // null/undefined sort to the end
  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return 1;
  if (bVal == null) return -1;

  // number fast path
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return aVal - bVal;
  }

  // string comparison with numeric collation
  return String(aVal).localeCompare(String(bVal), undefined, {numeric: true});
}

// =============================================================================
// Sort Logic
// =============================================================================

function sortData<
  T extends Record<string, unknown>,
  TSortKey extends string = string,
>(
  data: T[],
  sortState: XDSTableSortState<TSortKey>,
  comparators?: Partial<Record<TSortKey, XDSTableSortComparator<T>>>,
): T[] {
  if (sortState.length === 0) return data;

  return [...data].sort((a, b) => {
    for (const entry of sortState) {
      const {sortKey, direction} = entry;
      const customCmp = comparators?.[sortKey];
      const cmp = customCmp ? customCmp(a, b) : defaultCompare(a, b, sortKey);

      if (cmp !== 0) {
        return direction === 'ascending' ? cmp : -cmp;
      }
    }
    return 0;
  });
}

// =============================================================================
// Hook
// =============================================================================

/**
 * useXDSTableSortableState — manages sort state and applies local sort to data.
 *
 * Convenience layer over useXDSTableSortable. Owns sort state internally
 * (or accepts controlled state), sorts the data, and produces a ready-to-use
 * config for the headless sortable plugin.
 *
 * @example
 * ```
 * const { sortedData, sortConfig } = useXDSTableSortableState({
 *   data: employees,
 *   defaultSort: [{ sortKey: 'name', direction: 'ascending' }],
 *   comparators: {
 *     age: (a, b) => a.age - b.age,
 *   },
 * });
 *
 * const sortPlugin = useXDSTableSortable(sortConfig);
 *
 * <XDSTable
 *   data={sortedData}
 *   columns={columns}
 *   plugins={{ sort: sortPlugin }}
 * />
 * ```
 */
export function useXDSTableSortableState<
  T extends Record<string, unknown>,
  TSortKey extends string = string,
>(
  config: UseXDSTableSortableStateConfig<T, TSortKey>,
): UseXDSTableSortableStateResult<T, TSortKey> {
  const {
    data,
    defaultSort = [] as unknown as XDSTableSortState<TSortKey>,
    sort: controlledSort,
    onSortChange: controlledOnSortChange,
    comparators,
    allowUnsortedState,
    isMultiSortEnabled,
  } = config;

  // Internal state (used in uncontrolled mode)
  const [internalSort, setInternalSort] =
    useState<XDSTableSortState<TSortKey>>(defaultSort);

  // Resolve controlled vs uncontrolled
  const isControlled = controlledSort !== undefined;
  const sort = isControlled ? controlledSort : internalSort;
  const onSortChange = isControlled
    ? (controlledOnSortChange ?? (() => {}))
    : setInternalSort;

  // Stable ref for comparators to avoid re-sorting on inline object identity changes
  const comparatorsRef = useRef(comparators);
  comparatorsRef.current = comparators;

  // Sorted data — memoized on sort state + data identity
  const sortedData = useMemo(
    () => sortData(data, sort, comparatorsRef.current),
    [data, sort],
  );

  // applySort — lets consumers sort arbitrary data with the current state
  const applySort = useCallback(
    (inputData: T[]): T[] => sortData(inputData, sort, comparatorsRef.current),
    [sort],
  );

  // Config ready for useXDSTableSortable
  const sortConfig = useMemo(
    (): UseXDSTableSortableConfig<TSortKey> => ({
      sort,
      onSortChange,
      allowUnsortedState,
      isMultiSortEnabled,
    }),
    [sort, onSortChange, allowUnsortedState, isMultiSortEnabled],
  );

  return {sortedData, sort, sortConfig, applySort};
}
