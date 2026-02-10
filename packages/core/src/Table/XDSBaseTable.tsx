/**
 * @file XDSBaseTable.tsx
 * @input React, types.ts, columnUtils.ts
 * @output Exports XDSBaseTable component
 * @position Core structural component; wrapped by XDSTable.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/README.md (component description, props)
 * - /packages/core/src/Table/XDSTable.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Table/index.ts (exports if types change)
 */

import {forwardRef, type ReactElement, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {
  XDSBaseTableProps,
  XDSTableColumn,
  TableRenderProps,
  HeaderRowRenderProps,
  HeaderCellRenderProps,
  BodyRowRenderProps,
  BodyCellRenderProps,
} from './types';
import {
  generateColumns,
  defaultCellRenderer,
  columnWidthToCSS,
} from './columnUtils';

const styles = stylex.create({
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderSpacing: '0',
    tableLayout: 'fixed',
  },
});

/**
 * Run a value through a pipeline of plugin transform functions.
 */
function applyPlugins<TPlugin, TProps, TArgs extends unknown[]>(
  plugins: TPlugin[],
  getter: (
    p: TPlugin,
  ) => ((props: TProps, ...args: TArgs) => TProps) | undefined,
  initial: TProps,
  ...args: TArgs
): TProps {
  return plugins.reduce<TProps>((acc, plugin) => {
    const transform = getter(plugin);
    return transform ? transform(acc, ...args) : acc;
  }, initial);
}

/**
 * Compute total proportional units for percentage calculation.
 */
function getTotalProportional<T extends Record<string, unknown>>(
  columns: XDSTableColumn<T>[],
): number {
  return columns.reduce((sum, col) => {
    const w = col.width ?? {type: 'proportional' as const, value: 1};
    return w.type === 'proportional' ? sum + w.value : sum;
  }, 0);
}

/**
 * Inner XDSBaseTable implementation (generic-preserving).
 */
function XDSBaseTableInner<T extends Record<string, unknown>>(
  {
    data,
    columns: columnsProp,
    idKey,
    plugins = [],
    children,
    tableProps: userTableProps,
  }: XDSBaseTableProps<T>,
  ref: Ref<HTMLTableElement>,
): ReactElement {
  // Resolve columns: explicit > auto-generated from data
  const resolvedColumns: XDSTableColumn<T>[] =
    columnsProp ?? (data ? generateColumns(data) : []);

  const totalProportional = getTotalProportional(resolvedColumns);

  // --- Plugin pipeline: table ---
  const tableRenderProps = applyPlugins(plugins, p => p.transformTable, {
    htmlProps: {...userTableProps},
    styles: [styles.table],
  } as TableRenderProps);

  // --- Plugin pipeline: header row ---
  const headerRowRenderProps = applyPlugins(
    plugins,
    p => p.transformHeaderRow,
    {htmlProps: {}, styles: []} as HeaderRowRenderProps,
  );

  // --- Render ---
  const hasData = data != null && data.length > 0;
  const hasColumns = resolvedColumns.length > 0;

  return (
    <table
      ref={ref}
      {...tableRenderProps.htmlProps}
      {...stylex.props(...tableRenderProps.styles)}>
      {/* colgroup for column widths */}
      {hasColumns && (
        <colgroup>
          {resolvedColumns.map(col => {
            const w = col.width ?? {type: 'proportional' as const, value: 1};
            return (
              <col
                key={col.key}
                style={{width: columnWidthToCSS(w, totalProportional)}}
              />
            );
          })}
        </colgroup>
      )}

      {/* thead */}
      {hasColumns && (
        <thead>
          <tr
            {...headerRowRenderProps.htmlProps}
            {...stylex.props(...headerRowRenderProps.styles)}>
            {resolvedColumns.map(col => {
              const cellRenderProps = applyPlugins(
                plugins,
                p => p.transformHeaderCell,
                {htmlProps: {}, styles: []} as HeaderCellRenderProps,
                col,
              );

              return (
                <th
                  key={col.key}
                  {...cellRenderProps.htmlProps}
                  {...stylex.props(...cellRenderProps.styles)}>
                  {col.header ?? col.key}
                </th>
              );
            })}
          </tr>
        </thead>
      )}

      {/* tbody — data-driven or children mode */}
      <tbody>
        {children
          ? children
          : hasData &&
            data.map((item, rowIndex) => {
              const rowKey =
                idKey == null
                  ? rowIndex
                  : typeof idKey === 'function'
                    ? idKey(item)
                    : String(item[idKey]);

              const rowRenderProps = applyPlugins(
                plugins,
                p => p.transformBodyRow,
                {htmlProps: {}, styles: []} as BodyRowRenderProps,
                item,
                rowIndex,
              );

              return (
                <tr
                  key={rowKey}
                  {...rowRenderProps.htmlProps}
                  {...stylex.props(...rowRenderProps.styles)}>
                  {resolvedColumns.map(col => {
                    const cellRenderProps = applyPlugins(
                      plugins,
                      p => p.transformBodyCell,
                      {htmlProps: {}, styles: []} as BodyCellRenderProps,
                      col,
                      item,
                    );

                    const content = col.renderCell
                      ? col.renderCell(item)
                      : defaultCellRenderer(item, col.key);

                    return (
                      <td
                        key={col.key}
                        {...cellRenderProps.htmlProps}
                        {...stylex.props(...cellRenderProps.styles)}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
      </tbody>
    </table>
  );
}

/**
 * XDSBaseTable — an unstyled, generic `<table>` component.
 *
 * Supports data-driven rendering (via `data` + `columns`) and children mode.
 * Applies plugins as a transform pipeline over render props.
 *
 * @example
 * ```tsx
 * <XDSBaseTable
 *   data={[{ name: 'Alice', age: 30 }]}
 *   columns={[
 *     { key: 'name', header: 'Name' },
 *     { key: 'age', header: 'Age', width: pixel(80) },
 *   ]}
 * />
 * ```
 */
export const XDSBaseTable = forwardRef(XDSBaseTableInner) as <
  T extends Record<string, unknown>,
>(
  props: XDSBaseTableProps<T> & {ref?: Ref<HTMLTableElement>},
) => ReactElement;
