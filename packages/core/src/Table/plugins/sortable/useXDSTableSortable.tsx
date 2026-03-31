'use client';

/**
 * @file useXDSTableSortable.tsx
 * @input React, types, XDSIcon, theme tokens
 * @output Exports useXDSTableSortable hook and sort-related types
 * @position Sortable plugin; consumed by XDSTable via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (sort documentation)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useRef, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, radiusVars} from '../../../theme/tokens.stylex';
import {XDSIcon} from '../../../Icon';
import type {
  TablePlugin,
  HeaderCellRenderProps,
  XDSTableColumn,
} from '../../types';

// =============================================================================
// Sort Types
// =============================================================================

/**
 * Sort direction for a single column.
 */
export type XDSTableSortDirection = 'ascending' | 'descending';

/**
 * A single sort entry in the sort state array.
 */
export interface XDSTableSortEntry<TSortKey extends string = string> {
  /** The sort key identifying which column (or derived value) to sort by. */
  sortKey: TSortKey;
  /** The sort direction. */
  direction: XDSTableSortDirection;
}

/**
 * Complete sort state — an ordered array of sort entries.
 * The first entry is the primary sort; subsequent entries are tiebreakers.
 * Empty array = no sort applied.
 *
 * @example
 * ```
 * const sort: XDSTableSortState = [
 *   { sortKey: 'name', direction: 'ascending' },
 *   { sortKey: 'age', direction: 'descending' },
 * ];
 * ```
 */
export type XDSTableSortState<TSortKey extends string = string> =
  XDSTableSortEntry<TSortKey>[];

// =============================================================================
// Hook Config
// =============================================================================

/**
 * Configuration for useXDSTableSortable.
 *
 * Follows XDS headless plugin conventions: the consumer owns all state
 * and provides callbacks. The plugin never holds internal sort state.
 *
 * @template TSortKey - Union of valid sort key strings
 *
 * @example
 * ```
 * const [sort, setSort] = useState<XDSTableSortState>([
 *   { sortKey: 'name', direction: 'ascending' },
 * ]);
 *
 * const sortPlugin = useXDSTableSortable({
 *   sort,
 *   onSortChange: setSort,
 * });
 *
 * <XDSTable plugins={{ sort: sortPlugin }} ... />
 * ```
 */
export interface UseXDSTableSortableConfig<TSortKey extends string = string> {
  /** Current sort state — ordered array of active sort entries. */
  sort: XDSTableSortState<TSortKey>;

  /**
   * Called when the user changes sort via header click.
   * Receives the complete new sort state array.
   */
  onSortChange: (sort: XDSTableSortState<TSortKey>) => void;

  /**
   * Allow returning to unsorted state.
   * When true, clicking a sorted column cycles: asc → desc → unsorted.
   * When false, clicking cycles: asc → desc → asc.
   *
   * @default false
   */
  allowUnsortedState?: boolean;

  /**
   * Enable multi-sort via modifier key (Shift+click).
   * When true, Shift+click adds/toggles a column as a secondary sort.
   * Regular click still replaces the entire sort state (single-sort behavior).
   *
   * @default false
   */
  isMultiSortEnabled?: boolean;
}

// =============================================================================
// Styles
// =============================================================================

const sortStyles = stylex.create({
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    background: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    width: '100%',
    height: '100%',
    textAlign: 'inherit',
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: '2px',
    borderRadius: radiusVars['--radius-inner'],
  },
  iconWrapperUnsorted: {
    display: 'inline-flex',
    opacity: 0,
    [stylex.when.ancestor(':hover')]: {
      opacity: 1,
    },
    [stylex.when.ancestor(':focus-within')]: {
      opacity: 1,
    },
  },
  iconWrapperActive: {
    display: 'inline-flex',
  },
  rank: {
    fontSize: 10,
    // eslint-disable-next-line @xds/no-hardcoded-styles -- no token for lineHeight:1 (tight badge)
    lineHeight: '1',
    color: colorVars['--color-accent'],
  },
});

// =============================================================================
// Helpers
// =============================================================================

function resolveSortKey<T extends Record<string, unknown>>(
  column: XDSTableColumn<T>,
): string | null {
  const {sortable} = column;
  if (!sortable) return null;
  if (sortable === true) return column.key;
  return sortable.sortKey ?? column.key;
}

function getHeaderLabel<T extends Record<string, unknown>>(
  column: XDSTableColumn<T>,
): string {
  const {header} = column;
  if (typeof header === 'string') return header;
  return column.key;
}

function buildAriaLabel<T extends Record<string, unknown>>(
  column: XDSTableColumn<T>,
  direction: XDSTableSortDirection | null,
  rank: number | null,
  total: number,
): string {
  const label = getHeaderLabel(column);
  if (direction == null) {
    return `Sort by ${label}`;
  }
  let ariaLabel = `Sort by ${label}, sorted ${direction}`;
  if (rank != null && total > 1) {
    ariaLabel += `, priority ${rank} of ${total}`;
  }
  return ariaLabel;
}

function getNextDirection(
  current: XDSTableSortDirection | null,
  allowUnsortedState: boolean,
): XDSTableSortDirection | null {
  if (current == null) return 'ascending';
  if (current === 'ascending') return 'descending';
  // current === 'descending'
  return allowUnsortedState ? null : 'ascending';
}

// =============================================================================
// Sort Header Button Component
// =============================================================================

function SortHeaderButton<T extends Record<string, unknown>>({
  column,
  children,
  configRef,
}: {
  column: XDSTableColumn<T>;
  children: ReactNode;
  configRef: React.RefObject<UseXDSTableSortableConfig>;
}) {
  const config = configRef.current;
  const sortKey = resolveSortKey(column)!;
  const entryIndex = config.sort.findIndex(e => e.sortKey === sortKey);
  const entry = entryIndex >= 0 ? config.sort[entryIndex] : null;
  const direction = entry?.direction ?? null;

  const isMultiSort =
    config.isMultiSortEnabled === true && config.sort.length > 1;
  const rank = isMultiSort && entryIndex >= 0 ? entryIndex + 1 : null;

  const iconName =
    direction === 'ascending'
      ? 'arrowUp'
      : direction === 'descending'
        ? 'arrowDown'
        : 'arrowsUpDown';

  const ariaLabel = buildAriaLabel(column, direction, rank, config.sort.length);

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    const cfg = configRef.current;
    const isShift = e.shiftKey && cfg.isMultiSortEnabled;
    const allowUnsorted = cfg.allowUnsortedState ?? false;

    if (isShift) {
      // Multi-sort: toggle in place or append
      const idx = cfg.sort.findIndex(s => s.sortKey === sortKey);
      if (idx >= 0) {
        const nextDir = getNextDirection(
          cfg.sort[idx].direction,
          allowUnsorted,
        );
        if (nextDir == null) {
          // Remove from array
          const newSort = [...cfg.sort];
          newSort.splice(idx, 1);
          cfg.onSortChange(newSort);
        } else {
          const newSort = [...cfg.sort];
          newSort[idx] = {...newSort[idx], direction: nextDir};
          cfg.onSortChange(newSort);
        }
      } else {
        // Append new entry
        cfg.onSortChange([...cfg.sort, {sortKey, direction: 'ascending'}]);
      }
    } else {
      // Single-sort: replace entire array
      const currentEntry = cfg.sort.find(s => s.sortKey === sortKey);
      const nextDir = getNextDirection(
        currentEntry?.direction ?? null,
        allowUnsorted,
      );
      if (nextDir == null) {
        cfg.onSortChange([]);
      } else {
        cfg.onSortChange([{sortKey, direction: nextDir}]);
      }
    }
  };

  return (
    <button
      type="button"
      {...stylex.props(sortStyles.button)}
      aria-label={ariaLabel}
      onClick={handleClick}>
      <span>{children}</span>
      <span
        {...stylex.props(
          direction != null
            ? sortStyles.iconWrapperActive
            : sortStyles.iconWrapperUnsorted,
        )}>
        <XDSIcon
          icon={iconName}
          size="xsm"
          color={direction != null ? 'accent' : 'secondary'}
        />
      </span>
      {rank != null && (
        <span {...stylex.props(sortStyles.rank)} aria-hidden="true">
          {rank}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * useXDSTableSortable — table plugin for column sorting.
 *
 * Returns a stable TablePlugin<T> that transforms header cells to add
 * clickable sort indicators. Follows the headless pattern: consumer owns
 * sort state, plugin provides UI and interaction.
 *
 * @example
 * ```
 * const [sort, setSort] = useState<XDSTableSortState>([]);
 * const sortPlugin = useXDSTableSortable({ sort, onSortChange: setSort });
 *
 * <XDSTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'age', header: 'Age', sortable: true },
 *   ]}
 *   plugins={{ sort: sortPlugin }}
 * />
 * ```
 */
export function useXDSTableSortable<
  T extends Record<string, unknown>,
  TSortKey extends string = string,
>(config: UseXDSTableSortableConfig<TSortKey>): TablePlugin<T> {
  const configRef = useRef(config);
  configRef.current = config;

  return useMemo(
    (): TablePlugin<T> => ({
      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: XDSTableColumn<T>,
      ): HeaderCellRenderProps {
        const sortKey = resolveSortKey(column);
        if (sortKey == null) return props;

        // Find sort entry for this column
        const cfg = configRef.current;
        const entry = cfg.sort.find(e => e.sortKey === sortKey);

        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            ...(entry != null ? {'aria-sort': entry.direction} : {}),
          },
          content: (
            <SortHeaderButton
              column={column}
              configRef={
                configRef as unknown as React.RefObject<UseXDSTableSortableConfig>
              }>
              {props.content}
            </SortHeaderButton>
          ),
        };
      },
    }),
    [],
  );
}
