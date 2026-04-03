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

import {memo, useRef, type ReactElement, type ReactNode, type Ref} from 'react';
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
import {
  generateColumns,
  defaultCellRenderer,
  resolveColumnWidths,
} from './columnUtils';
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
 * Wraps each transform in a try-catch so a single broken plugin
 * doesn't crash the entire table. In development, logs a warning
 * with the plugin index and error details.
 */
function applyPlugins<TPlugin, TProps, TArgs extends unknown[]>(
  plugins: TPlugin[],
  getter: (
    p: TPlugin,
  ) => ((props: TProps, ...args: TArgs) => TProps) | undefined,
  initial: TProps,
  ...args: TArgs
): TProps {
  return plugins.reduce<TProps>((acc, plugin, index) => {
    const transform = getter(plugin);
    if (!transform) return acc;
    try {
      return transform(acc, ...args);
    } catch (error) {
      console.error(
        `[XDSTable] Plugin at index ${index} threw in transform:`,
        error,
      );
      return acc;
    }
  }, initial);
}

// =============================================================================
// Memoized Table Row Component
// =============================================================================

// Stable empty array to avoid creating new reference on each render
const EMPTY_PLUGINS: TablePlugin<Record<string, unknown>>[] = [];

/**
 * Shallow-compare two arrays by element identity.
 * Used to stabilize the resolved columns array across renders.
 */
function areArraysShallowEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

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

    // Default renderer: add title so truncated text is accessible on hover.
    // For the full XDS tooltip experience, use renderCell with
    // <XDSText maxLines={1}> — the title attr is the zero-cost safety net.
    const titleProp =
      !col.renderCell && typeof content === 'string' && content.length > 0
        ? {title: content}
        : {};

    return (
      <CellComponent
        key={col.key}
        {...cellRenderProps.htmlProps}
        {...titleProp}
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
      ref={rowRenderProps.ref}
      {...rowRenderProps.htmlProps}
      xstyle={rowRenderProps.styles}>
      {rowRenderProps.children}
    </RowComponent>
  );
}

/**
 * Compares TableRowProps to determine if re-render is needed.
 * Shallow compares the item object and checks if columns/plugins references changed.
 *
 * Includes rowIndex in the comparison so that plugins using the index
 * (e.g. for row numbering or conditional formatting) get correct values
 * after insertions/deletions. This also future-proofs for tree grid
 * index paths where structural position matters.
 */
function areRowPropsEqual<T extends Record<string, unknown>>(
  prevProps: TableRowProps<T>,
  nextProps: TableRowProps<T>,
): boolean {
  if (prevProps.rowKey !== nextProps.rowKey) return false;
  if (prevProps.rowIndex !== nextProps.rowIndex) return false;

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
function XDSBaseTableInner<T extends Record<string, unknown>>({
  data,
  columns: columnsProp,
  idKey,
  plugins: pluginsProp,
  components,
  children,
  tableProps: userTableProps,
  ref,
}: XDSBaseTableProps<T> & {ref?: Ref<HTMLTableElement>}): ReactElement {
  // Use stable empty array when no plugins provided
  const plugins = pluginsProp ?? (EMPTY_PLUGINS as TablePlugin<T>[]);

  const RowComponent = (components?.Row ??
    XDSTableRow) as React.ComponentType<TableRowComponentProps>;
  const CellComponent = (components?.Cell ??
    XDSTableCell) as React.ComponentType<TableCellComponentProps>;
  const HeaderCellComponent = (components?.HeaderCell ??
    XDSTableHeaderCell) as React.ComponentType<TableHeaderCellComponentProps>;

  // Resolve columns: explicit > auto-generated from data.
  const baseColumns: XDSTableColumn<T>[] =
    columnsProp ?? (data ? generateColumns(data) : []);

  // --- Plugin pipeline: transformColumns ---
  // Runs before any element-level transforms. Allows plugins to filter,
  // reorder, or inject synthetic columns (e.g. selection checkbox).
  const transformedColumns = applyPlugins(
    plugins,
    p => p.transformColumns,
    baseColumns,
  );

  // Stabilize the resolved columns array — transformColumns returns a
  // new array on every call, but if the contents haven't changed, we
  // reuse the previous reference. This prevents MemoizedTableRow from
  // re-rendering all rows when the column array is structurally identical.
  const resolvedColumnsRef = useRef(transformedColumns);
  if (!areArraysShallowEqual(resolvedColumnsRef.current, transformedColumns)) {
    resolvedColumnsRef.current = transformedColumns;
  }
  const resolvedColumns = resolvedColumnsRef.current;

  // Resolve all column widths in a single pass — produces per-column
  // inline styles and the aggregate table min-width.
  const resolvedWidths = resolveColumnWidths(resolvedColumns);

  // --- Plugin pipeline: table ---
  const tableRenderProps = applyPlugins(plugins, p => p.transformTable, {
    htmlProps: {...userTableProps},
    styles: [styles.table],
  } as TableRenderProps);

  // --- Plugin pipeline: header cells ---
  const headerCells = resolvedColumns.map(col => {
    const headerContent = col.header ?? col.key;

    const cellRenderProps = applyPlugins(
      plugins,
      p => p.transformHeaderCell,
      {
        htmlProps: {'data-column-key': col.key},
        styles: [],
        content: headerContent,
      } as HeaderCellRenderProps,
      col,
    );

    // Apply pre-computed column width styles on the <th>.
    // With table-layout: fixed, header cell sizing controls column widths.
    const widthStyle = resolvedWidths.columns.get(col.key)?.style ?? {};

    const existingStyle = cellRenderProps.htmlProps.style as
      | React.CSSProperties
      | undefined;
    const mergedHtmlProps = {
      ...cellRenderProps.htmlProps,
      style: existingStyle ? {...widthStyle, ...existingStyle} : widthStyle,
    };

    // Resolve header content from slots — plugins write to named slots
    // to avoid conflicts (e.g. sort writes `after`, resize writes `overlay`)
    const resolvedContent = cellRenderProps.content ?? headerContent;
    const headerTitleProp =
      typeof resolvedContent === 'string' && resolvedContent.length > 0
        ? {title: resolvedContent}
        : {};
    const {before, after, overlay} = cellRenderProps;
    const hasSlots = before != null || after != null || overlay != null;

    return (
      <HeaderCellComponent
        key={col.key}
        {...mergedHtmlProps}
        {...headerTitleProp}
        xstyle={cellRenderProps.styles}>
        {hasSlots ? (
          <>
            {before}
            {resolvedContent}
            {after}
            {overlay}
          </>
        ) : (
          resolvedContent
        )}
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

  const tableStyle: React.CSSProperties = {
    ...(tableRenderProps.htmlProps.style as React.CSSProperties | undefined),
    minWidth:
      resolvedWidths.tableMinWidth > 0
        ? `${resolvedWidths.tableMinWidth}px`
        : undefined,
  };

  let tableElement: ReactNode = (
    <table
      ref={ref}
      {...tableRenderProps.htmlProps}
      {...mergeProps(
        xdsClassName('base-table'),
        stylex.props(...tableRenderProps.styles),
      )}
      style={tableStyle}>
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

  // Apply transformTableContext from each plugin.
  // Iterates in reverse so the first plugin in the array wraps outermost,
  // matching the mental model: plugins are listed in priority order, and
  // the first plugin's context provider encompasses all others.
  for (let i = plugins.length - 1; i >= 0; i--) {
    const plugin = plugins[i];
    if (plugin.transformTableContext) {
      try {
        tableElement = plugin.transformTableContext(tableElement);
      } catch (error) {
        console.error(
          '[XDSTable] Plugin threw in transformTableContext:',
          error,
        );
      }
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
export const XDSBaseTable = XDSBaseTableInner as <
  T extends Record<string, unknown>,
>(
  props: XDSBaseTableProps<T> & {ref?: Ref<HTMLTableElement>},
) => ReactElement;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(XDSBaseTable as any).displayName = 'XDSBaseTable';
