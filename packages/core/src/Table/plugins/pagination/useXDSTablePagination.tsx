'use client';

/**
 * @file useXDSTablePagination.tsx
 * @input React, XDSPagination, Table plugin types
 * @output Exports useXDSTablePagination hook and config type
 * @position Pagination plugin; consumed by XDSTable via plugins prop
 *
 * Returns a `TablePlugin` directly (same pattern as useXDSTableSortable,
 * useXDSTableSelection, useXDSTableColumnSettings).
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/plugins/pagination/index.ts (exports)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useMemo, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../../../theme/tokens.stylex';
import {XDSPagination} from '../../../Pagination';
import type {XDSPaginationProps} from '../../../Pagination';
import type {TablePlugin} from '../../types';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    display: 'flex',
  },
  marginTop: {
    marginTop: spacingVars['--spacing-2'],
  },
  marginBottom: {
    marginBottom: spacingVars['--spacing-2'],
  },
  alignStart: {
    justifyContent: 'flex-start',
  },
  alignCenter: {
    justifyContent: 'center',
  },
  alignEnd: {
    justifyContent: 'flex-end',
  },
});

// =============================================================================
// Config Type
// =============================================================================

/**
 * Configuration for useXDSTablePagination.
 *
 * The consumer owns all state. This hook renders pagination controls
 * around the table via `transformTableContext`.
 *
 * @example
 * ```
 * // Client-side pagination
 * const [page, setPage] = useState(1);
 * const pageSize = 10;
 *
 * const plugin = useXDSTablePagination({
 *   page,
 *   onPageChange: setPage,
 *   totalItems: data.length,
 *   pageSize,
 * });
 *
 * <XDSTable
 *   data={paginateData(data, page, pageSize)}
 *   columns={columns}
 *   plugins={{ pagination: plugin }}
 * />
 * ```
 *
 * @example
 * ```
 * // Server-side pagination \u2014 data already sliced
 * const plugin = useXDSTablePagination({
 *   page,
 *   onPageChange: (p) => fetchPage(p),
 *   totalItems: serverTotal,
 *   pageSize: 25,
 * });
 *
 * <XDSTable
 *   data={serverData}
 *   columns={columns}
 *   plugins={{ pagination: plugin }}
 * />
 * ```
 *
 * @example
 * ```
 * // Cursor-based pagination \u2014 total unknown
 * const plugin = useXDSTablePagination({
 *   page,
 *   onPageChange: setPage,
 *   hasMore: cursor != null,
 *   pageSize: 20,
 * });
 * ```
 */
export interface UseXDSTablePaginationConfig {
  // --- Core (required) ---

  /** Current page number (1-based). */
  page: number;

  /** Called when the page changes. Consumer updates their own state. */
  onPageChange: (page: number) => void;

  // --- Data shape (provide one) ---

  /**
   * Total number of items across all pages.
   * Used to calculate total page count and "X\u2013Y of Z" display.
   * Takes precedence over `totalPages` if both are provided.
   */
  totalItems?: number;

  /**
   * Total number of pages. Use when you know the page count but not item count.
   */
  totalPages?: number;

  /**
   * Whether more pages exist after the current one.
   * Use for cursor-based pagination where the total is unknown.
   * Mutually exclusive with totalItems/totalPages.
   */
  hasMore?: boolean;

  // --- Page size ---

  /**
   * Number of items per page.
   * @default 10
   */
  pageSize?: number;

  /**
   * Called when the user changes the page size via the page size selector.
   * When provided alongside `pageSizeOptions`, a page size dropdown is shown.
   */
  onPageSizeChange?: (pageSize: number) => void;

  /**
   * Available page size options. Shows a page size selector when provided.
   * @example
   * ```
   * [10, 25, 50, 100]
   * ```
   */
  pageSizeOptions?: number[];

  // --- Display ---

  /**
   * Visual variant for the pagination controls.
   * Passed through to XDSPagination.
   * @default 'pages'
   */
  variant?: 'pages' | 'count' | 'compact' | 'dots' | 'none';

  /**
   * Size of the pagination controls.
   * @default 'md'
   */
  size?: 'sm' | 'md';

  /**
   * Where to render the pagination controls relative to the table.
   * - 'below' \u2014 renders pagination after the table (default)
   * - 'above' \u2014 renders pagination before the table
   * - 'both' \u2014 renders pagination above and below the table
   * - 'none' \u2014 does not auto-render; use XDSPagination manually
   *
   * @default 'below'
   */
  position?: 'below' | 'above' | 'both' | 'none';

  /**
   * Horizontal alignment of the pagination controls within their container.
   * - 'start' \u2014 left-aligned
   * - 'center' \u2014 centered (default)
   * - 'end' \u2014 right-aligned
   *
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end';

  // --- Accessibility ---

  /**
   * Accessible label for the pagination nav landmark.
   * @default 'Table pagination'
   */
  label?: string;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Pagination table plugin \u2014 renders XDSPagination controls around the table.
 *
 * Returns a `TablePlugin` directly (same pattern as `useXDSTableSortable`,
 * `useXDSTableSelection`, `useXDSTableColumnSettings`).
 *
 * @example
 * ```
 * const [page, setPage] = useState(1);
 * const pageSize = 10;
 *
 * const plugin = useXDSTablePagination({
 *   page,
 *   onPageChange: setPage,
 *   totalItems: data.length,
 *   pageSize,
 * });
 *
 * <XDSTable
 *   data={paginateData(data, page, pageSize)}
 *   plugins={{ pagination: plugin }}
 * />
 * ```
 */
export function useXDSTablePagination<T extends Record<string, unknown>>(
  config: UseXDSTablePaginationConfig,
): TablePlugin<T> {
  const {
    page,
    onPageChange,
    totalItems,
    totalPages: totalPagesProp,
    hasMore,
    pageSize = 10,
    onPageSizeChange,
    pageSizeOptions,
    variant = 'pages',
    size = 'md',
    position = 'below',
    align = 'center',
    label = 'Table pagination',
  } = config;

  const computedTotalPages =
    totalPagesProp ??
    (totalItems != null ? Math.ceil(totalItems / pageSize) : undefined);

  // Build XDSPagination props
  const paginationProps: XDSPaginationProps = {
    page,
    onChange: onPageChange,
    totalItems,
    totalPages: computedTotalPages,
    hasMore,
    pageSize,
    onPageSizeChange,
    pageSizeOptions,
    variant,
    size,
    label,
  };

  // Keep current config in a ref so the plugin can read the latest values
  // without needing to recreate the plugin object on every change.
  const configRef = useRef({paginationProps, position, align});
  configRef.current = {paginationProps, position, align};

  // Stable plugin object \u2014 created once, reads config via ref.
  return useMemo(
    (): TablePlugin<T> => ({
      transformTableContext(children: ReactNode) {
        const {
          position: pos,
          paginationProps: props,
          align: a,
        } = configRef.current;
        if (pos === 'none') return children;

        // Don't render pagination when there's only one page and no more data.
        const resolvedTotalPages =
          props.totalPages ??
          (props.totalItems != null && props.pageSize != null
            ? Math.ceil(props.totalItems / props.pageSize)
            : undefined);
        const isSinglePage = resolvedTotalPages === 1 && props.hasMore !== true;
        if (isSinglePage) return children;

        const makeWrapper = (side: 'above' | 'below') => (
          <div
            {...stylex.props(
              styles.wrapper,
              side === 'below' && styles.marginTop,
              side === 'above' && styles.marginBottom,
              a === 'center' && styles.alignCenter,
              a === 'end' && styles.alignEnd,
              a === 'start' && styles.alignStart,
            )}>
            <XDSPagination {...props} />
          </div>
        );

        return (
          <>
            {(pos === 'above' || pos === 'both') && makeWrapper('above')}
            {children}
            {(pos === 'below' || pos === 'both') && makeWrapper('below')}
          </>
        );
      },
    }),
    [],
  );
}
