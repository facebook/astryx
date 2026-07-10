// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableRowStatus.tsx
 * @input React, StyleX, Table types
 * @output Exports useTableRowStatus hook + config type
 * @position Row-status plugin; consumed by Table via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {TableColumn, TablePlugin} from '../../types';

/**
 * A row's status indicator: a color (any CSS color / token) and an optional
 * accessible label. Return `null` for rows with no status.
 */
export interface TableRowStatus {
  color: string;
  label?: string;
}

/** Configuration for {@link useTableRowStatus}. */
export interface UseTableRowStatusConfig<T extends Record<string, unknown>> {
  /**
   * Derive the status indicator for a row. Return `null` for no indicator.
   * @example
   * ```
   * getStatus: row =>
   *   row.hasError ? {color: 'var(--color-icon-red)', label: 'Error'} : null
   * ```
   */
  getStatus: (item: T) => TableRowStatus | null;
}

const STATUS_COLUMN_WIDTH = {type: 'pixel' as const, value: 8};

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
});

/**
 * Returns a {@link TablePlugin} that prepends a narrow column rendering a
 * full-height colored bar on the row's leading edge — a compact way to signal
 * per-row status (error, warning, unread, etc.) without a full status column.
 *
 * @example
 * ```tsx
 * const rowStatus = useTableRowStatus<Row>({
 *   getStatus: row =>
 *     row.state === 'error'
 *       ? {color: 'var(--color-icon-error)', label: 'Error'}
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
            return (
              <div
                {...stylex.props(styles.bar(status.color))}
                role={status.label ? 'img' : undefined}
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
