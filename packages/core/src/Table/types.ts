/**
 * @file types.ts
 * @input None (pure type definitions)
 * @output Exports base Table interfaces: column, render props, plugin, XDSBaseTableProps
 * @position Type foundation; consumed by XDSBaseTable and extended by XDSTable
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (type descriptions)
 * - /packages/core/src/Table/index.ts (exports if types change)
 */

import type {
  ComponentType,
  HTMLAttributes,
  Ref,
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
  /** Minimum width in pixels. Prevents the column from shrinking below this size. */
  minWidth?: number;
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
// Sortable Column Config
// =============================================================================

/**
 * Sortable column configuration.
 * Added to XDSTableColumn<T> via the `sortable` field.
 */
export interface XDSTableSortableColumnConfig {
  /**
   * The sort key for this column. Must match a key used in XDSTableSortState.
   * Allows decoupling column identity from sort identity (e.g., a "Full Name"
   * column might sort by `'lastName'`).
   *
   * @default column.key — if omitted, uses the column's `key` property
   */
  sortKey?: string;
}

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
   * Sortable configuration for this column.
   * Set to `true` for default behavior (sortKey = column.key),
   * or provide an object with a custom sortKey.
   * Omit or set to `undefined`/`false` to make the column non-sortable.
   *
   * @example
   * ```
   * // Simple: sort key matches column key
   * { key: 'name', header: 'Name', sortable: true }
   *
   * // Custom sort key
   * { key: 'fullName', header: 'Full Name', sortable: { sortKey: 'lastName' } }
   * ```
   */
  /**
   * Whether this column can be resized by dragging its header border.
   * Defaults to `true`. Set to `false` to lock the column width.
   *
   * @example
   * ```
   * // Non-resizable fixed column
   * { key: 'actions', header: '', width: pixel(48), resizable: false }
   * ```
   */
  resizable?: boolean;
  sortable?: boolean | XDSTableSortableColumnConfig;
  /**
   * Custom cell renderer. Receives the row item and returns rich JSX content.
   * Defaults to `String(item[key])` — use renderCell for rich content like
   * badges, status dots, formatted text, icons, or composed layouts.
   *
   * @compositionHint Use renderCell to compose rich table cells:
   * - XDSBadge for status labels (success/warning/error variants)
   * - XDSStatusDot for colored indicators
   * - XDSText with color="positive"|"negative" for formatted values
   * - XDSHStack to combine multiple elements in a cell
   * - XDSAvatar for user/entity cells
   *
   * @example
   * ```tsx
   * renderCell: (item) => (
   *   <XDSHStack gap={2} align="center">
   *     <XDSStatusDot status={item.isActive ? 'positive' : 'negative'} />
   *     <XDSBadge variant={item.isActive ? 'success' : 'error'} label={item.isActive ? 'Active' : 'Inactive'} />
   *   </XDSHStack>
   * )
   * ```
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

/**
 * Props passed through the plugin pipeline for each `<th>`.
 *
 * Uses named slots so multiple plugins can contribute content without
 * conflicts. Each plugin writes to its own slot; XDSBaseTable renders
 * them in order: `before | content | after`, with `overlay` positioned
 * absolutely on top.
 *
 * Slot semantics:
 * - **before** — content before the label (e.g. selection checkbox)
 * - **content** — the header label; plugins may wrap (e.g. sort button)
 * - **after** — content after the label (e.g. sort icon, filter icon)
 * - **overlay** — absolutely positioned layer (e.g. resize handle)
 */
export interface HeaderCellRenderProps {
  htmlProps: ThHTMLAttributes<HTMLTableCellElement>;
  styles: StyleXStyles[];
  /** Content rendered before the header label. */
  before?: ReactNode;
  /** The header label content. Initialized from `column.header ?? column.key`. Plugins may wrap or replace. */
  content?: ReactNode;
  /** Content rendered after the header label (e.g. sort icon, filter trigger). */
  after?: ReactNode;
  /** Absolutely positioned overlay content (e.g. resize handle). */
  overlay?: ReactNode;
}

/** Props passed through the plugin pipeline for each body `<tr>` */
export interface BodyRowRenderProps {
  htmlProps: HTMLAttributes<HTMLTableRowElement>;
  styles: StyleXStyles[];
  children: ReactNode;
  /** Ref for the `<tr>` element. Plugins can set this to access the row DOM node. */
  ref?: Ref<HTMLTableRowElement>;
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
 *
 * ## Pipeline order
 *
 * 1. `transformColumns` — filter, reorder, or inject columns before rendering
 * 2. `transformTable` — transform the root `<table>` element props
 * 3. `transformHeaderRow` — transform the header `<tr>` props
 * 4. `transformHeaderCell` — transform each `<th>` props
 * 5. `transformBodyRow` — transform each body `<tr>` props
 * 6. `transformBodyCell` — transform each body `<td>` props
 * 7. `transformTableContext` — wrap the table output in context providers
 */
export interface TablePlugin<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Transform the column definitions before rendering.
   * Runs before any element-level transforms. Use to filter, reorder,
   * or inject synthetic columns (e.g. a selection checkbox column).
   */
  transformColumns?: (columns: XDSTableColumn<T>[]) => XDSTableColumn<T>[];
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
  /** Ref forwarded to the root `<tr>` element */
  ref?: Ref<HTMLTableRowElement>;
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
