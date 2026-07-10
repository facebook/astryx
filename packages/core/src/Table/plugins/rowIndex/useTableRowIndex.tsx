// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableRowIndex.tsx
 * @input React, StyleX, Table types + the rendered data array
 * @output Exports useTableRowIndex hook + config type
 * @position Row-index plugin; consumed by Table via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, typeScaleVars} from '../../../theme/tokens.stylex';

import type {TableColumn, TablePlugin} from '../../types';

/**
 * Configuration for {@link useTableRowIndex}.
 *
 * Astryx's `renderCell` receives only the row item (not its position), so the
 * plugin needs the rendered `data` array — the same array passed to
 * `<Table data>` — to derive each row's 1-based ordinal. Pass `getRowKey` when
 * items don't have a stable identity by reference (e.g. new objects each render).
 */
export interface UseTableRowIndexConfig<T extends Record<string, unknown>> {
  /** The data array currently rendered by the table (post sort/filter/page). */
  data: T[];
  /**
   * Optional stable key extractor. When provided, index lookup is keyed by the
   * returned string; otherwise items are matched by reference identity.
   */
  getRowKey?: (item: T) => string;
  /** Header label for the index column. @default '#' */
  label?: ReactNode;
  /** First index value. @default 1 */
  startFrom?: number;
}

const INDEX_COLUMN_WIDTH = {type: 'pixel' as const, value: 48};

const styles = stylex.create({
  index: {
    fontFamily: 'var(--font-family-code)',
    fontSize: typeScaleVars['--text-supporting-size'],
    fontVariantNumeric: 'tabular-nums',
    color: colorVars['--color-text-secondary'],
  },
});

/**
 * Returns a {@link TablePlugin} that prepends a right-aligned, monospaced
 * row-number column. Numbering follows the order of the rendered `data` array,
 * so it reflects the current sort / filter / pagination view.
 *
 * @example
 * ```tsx
 * const rowIndex = useTableRowIndex({data});
 * <Table data={data} columns={columns} idKey="id" plugins={{rowIndex}} />;
 * ```
 */
export function useTableRowIndex<T extends Record<string, unknown>>(
  config: UseTableRowIndexConfig<T>,
): TablePlugin<T> {
  const {data, getRowKey, label = '#', startFrom = 1} = config;

  // item → ordinal lookup. Keyed by getRowKey when provided (stable across
  // new object identities), otherwise by reference.
  const indexByKey = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item, i) => {
      if (getRowKey) {
        map.set(getRowKey(item), i);
      }
    });
    return map;
  }, [data, getRowKey]);

  const indexByRef = useMemo(() => {
    const map = new Map<T, number>();
    if (!getRowKey) {
      data.forEach((item, i) => map.set(item, i));
    }
    return map;
  }, [data, getRowKey]);

  return useMemo(
    (): TablePlugin<T> => ({
      transformColumns(columns) {
        const indexColumn: TableColumn<T> = {
          key: '__rowIndex',
          header: label,
          width: INDEX_COLUMN_WIDTH,
          align: 'end',
          resizable: false,
          renderCell: (item: T) => {
            const idx = getRowKey
              ? indexByKey.get(getRowKey(item))
              : indexByRef.get(item);
            if (idx == null) {
              return null;
            }
            return (
              <span {...stylex.props(styles.index)}>{idx + startFrom}</span>
            );
          },
        };
        return [indexColumn, ...columns];
      },
    }),
    [label, startFrom, getRowKey, indexByKey, indexByRef],
  );
}
