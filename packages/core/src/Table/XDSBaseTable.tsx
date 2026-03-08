/**
 * @file XDSBaseTable.tsx
 * @input React, types.ts, columnUtils.ts
 * @output Exports XDSBaseTable component
 * @position Core structural component; wrapped by XDSTable.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (component description, props)
 * - /packages/core/src/Table/XDSTable.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Table/index.ts (exports if types change)
 */

import {
  forwardRef,
  memo,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {
  XDSBaseTableProps,
  XDSTableColumn,
  TablePlugin,
  TableRenderProps,
  HeaderRowRenderProps,
  HeaderCellRenderProps,
  BodyRowRenderProps,
  BodyCellRenderProps,
  TableRowComponentProps,
  TableCellComponentProps,
  TableHeaderCellComponentProps,
} from './types';
import {generateColumns, defaultCellRenderer} from './columnUtils';
import {XDSTableRow} from './XDSTableRow';
import {XDSTableCell} from './XDSTableCell';
import {XDSTableHeaderCell} from './XDSTableHeaderCell';
import {xdsClassName, mergeProps} from '../utils';

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

// =============================================================================
// Memoized Table Row Component
// =============================================================================

// Stable empty array to avoid creating new reference on each render
const EMPTY_PLUGINS: TablePlugin<Record<string, unknown>>[] = [];

interface TableRowProps<T extends Record<string, unknown>> {
  item: T;
  rowIndex: number;
  rowKey: string | number;
  columns: XDSTableColumn<T>[];
  plugins: TablePlugin<T>[];
  RowComponent: React.ComponentType<TableRowComponentProps>;
  CellComponent: React.ComponentType<TableCellComponentProps>;
}

/**
 * Memoized table row component.
 * Only re-renders when the specific row's data changes.
 * Uses component props for context-based styling, with plugin support.
 */
function TableRowInner<T extends Record<string, unknown>>({
  item,
  rowIndex,
  rowKey,
  columns,
  plugins,
  RowComponent,
  CellComponent,
}: TableRowProps<T>): ReactElement {
  // Build cells first
  const cells = columns.map(col => {
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
      <CellComponent
        key={col.key}
        {...cellRenderProps.htmlProps}
        xstyle={cellRenderProps.styles}>
        {content}
      </CellComponent>
    );
  });

  // Apply plugin transforms for row (with pre-rendered children)
  const rowRenderProps = applyPlugins(
    plugins,
    p => p.transformBodyRow,
    {htmlProps: {}, styles: [], children: <>{cells}</>} as BodyRowRenderProps,
    item,
    rowIndex,
  );

  return (
    <RowComponent
      key={rowKey}
      {...rowRenderProps.htmlProps}
      xstyle={rowRenderProps.styles}>
      {rowRenderProps.children}
    </RowComponent>
  );
}

/**
 * Compares TableRowProps to determine if re-render is needed.
 * Shallow compares the item object and checks if columns/plugins references changed.
 */
function areRowPropsEqual<T extends Record<string, unknown>>(
  prevProps: TableRowProps<T>,
  nextProps: TableRowProps<T>,
): boolean {
  // Row index affects CSS :nth-child styling, but not React re-render
  // We don't compare rowIndex as it's handled by CSS
  if (prevProps.rowKey !== nextProps.rowKey) return false;

  // If columns, plugins, or components change, need to re-render all rows
  if (prevProps.columns !== nextProps.columns) return false;
  if (prevProps.plugins !== nextProps.plugins) return false;
  if (prevProps.RowComponent !== nextProps.RowComponent) return false;
  if (prevProps.CellComponent !== nextProps.CellComponent) return false;

  // Shallow compare the item - if same reference, skip re-render
  if (prevProps.item === nextProps.item) return true;

  // Different object reference - compare values
  const prevItem = prevProps.item;
  const nextItem = nextProps.item;
  const keys = Object.keys(nextItem);

  for (const key of keys) {
    if (prevItem[key] !== nextItem[key]) return false;
  }

  return true;
}

// Create the memoized component
const MemoizedTableRow = memo(TableRowInner, areRowPropsEqual) as <
  T extends Record<string, unknown>,
>(
  props: TableRowProps<T>,
) => ReactElement;

// =============================================================================
// XDSBaseTable Component
// =============================================================================

/**
 * Inner XDSBaseTable implementation (generic-preserving).
 */
function XDSBaseTableInner<T extends Record<string, unknown>>(
  {
    data,
    columns: columnsProp,
    idKey,
    plugins: pluginsProp,
    components,
    children,
    tableProps: userTableProps,
  }: XDSBaseTableProps<T>,
  ref: Ref<HTMLTableElement>,
): ReactElement {
  // Use stable empty array when no plugins provided
  const plugins = pluginsProp ?? (EMPTY_PLUGINS as TablePlugin<T>[]);

  const RowComponent = (components?.Row ??
    XDSTableRow) as React.ComponentType<TableRowComponentProps>;
  const CellComponent = (components?.Cell ??
    XDSTableCell) as React.ComponentType<TableCellComponentProps>;
  const HeaderCellComponent = (components?.HeaderCell ??
    XDSTableHeaderCell) as React.ComponentType<TableHeaderCellComponentProps>;

  // Resolve columns: explicit > auto-generated from data
  const resolvedColumns: XDSTableColumn<T>[] =
    columnsProp ?? (data ? generateColumns(data) : []);

  // --- Plugin pipeline: table ---
  const tableRenderProps = applyPlugins(plugins, p => p.transformTable, {
    htmlProps: {...userTableProps},
    styles: [styles.table],
  } as TableRenderProps);

  // --- Plugin pipeline: header cells ---
  const headerCells = resolvedColumns.map(col => {
    const cellRenderProps = applyPlugins(
      plugins,
      p => p.transformHeaderCell,
      {htmlProps: {}, styles: []} as HeaderCellRenderProps,
      col,
    );

    return (
      <HeaderCellComponent
        key={col.key}
        {...cellRenderProps.htmlProps}
        xstyle={cellRenderProps.styles}>
        {col.header ?? col.key}
      </HeaderCellComponent>
    );
  });

  // --- Plugin pipeline: header row ---
  const headerRowRenderProps = applyPlugins(
    plugins,
    p => p.transformHeaderRow,
    {
      htmlProps: {},
      styles: [],
      children: <>{headerCells}</>,
    } as HeaderRowRenderProps,
  );

  // --- Render ---
  const hasData = data != null && data.length > 0;
  const hasColumns = resolvedColumns.length > 0;

  let tableElement: ReactNode = (
    <table
      ref={ref}
      {...tableRenderProps.htmlProps}
      {...mergeProps(
        xdsClassName('base-table'),
        stylex.props(...tableRenderProps.styles),
      )}>
      {/* thead */}
      {hasColumns && (
        <thead>
          <RowComponent
            {...headerRowRenderProps.htmlProps}
            xstyle={headerRowRenderProps.styles}>
            {headerRowRenderProps.children}
          </RowComponent>
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

              return (
                <MemoizedTableRow<T>
                  key={rowKey}
                  item={item}
                  rowIndex={rowIndex}
                  rowKey={rowKey}
                  columns={resolvedColumns}
                  plugins={plugins}
                  RowComponent={RowComponent}
                  CellComponent={CellComponent}
                />
              );
            })}
      </tbody>
    </table>
  );

  // Apply transformTableContext from each plugin (outermost-first)
  for (const plugin of plugins) {
    if (plugin.transformTableContext) {
      tableElement = plugin.transformTableContext(tableElement);
    }
  }

  return tableElement as ReactElement;
}

/**
 * XDSBaseTable — an unstyled, generic `<table>` component.
 *
 * Supports data-driven rendering (via `data` + `columns`) and children mode.
 * Applies plugins as a transform pipeline over render props.
 * Accepts a `components` prop to render styled components instead of raw elements.
 *
 * @example
 * ```
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(XDSBaseTable as any).displayName = 'XDSBaseTable';
