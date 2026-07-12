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
 * Provide `icon` to signal status by shape as well as color — more accessible
 * when several statuses coexist. Provide `label` for an accessible name
 * (strongly recommended; without it the indicator is color-only). Return
 * `null` for rows with no status.
 */
export interface TableRowStatus {
  /** Semantic status color (preferred) or a raw CSS color string. */
  color: TableRowStatusColor | (string & {});
  /** Optional icon rendered as the signifier (shape as an a11y differentiator). */
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

// Bar mode overlays a 4px bar on the leading edge (needs almost no width);
// icon mode needs room for the glyph. Reserve icon width so a mixed table
// never clips — the extra padding is negligible for bar-only tables.
const STATUS_COLUMN_WIDTH = {type: 'pixel' as const, value: 28};

/** Resolve a semantic color name to a token, or pass a raw CSS color through. */
function resolveColor(color: string): string {
  return (SEMANTIC_COLORS as Record<string, string>)[color] ?? color;
}

const styles = stylex.create({
  // The status cell hosts a full-height bar. Zero its own padding so the bar
  // reaches the row's vertical edges, and anchor the absolutely-positioned bar.
  cell: {
    position: 'relative',
    paddingInline: 0,
    paddingBlock: 0,
  },
  bar: (color: string) => ({
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    width: '4px',
    backgroundColor: color,
  }),
  iconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * Returns a {@link TablePlugin} that prepends a narrow column signaling per-row
 * status: a full-height colored bar on the leading edge, or an icon when
 * `icon` is provided (shape + color is more accessible than color alone).
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
                  {...stylex.props(styles.iconWrap)}
                  role={role}
                  aria-label={status.label}
                  title={status.label}>
                  <Icon icon={status.icon} size="xsm" color={iconColor} />
                </span>
              );
            }
            return (
              <div
                {...stylex.props(styles.bar(resolveColor(status.color)))}
                role={role}
                aria-label={status.label}
                title={status.label}
              />
            );
          },
        };
        return [statusColumn, ...columns];
      },

      transformBodyCell(props, column) {
        if (column.key !== '__rowStatus') {
          return props;
        }
        return {...props, styles: [...props.styles, styles.cell]};
      },
    }),
    [getStatus],
  );
}
