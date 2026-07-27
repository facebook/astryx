// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input None (pure type definitions)
 * @output Exports base Table interfaces: column, render props, plugin, BaseTableProps
 * @position Type foundation; consumed by BaseTable and extended by Table
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (type descriptions)
 * - /packages/core/src/Table/index.ts (exports if types change)
 */

import type React from 'react';
import type {
  ComponentType,
  HTMLAttributes,
  Ref,
  TdHTMLAttributes,
  ThHTMLAttributes,
  ReactNode,
} from 'react';
import type {StyleXStyles} from '../theme/types';
import type {BaseProps} from '../BaseProps';
import type {TableFilterFieldRef} from './plugins/filtering/useTableFiltering';

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
 * Added to TableColumn<T> via the `sortable` field.
 */
export interface TableSortableColumnConfig {
  /**
   * The sort key for this column. Must match a key used in TableSortState.
   * Allows decoupling column identity from sort identity (e.g., a "Full Name"
   * column might sort by `'lastName'`).
   *
   * @default column.key — if omitted, uses the column's `key` property
   */
  sortKey?: string;
}

// =============================================================================
// Column Alignment
// =============================================================================

/**
 * Horizontal text alignment for a table column.
 * Applied to both the `<th>` and `<td>` elements.
 *
 * @default 'start'
 */
export type TableColumnAlign = 'start' | 'center' | 'end';

// =============================================================================
// Row Vertical Alignment
// =============================================================================

/**
 * Vertical alignment for table body row cells.
 * Controls `vertical-align` on `<td>` elements.
 *
 * @default 'middle'
 */
export type TableVerticalAlign = 'middle' | 'top' | 'bottom';

// =============================================================================
// Column Definition
// =============================================================================

/**
 * Column definition for data-driven table rendering.
 *
 * @template T - The row data type
 */
export interface TableColumn<T extends Record<string, unknown>> {
  /** Unique key identifying this column. Used as React key and to access data. */
  key: string;
  /** Header text displayed in `<th>`. Defaults to capitalized `key`. */
  header?: ReactNode;
  /**
   * Column width. Use `proportional()` for flexible columns or `pixel()` for fixed.
   *
   * - `proportional(1)` — shares space equally with other proportional columns.
   *   Enforces a 120px minimum width to prevent squishing on narrow viewports.
   * - `proportional(2)` — gets twice the space of `proportional(1)`.
   * - `pixel(200)` — fixed 200px width.
   * - Omitted — treated as `proportional(1)` for distribution, but with **no**
   *   minimum width. Prefer explicit `proportional(1)` for text-heavy columns
   *   so they don't collapse on mobile.
   *
   * @example
   * ```
   * { key: 'name', header: 'Name', width: proportional(1) }
   * { key: 'bio', header: 'Bio', width: proportional(2) }
   * { key: 'age', header: 'Age', width: pixel(80) }
   * ```
   */
  width?: ColumnWidth;
  /**
   * Horizontal text alignment for this column.
   * Applied to both the header `<th>` and body `<td>` cells.
   *
   * @default 'start'
   *
   * @example
   * ```
   * // Right-align a numeric column
   * { key: 'amount', header: 'Amount', align: 'end' }
   *
   * // Center-align a status column
   * { key: 'status', header: 'Status', align: 'center' }
   * ```
   */
  align?: TableColumnAlign;
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
  sortable?: boolean | TableSortableColumnConfig;
  /**
   * Filter configuration for this column.
   *
   * References a field in the shared `PowerSearchConfig` passed to
   * `useTableFiltering`. The plugin resolves the operator's value
   * type and renders the matching control.
   *
   * Accepts:
   * - **Field key** — `'status'` — uses the field's `defaultOperator`
   * - **Field ref** — `{ field: 'status', operator: 'is_not' }` — explicit operator
   *
   * @example
   * ```
   * // Field key (uses defaultOperator)
   * { key: 'status', header: 'Status', filter: 'status' }
   *
   * // Field + explicit operator
   * { key: 'status', header: 'Status', filter: { field: 'status', operator: 'is_not' } }
   * ```
   */
  filter?: TableFilterFieldRef | string;
  /**
   * Custom cell renderer. Receives the row item and returns rich JSX content.
   * Defaults to `String(item[key])` — use renderCell for rich content like
   * badges, status dots, formatted text, icons, or composed layouts.
   *
   * @compositionHint Use renderCell to compose rich table cells:
   * - Badge for status labels (success/warning/error variants)
   * - StatusDot for colored indicators
   * - Text with color="success"|"error" for formatted values
   * - HStack to combine multiple elements in a cell
   * - Avatar for user/entity cells
   *
   * @example
   * ```tsx
   * renderCell: (item) => (
   *   <HStack gap={2} align="center">
   *     <StatusDot status={item.isActive ? 'success' : 'error'} />
   *     <Badge variant={item.isActive ? 'success' : 'error'} label={item.isActive ? 'Active' : 'Inactive'} />
   *   </HStack>
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
  xstyle: StyleXStyles[];
}

/** Props passed through the plugin pipeline for the header `<tr>` */
export interface HeaderRowRenderProps {
  htmlProps: HTMLAttributes<HTMLTableRowElement>;
  xstyle: StyleXStyles[];
  children: ReactNode;
}

/**
 * Props passed through the plugin pipeline for each `<th>`.
 *
 * Uses named slots so multiple plugins can contribute content without
 * conflicts. Each plugin writes to its own slot; BaseTable renders
 * them in order: `before | content | after`, with `overlay` positioned
 * absolutely on top and `below` underneath the header row.
 *
 * Slot semantics:
 * - **before** — content before the label (e.g. selection checkbox)
 * - **content** — the header label; plugins may wrap (e.g. sort button)
 * - **after** — content after the label (e.g. sort icon, filter icon)
 * - **overlay** — absolutely positioned layer (e.g. resize handle)
 * - **below** — content below the header label row (e.g. inline filter controls)
 */
export interface HeaderCellRenderProps {
  htmlProps: ThHTMLAttributes<HTMLTableCellElement>;
  xstyle: StyleXStyles[];
  /** Content rendered before the header label. */
  before?: ReactNode;
  /** The header label content. Initialized from `column.header ?? column.key`. Plugins may wrap or replace. */
  content?: ReactNode;
  /** Content rendered after the header label (e.g. sort icon, filter trigger). */
  after?: ReactNode;
  /** Absolutely positioned overlay content (e.g. resize handle). */
  overlay?: ReactNode;
  /** Content rendered below the header label row (e.g. inline filter controls). */
  below?: ReactNode;
  /**
   * Right-click context-menu actions for this header cell. Plugins append
   * their actions in `transformHeaderCell`; BaseTable concatenates the arrays
   * across plugins (never overridden) and renders one menu per header cell.
   */
  contextMenuActions?: TableContextActions;
  /**
   * Index of this column within the final, ordered list of rendered columns
   * (after column injection/reordering by other plugins). Populated by
   * BaseTable. Optional for backward compatibility with hand-constructed
   * renders in tests.
   */
  columnIndex?: number;
  /**
   * The full, final ordered list of columns being rendered (after column
   * injection/reordering by other plugins). Populated by BaseTable so plugins
   * can reason about column position — e.g. cumulative sticky offsets. Optional
   * for backward compatibility.
   */
  columns?: ReadonlyArray<TableColumn<Record<string, unknown>>>;
}

/** Props passed through the plugin pipeline for each body `<tr>` */
export interface BodyRowRenderProps {
  htmlProps: HTMLAttributes<HTMLTableRowElement>;
  xstyle: StyleXStyles[];
  children: ReactNode;
  /** Ref for the `<tr>` element. Plugins can set this to access the row DOM node. */
  ref?: Ref<HTMLTableRowElement>;
}

/** Props passed through the plugin pipeline for each body `<td>` */
export interface BodyCellRenderProps {
  htmlProps: TdHTMLAttributes<HTMLTableCellElement>;
  xstyle: StyleXStyles[];
  /**
   * Right-click context-menu actions for this body cell. Plugins append their
   * actions in `transformBodyCell`; BaseTable concatenates the arrays across
   * plugins and across the row's cells (never overridden) and renders one menu
   * per row.
   */
  contextMenuActions?: TableContextActions;
  /**
   * Index of this cell's column within the final ordered column list.
   * Mirrors the `columnIndex` passed to `transformHeaderCell`. Populated by
   * BaseTable. Optional for backward compatibility with hand-constructed
   * renders in tests.
   */
  columnIndex?: number;
  /**
   * The full, final ordered list of columns being rendered. Populated by
   * BaseTable so plugins can reason about column position — e.g. cumulative
   * sticky offsets. Optional for backward compatibility.
   */
  columns?: ReadonlyArray<TableColumn<Record<string, unknown>>>;
}

/**
 * Props passed through the plugin pipeline for the scroll-wrapper region — the
 * `<div>` wrapping the `<table>` element (the horizontal scroll container, see
 * the `scrollWrapper` prop on `BaseTableProps`). Lets plugins attach a `ref` to
 * the scrollable element (e.g. for scroll-aware sticky-column shadows or
 * virtualization) and inject chrome before/after the table.
 *
 * Named after `scrollWrapper` (not "layout") to avoid ambiguity: it transforms
 * the wrapper element, not the internal header/body/footer layout of `<table>`.
 *
 * Runs after `transformTable`/cell transforms but inside `transformTableContext`,
 * so plugin chrome added here stays within any context providers but wraps the
 * scroll area.
 */
export interface ScrollWrapperRenderProps {
  /**
   * HTML attributes applied to the scroll container `<div>`, including an
   * optional `ref`. Plugins compose refs by reading the existing `ref` and
   * merging their own (see `useTableStickyColumns`).
   */
  htmlProps: HTMLAttributes<HTMLDivElement> & {
    ref?: Ref<HTMLDivElement>;
  };
  xstyle: StyleXStyles[];
  /** Content rendered before the `<table>`, inside the scroll container. */
  beforeTable?: ReactNode;
  /** Content rendered after the `<table>`, inside the scroll container. */
  afterTable?: ReactNode;
}

// =============================================================================
// Context-menu actions
// =============================================================================

/**
 * A single right-click context-menu action contributed by a plugin.
 *
 * Plugins contribute actions via the `contextMenuActions` field on
 * `HeaderCellRenderProps` / `BodyCellRenderProps` (set in
 * `transformHeaderCell` / `transformBodyCell`); the table aggregates actions
 * from every enabled plugin into a single menu per header cell / row.
 */
export interface TableContextAction {
  /** Stable identifier, unique within a single menu. */
  id: string;
  /** Visible label for the menu item. */
  label: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Invoked when the item is selected. */
  onSelect: () => void;
  /** When true, the item is rendered but not selectable. */
  disabled?: boolean;
  /**
   * Group key used to cluster related actions and insert a divider between
   * groups (e.g. 'sort', 'selection'). Actions without a group form a trailing
   * group. Group order follows first-seen order across the aggregated list.
   */
  group?: string;
  /** When true, the item renders as checked (e.g. the active sort direction). */
  checked?: boolean;
}

/**
 * Context-menu actions for a cell — either a static array, or a getter that
 * returns the actions lazily. Prefer the getter for actions derived from state
 * (e.g. the active sort direction): it's only invoked when the menu is opened,
 * so the plugin doesn't build an action array (with closures) for every cell on
 * every render.
 */
export type TableContextActions =
  TableContextAction[] | (() => TableContextAction[]);

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
 * 7. `transformScrollWrapper` — transform the scroll-container wrapper around the table
 * 8. `transformTableContext` — wrap the table output in context providers
 *
 * Plugins may also contribute right-click menu actions by appending to
 * `contextMenuActions` in `transformHeaderCell` / `transformBodyCell`
 * (aggregated into one menu per header cell / row).
 */
export interface TablePlugin<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Transform the column definitions before rendering.
   * Runs before any element-level transforms. Use to filter, reorder,
   * or inject synthetic columns (e.g. a selection checkbox column).
   */
  transformColumns?: (columns: TableColumn<T>[]) => TableColumn<T>[];
  /** Transform the root `<table>` element props */
  transformTable?: (props: TableRenderProps) => TableRenderProps;
  /** Transform the header `<tr>` props */
  transformHeaderRow?: (props: HeaderRowRenderProps) => HeaderRowRenderProps;
  /**
   * Transform each `<th>` props.
   *
   * `columnIndex` and the full `columns` list are provided for plugins that
   * need to reason about column position (e.g. cumulative sticky offsets).
   */
  transformHeaderCell?: (
    props: HeaderCellRenderProps,
    column: TableColumn<T>,
    columnIndex: number,
    columns: ReadonlyArray<TableColumn<T>>,
  ) => HeaderCellRenderProps;
  /** Transform each body `<tr>` props */
  transformBodyRow?: (
    props: BodyRowRenderProps,
    item: T,
    index: number,
  ) => BodyRowRenderProps;
  /**
   * Transform each body `<td>` props.
   *
   * `columnIndex` and the full `columns` list are provided for plugins that
   * need to reason about column position (e.g. cumulative sticky offsets).
   */
  transformBodyCell?: (
    props: BodyCellRenderProps,
    column: TableColumn<T>,
    item: T,
    columnIndex: number,
    columns: ReadonlyArray<TableColumn<T>>,
  ) => BodyCellRenderProps;
  /**
   * Transform the scroll-wrapper region — the `<div>` wrapping the `<table>`
   * (see the `scrollWrapper` prop). Use to attach a `ref` to the scrollable
   * element (scroll-aware shadows, virtualization) or to inject chrome
   * before/after the table.
   */
  transformScrollWrapper?: (
    props: ScrollWrapperRenderProps,
  ) => ScrollWrapperRenderProps;
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
  /**
   * Whether this row is the header row. Header rows skip the striped/hover
   * row styling, which is only meant for body rows.
   */
  isHeaderRow?: boolean;
}

/** Props for cell components used in the components prop */
export interface TableCellComponentProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  xstyle?: StyleXStyles | StyleXStyles[];
  /**
   * Right-click actions to render as a context menu around the cell content.
   * The cell owns the menu wrapper so it can control how it interacts with
   * padding / content sizing. Empty/undefined renders no menu (native passes
   * through).
   */
  contextMenuActions?: TableContextActions;
}

/** Props for header cell components used in the components prop */
export interface TableHeaderCellComponentProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  xstyle?: StyleXStyles | StyleXStyles[];
  /**
   * Right-click actions to render as a context menu around the header content.
   * The cell owns the menu wrapper so it can control how it interacts with
   * padding / content sizing. Empty/undefined renders no menu.
   */
  contextMenuActions?: TableContextActions;
}

// =============================================================================
// BaseTable Props
// =============================================================================

/**
 * Props for the unstyled BaseTable component.
 *
 * @template T - The row data type
 */
export interface BaseTableProps<
  T extends Record<string, unknown>,
> extends BaseProps<HTMLTableElement> {
  ref?: React.Ref<HTMLTableElement>;
  /** Array of data items to render as rows */
  data?: T[];
  /** Column definitions. If omitted, auto-generated from data keys. */
  columns?: TableColumn<T>[];
  /**
   * Row key for React reconciliation.
   * - `string` — property name to use as key (e.g. `"id"`), must be a key of `T`
   * - `function` — custom extractor (e.g. `(item) => item.id`)
   * - omitted — falls back to row index
   */
  idKey?: (keyof T & string) | ((item: T) => string | number);
  /** Plugins to transform render props at each level */
  plugins?: TablePlugin<T>[];

  /** Children mode — render `<tr>`/`<td>` directly instead of data-driven */
  children?: ReactNode;
  /**
   * Additional HTML attributes for the `<table>` element.
   *
   * @deprecated Pass `className`, `style`, `xstyle`, and other HTML
   * attributes directly on the component instead — they now reach the root
   * `<table>` and win over `tableProps` on conflicts. Migrate with
   * `npx astryx upgrade --codemod migrate-table-tableprops-to-direct-props`.
   */
  tableProps?: HTMLAttributes<HTMLTableElement>;
  /**
   * Optional wrapper rendered around the `<table>` element, inside the
   * plugin `transformTableContext` layer. Used by `Table` to add a
   * horizontal scroll container so plugin chrome (pagination, toolbars)
   * stays outside the scrollable area.
   *
   * Receives `htmlProps` (including an optional `ref`) and `xstyle` produced
   * by the plugin `transformScrollWrapper` pipeline, plus `beforeTable`/`afterTable`
   * chrome. The wrapper must spread `htmlProps` (and apply `xstyle`) onto its
   * scroll-container element so plugins can attach refs / scroll listeners.
   */
  scrollWrapper?: ComponentType<{
    children: ReactNode;
    htmlProps?: HTMLAttributes<HTMLDivElement> & {ref?: Ref<HTMLDivElement>};
    xstyle?: StyleXStyles[];
    beforeTable?: ReactNode;
    afterTable?: ReactNode;
  }>;
  /**
   * How default-rendered body cell text behaves when it exceeds column width.
   *
   * - `'wrap'` (default) — text wraps and the row grows taller
   * - `'truncate'` — text is clipped with an ellipsis; default-rendered cells
   *   show a tooltip on hover when truncated
   *
   * Only affects cells using the default renderer (no `renderCell`).
   * Cells with `renderCell` control their own overflow behavior.
   *
   * @default 'wrap'
   */
  textOverflow?: 'wrap' | 'truncate';
  /**
   * Content displayed when `data` is an empty array.
   * Rendered as a full-width row spanning all columns.
   *
   * - **Omit or `undefined`** — renders a default compact "No data" empty state
   * - **`ReactNode`** — renders your custom content (e.g. `<EmptyState>`)
   * - **`false`** — disables the empty state entirely (renders empty `<tbody>`)
   *
   * @default <EmptyState title="No data" isCompact />
   *
   * @example
   * ```
   * <Table
   *   data={filteredUsers}
   *   columns={columns}
   *   emptyState={<EmptyState title="No results" description="Try adjusting your filters." />}
   * />
   * ```
   */
  emptyState?: ReactNode | false;
}
