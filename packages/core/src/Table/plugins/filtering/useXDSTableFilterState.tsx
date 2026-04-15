'use client';

/**
 * @file useXDSTableFilterState.tsx
 * @input React, filter types
 * @output Exports useXDSTableFilterState hook for managing filter state
 * @position Filter state helper; manages the filter state object.
 *   Pairs with useXDSTableFiltering for the UI plugin.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/plugins/filtering/index.ts (exports)
 * - /packages/core/src/Table/Table.doc.mjs (filtering documentation)
 */

import {useState, useCallback} from 'react';
import type {
  XDSTableFilterState,
  XDSTableFilterValue,
} from './useXDSTableFiltering';

export interface UseXDSTableFilterStateResult {
  /** Current filter state — pass to useXDSTableFiltering. */
  filters: XDSTableFilterState;
  /** Filter change handler — pass to useXDSTableFiltering. */
  onFilterChange: (key: string, value: XDSTableFilterValue | null) => void;
  /** Reset all filters to empty. */
  clearAll: () => void;
}

/**
 * useXDSTableFilterState — manages the filter state object.
 *
 * A convenience hook that bundles `useState<XDSTableFilterState>` with a
 * correctly-typed `onFilterChange` handler. Eliminates the boilerplate of
 * writing the state update logic in every consumer.
 *
 * The returned `filters` and `onFilterChange` are passed directly to
 * `useXDSTableFiltering`.
 *
 * @example
 * ```
 * const {filters, onFilterChange} = useXDSTableFilterState();
 * const filterPlugin = useXDSTableFiltering({
 *   filters,
 *   onFilterChange,
 *   variant: 'inline',
 *   searchConfig: config,
 * });
 * ```
 */
export function useXDSTableFilterState(
  initialState?: XDSTableFilterState,
): UseXDSTableFilterStateResult {
  const [filters, setFilters] = useState<XDSTableFilterState>(
    initialState ?? {},
  );

  const onFilterChange = useCallback(
    (key: string, value: XDSTableFilterValue | null) => {
      setFilters(prev => {
        const next = {...prev};
        if (value == null) delete next[key];
        else next[key] = value;
        return next;
      });
    },
    [],
  );

  const clearAll = useCallback(() => {
    setFilters({});
  }, []);

  return {filters, onFilterChange, clearAll};
}
