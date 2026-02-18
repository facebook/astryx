/**
 * @file types.ts
 * @input None (pure type definitions)
 * @output Exports base Table interfaces: column, render props, plugin, XDSBaseTableProps
 * @position Type foundation; consumed by XDSBaseTable and extended by XDSTable
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/README.md (type descriptions)
 * - /packages/core/src/Table/index.ts (exports if types change)
 */

import type {
  ComponentType,
  HTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
  ReactNode,
} from 'react';
import type {StyleXStyles} from '../theme/types';

// =============================================================================
// Column Width
// =============================================================================

/**
 * A proportional (fr-like) column width.
 * Use the `proportional()` helper to create.
 */
export interface ProportionalWidth {
  type: 'proportional';
  value: number;
}

/**
 * A fixed pixel column width.
 * Use the `pixel()` helper to create.
 */
export interface PixelWidth {
  type: 'pixel';
  value: number;
}

/** Column width — either proportional or fixed pixel */
export type ColumnWidth = ProportionalWidth | PixelWidth;

// =============================================================================
// Column Definition
// =============================================================================

/**
 * Column definition for data-driven table rendering.
 *
 * @template T - The row data type
 */
export interface XDSTableColumn<T extends Record<string, unknown>> {
  /** Unique key identifying this column. Used as React key and to access data. */
  key: string;
  /** Header text displayed in `<th>`. Defaults to capitalized `key`. */
  header?: ReactNode;
  /** Column width. Defaults to `proportional(1)`. */
  width?: ColumnWidth;
  /**
   * Custom cell renderer. Receives the row item.
   * Defaults to `String(item[key])`.
   */
  renderCell?: (item: T) => ReactNode;
}

// =============================================================================
// Render Props (Plugin Transform Targets)
// =============================================================================

/** Props passed through the plugin pipeline for the `<table>` element */
export interface TableRenderProps {
  htmlProps: HTMLAttributes<HTMLTableElement>;
  styles: StyleXStyles[];
}

/** Props passed through the plugin pipeline for the header `<tr>` */
export interface HeaderRowRenderProps {
  htmlProps: HTMLAttributes<HTMLTableRowElement>;
  styles: StyleXStyles[];
  children: ReactNode;
}

/** Props passed through the plugin pipeline for each `<th>` */
export interface HeaderCellRenderProps {
  htmlProps: ThHTMLAttributes<HTMLTableCellElement>;
  styles: StyleXStyles[];
}

/** Props passed through the plugin pipeline for each body `<tr>` */
export interface BodyRowRenderProps {
  htmlProps: HTMLAttributes<HTMLTableRowElement>;
  styles: StyleXStyles[];
  children: ReactNode;
}

/** Props passed through the plugin pipeline for each body `<td>` */
export interface BodyCellRenderProps {
  htmlProps: TdHTMLAttributes<HTMLTableCellElement>;
  styles: StyleXStyles[];
}

// =============================================================================
// Plugin Interface
// =============================================================================

/**
 * Table plugin — transforms render props at each structural level.
 * Plugins compose by sequential application (first plugin's output feeds next).
 */
export interface TablePlugin<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Transform the root `<table>` element props */
  transformTable?: (props: TableRenderProps) => TableRenderProps;
  /** Transform the header `<tr>` props */
  transformHeaderRow?: (props: HeaderRowRenderProps) => HeaderRowRenderProps;
  /** Transform each `<th>` props */
  transformHeaderCell?: (
    props: HeaderCellRenderProps,
    column: XDSTableColumn<T>,
  ) => HeaderCellRenderProps;
  /** Transform each body `<tr>` props */
  transformBodyRow?: (
    props: BodyRowRenderProps,
    item: T,
    index: number,
  ) => BodyRowRenderProps;
  /** Transform each body `<td>` props */
  transformBodyCell?: (
    props: BodyCellRenderProps,
    column: XDSTableColumn<T>,
    item: T,
  ) => BodyCellRenderProps;
  /** Wrap the table output in context providers */
  transformTableContext?: (children: ReactNode) => ReactNode;
}

// =============================================================================
// Component Interfaces (for components prop)
// =============================================================================

/** Props for row components used in the components prop */
export interface TableRowComponentProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  xstyle?: StyleXStyles[];
}

/** Props for cell components used in the components prop */
export interface TableCellComponentProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  xstyle?: StyleXStyles | StyleXStyles[];
}

/** Props for header cell components used in the components prop */
export interface TableHeaderCellComponentProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  xstyle?: StyleXStyles | StyleXStyles[];
}

// =============================================================================
// XDSBaseTable Props
// =============================================================================

/**
 * Props for the unstyled XDSBaseTable component.
 *
 * @template T - The row data type
 */
export interface XDSBaseTableProps<T extends Record<string, unknown>> {
  /** Array of data items to render as rows */
  data?: T[];
  /** Column definitions. If omitted, auto-generated from data keys. */
  columns?: XDSTableColumn<T>[];
  /**
   * Row key for React reconciliation.
   * - `string` — property name to use as key (e.g. `"id"`), must be a key of `T`
   * - `function` — custom extractor (e.g. `(item) => item.id`)
   * - omitted — falls back to row index
   */
  idKey?: (keyof T & string) | ((item: T) => string | number);
  /** Plugins to transform render props at each level */
  plugins?: TablePlugin<T>[];
  /**
   * Component overrides for table elements.
   * When provided, these components are rendered instead of raw HTML elements.
   * Components receive `xstyle` from plugin transforms.
   */
  components?: {
    Row?: ComponentType<TableRowComponentProps>;
    Cell?: ComponentType<TableCellComponentProps>;
    HeaderCell?: ComponentType<TableHeaderCellComponentProps>;
  };
  /** Children mode — render `<tr>`/`<td>` directly instead of data-driven */
  children?: ReactNode;
  /** Additional HTML attributes for the `<table>` element */
  tableProps?: HTMLAttributes<HTMLTableElement>;
}
