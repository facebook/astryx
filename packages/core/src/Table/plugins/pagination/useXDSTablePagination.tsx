'use client';

/**
 * @file useXDSTablePagination.tsx
 * @input React, XDSPagination, Table plugin types
 * @output Exports useXDSTablePagination hook and config/return types
 * @position Pagination plugin; consumed by XDSTable via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/plugins/pagination/index.ts (exports)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useCallback, useMemo, useRef, type ReactNode} from 'react';
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
 * Headless pagination state management for XDSTable. The consumer owns all
 * state — this hook provides data helpers and a plugin that integrates with
 * the table's plugin pipeline.
 *
 * @example
 * ```
 * const [page, setPage] = useState(1);
 * const [pageSize, setPageSize] = useState(20);
 *
 * const pagination = useXDSTablePagination({
 *   page,
 *   onPageChange: setPage,
 *   totalItems: data.length,
 *   pageSize,
 * });
 *
 * <XDSTable
 *   data={pagination.paginatedData(data)}
 *   columns={columns}
 *   plugins={{ pagination: pagination.plugin }}
 * />
 * ```
 *
 * @example
 * ```
 * const pagination = useXDSTablePagination({
 *   page,
 *   onPageChange: (p) => fetchPage(p),
 *   totalItems: serverTotal,
 *   pageSize: 25,
 * });
 *
 * // Data is already sliced by the server — don't use paginatedData()
 * <XDSTable
 *   data={serverData}
 *   columns={columns}
 *   plugins={{ pagination: pagination.plugin }}
 * />
 * ```
 *
 * @example
 * ```
 * const pagination = useXDSTablePagination({
 *   page,
 *   onPageChange: setPage,
 *   totalItems: data.length,
 *   pageSize,
 *   onPageSizeChange: setPageSize,
 *   pageSizeOptions: [10, 25, 50, 100],
 * });
 * ```
 *
 * @example
 * ```
 * const pagination = useXDSTablePagination({
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
   * Used to calculate total page count and "X–Y of Z" display.
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
   * - 'below' — renders pagination after the table (default)
   * - 'above' — renders pagination before the table
   * - 'both' — renders pagination above and below the table
   * - 'none' — does not auto-render; use `paginationProps` manually
   *
   * Only applies when using the plugin's `transformTableContext`.
   * @default 'below'
   */
  position?: 'below' | 'above' | 'both' | 'none';

  /**
   * Horizontal alignment of the pagination controls within their container.
   * - 'start' — left-aligned (default)
   * - 'center' — centered
   * - 'end' — right-aligned
   *
   * @default 'start'
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
// Return Type
// =============================================================================

/**
 * Return value of useXDSTablePagination.
 */
export interface UseXDSTablePaginationReturn<
  T extends Record<string, unknown>,
> {
  /** The TablePlugin to pass to XDSTable's plugins prop. */
  plugin: TablePlugin<T>;

  /**
   * Props to spread onto an XDSPagination component.
   * Use this when `position` is 'none' and you want to render
   * pagination controls in a custom location.
   *
   * @example
   * ```
   * <div className="toolbar">
   *   <XDSPagination {...pagination.paginationProps} />
   * </div>
   * ```
   */
  paginationProps: XDSPaginationProps;

  /**
   * Slices the full data array for the current page.
   * Use for client-side pagination where you have all the data.
   * For server-side pagination (data already sliced), pass data directly.
   *
   * @example
   * ```
   * <XDSTable data={pagination.paginatedData(allData)} ... />
   * ```
   */
  paginatedData: (data: T[]) => T[];

  /** Current page number (1-based). */
  page: number;

  /** Computed total number of pages (undefined for cursor-based). */
  totalPages: number | undefined;

  /** Current page size. */
  pageSize: number;
}

// =============================================================================
// Hook
// =============================================================================

export function useXDSTablePagination<T extends Record<string, unknown>>(
  config: UseXDSTablePaginationConfig,
): UseXDSTablePaginationReturn<T> {
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
    align = 'start',
    label = 'Table pagination',
  } = config;

  const computedTotalPages =
    totalPagesProp ??
    (totalItems != null ? Math.ceil(totalItems / pageSize) : undefined);

  // Build XDSPagination props from config
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

  // Client-side data slicing helper
  const paginatedData = useCallback(
    (data: T[]): T[] => {
      const start = (page - 1) * pageSize;
      return data.slice(start, start + pageSize);
    },
    [page, pageSize],
  );

  // Keep current config in a ref so the plugin can read the latest values
  // without needing to recreate the plugin object on every change.
  const configRef = useRef({paginationProps, position, align});
  configRef.current = {paginationProps, position, align};

  // Stable plugin object — created once, reads config via ref.
  // The transformTableContext renders XDSPagination which reads current
  // props from the ref, so the pagination UI always reflects the latest state
  // without changing the plugin identity.
  const plugin = useMemo(
    (): TablePlugin<T> => ({
      transformTableContext(children: ReactNode) {
        const {
          position: pos,
          paginationProps: props,
          align: a,
        } = configRef.current;
        if (pos === 'none') return children;

        // Don't render pagination when there's only one page and no more data.
        // This can happen when filters reduce the result set to a single page.
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

  return {
    plugin,
    paginationProps,
    paginatedData,
    page,
    totalPages: computedTotalPages,
    pageSize,
  };
}
