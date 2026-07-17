// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableRowStatus.tsx
 * @input React, StyleX, Icon, Table types
 * @output Exports useTableRowStatus hook + config type
 * @position Row-status plugin; consumed by Table via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Icon, type IconColor, type IconName} from '../../../Icon';
import type {TableColumn, TablePlugin} from '../../types';

/**
 * Semantic status colors, resolved to the design system's icon color tokens.
 * Prefer these over raw CSS so status colors stay consistent with the theme.
 */
export type TableRowStatusColor =
  | 'accent'
  | 'success'
  | 'error'
  | 'warning'
  | 'red'
  | 'orange'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'gray';

const SEMANTIC_COLORS: Record<TableRowStatusColor, string> = {
  accent: 'var(--color-icon-accent)',
  success: 'var(--color-icon-green)',
  error: 'var(--color-icon-red)',
  warning: 'var(--color-icon-orange)',
  red: 'var(--color-icon-red)',
  orange: 'var(--color-icon-orange)',
  green: 'var(--color-icon-green)',
  yellow: 'var(--color-icon-yellow)',
  blue: 'var(--color-icon-blue)',
  gray: 'var(--color-icon-gray)',
};

/** Icon colors that map cleanly from a semantic status color. */
const ICON_COLOR_BY_STATUS: Record<TableRowStatusColor, IconColor> = {
  accent: 'accent',
  success: 'success',
  error: 'error',
  warning: 'warning',
  red: 'red',
  orange: 'warning',
  green: 'green',
  yellow: 'warning',
  blue: 'blue',
  gray: 'gray',
};

/**
 * A row's status indicator. `color` accepts a semantic status color
 * (mapped to a theme token) or any raw CSS color string as an escape hatch.
 * By default the plugin renders a colored status dot. Provide `icon` to signal
 * status by shape as well as color, which is more accessible when several
 * statuses coexist. Provide `label` for an accessible name (strongly
 * recommended; without it the indicator is color-only). Return `null` for
 * rows with no status.
 */
export interface TableRowStatus {
  /** Semantic status color (preferred) or a raw CSS color string. */
  color: TableRowStatusColor | (string & {});
  /** Optional icon rendered as the signifier instead of the dot (shape as an a11y differentiator). */
  icon?: IconName;
  /** Accessible label; announced via role="img". Recommended. */
  label?: string;
}

/** Configuration for {@link useTableRowStatus}. */
export interface UseTableRowStatusConfig<T extends Record<string, unknown>> {
  /**
   * Derive the status indicator for a row. Return `null` for no indicator.
   * Memoize with `useCallback` for a stable plugin identity across renders.
   *
   * @example
   * ```
   * getStatus: row =>
   *   row.hasError ? {color: 'error', icon: 'error', label: 'Error'} : null
   * ```
   */
  getStatus: (item: T) => TableRowStatus | null;
}

// The status column holds a small centered dot (or an icon when provided).
// A fixed narrow width keeps every row's indicator aligned in one gutter.
const STATUS_COLUMN_WIDTH = {type: 'pixel' as const, value: 28};

/** Resolve a semantic color name to a token, or pass a raw CSS color through. */
function resolveColor(color: string): string {
  return (SEMANTIC_COLORS as Record<string, string>)[color] ?? color;
}

const styles = stylex.create({
  // Centers the dot or icon within the narrow status column.
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: (color: string) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
  }),
});

/**
 * Returns a {@link TablePlugin} that prepends a narrow column signaling per-row
 * status: a colored status dot by default, or an icon when `icon` is provided
 * (shape + color is more accessible than color alone).
 *
 * @example
 * ```
 * const rowStatus = useTableRowStatus<Row>({
 *   getStatus: row =>
 *     row.state === 'error'
 *       ? {color: 'error', icon: 'error', label: 'Error'}
 *       : null,
 * });
 * <Table data={data} columns={columns} idKey="id" plugins={{rowStatus}} />;
 * ```
 */
export function useTableRowStatus<T extends Record<string, unknown>>(
  config: UseTableRowStatusConfig<T>,
): TablePlugin<T> {
  const {getStatus} = config;

  return useMemo(
    (): TablePlugin<T> => ({
      transformColumns(columns) {
        const statusColumn: TableColumn<T> = {
          key: '__rowStatus',
          header: '',
          width: STATUS_COLUMN_WIDTH,
          resizable: false,
          renderCell: (item: T) => {
            const status = getStatus(item);
            if (!status) {
              return null;
            }
            const role = status.label ? 'img' : undefined;
            if (status.icon) {
              const iconColor: IconColor =
                ICON_COLOR_BY_STATUS[status.color as TableRowStatusColor] ??
                'primary';
              return (
                <span
                  {...stylex.props(styles.wrap)}
                  role={role}
                  aria-label={status.label}
                  title={status.label}>
                  <Icon icon={status.icon} size="xsm" color={iconColor} />
                </span>
              );
            }
            return (
              <span
                {...stylex.props(styles.wrap)}
                role={role}
                aria-label={status.label}
                title={status.label}>
                <span
                  {...stylex.props(styles.dot(resolveColor(status.color)))}
                />
              </span>
            );
          },
        };
        return [statusColumn, ...columns];
      },
    }),
    [getStatus],
  );
}
