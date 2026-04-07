'use client';

/**
 * @file index.ts
 * @input Imports from Table component files
 * @output Exports all Table components, types, and utilities
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Table/Table.doc.mjs
 */

export {XDSBaseTable} from './XDSBaseTable';
export {XDSTable} from './XDSTable';
export {XDSTableRow} from './XDSTableRow';
export {XDSTableCell} from './XDSTableCell';
export {XDSTableHeaderCell} from './XDSTableHeaderCell';
export {XDSTableContext} from './XDSTableContext';
export {useXDSTableSelection} from './plugins/selection';
export {useXDSTableSelectionState} from './plugins/selection';
export {useXDSTableSortable} from './plugins/sortable';
export {useXDSTableSortableState} from './plugins/sortable';
export {useXDSTablePagination} from './plugins/pagination';
export {useXDSTableColumnSettings} from './plugins/columnSettings';
export {useXDSTableColumnSettingsState} from './plugins/columnSettings';
export {useXDSTableColumnResize} from './plugins/columnResize';
export {
  useXDSTableFiltering,
  useXDSTableFilterState,
  toSearchFilters,
} from './plugins/filtering';
export {useXDSBaseTablePlugins} from './useXDSBaseTablePlugins';
export {
  proportional,
  pixel,
  generateColumns,
  resolveColumnWidths,
  DEFAULT_MIN_COLUMN_WIDTH,
} from './columnUtils';
export type {
  XDSTableColumn,
  ColumnWidth,
  ProportionalWidth,
  PixelWidth,
  TablePlugin,
  TableRenderProps,
  HeaderRowRenderProps,
  HeaderCellRenderProps,
  BodyRowRenderProps,
  BodyCellRenderProps,
  XDSBaseTableProps,
  TableRowComponentProps,
  TableCellComponentProps,
  TableHeaderCellComponentProps,
} from './types';
export type {
  XDSTableProps,
  XDSTableDensity,
  XDSTableDividers,
} from './XDSTable';
export type {XDSTableRowProps} from './XDSTableRow';
export type {XDSTableCellProps} from './XDSTableCell';
export type {XDSTableHeaderCellProps} from './XDSTableHeaderCell';
export type {XDSTableContextValue} from './XDSTableContext';
export type {UseXDSTableSelectionConfig} from './plugins/selection';
export type {
  UseXDSTableSelectionStateConfig,
  UseXDSTableSelectionStateResult,
} from './plugins/selection';
export type {
  UseXDSTableSortableConfig,
  UseXDSTableSortableStateConfig,
  UseXDSTableSortableStateResult,
  XDSTableSortComparator,
  XDSTableSortDirection,
  XDSTableSortEntry,
  XDSTableSortState,
} from './plugins/sortable';
export type {XDSTableSortableColumnConfig} from './types';
export type {
  UseXDSTablePaginationConfig,
  UseXDSTablePaginationReturn,
} from './plugins/pagination';
export type {
  UseXDSTableColumnSettingsConfig,
  XDSColumnSettingsOption,
} from './plugins/columnSettings';
export type {
  UseXDSTableColumnSettingsStateConfig,
  UseXDSTableColumnSettingsStateReturn,
} from './plugins/columnSettings';
export type {UseXDSTableColumnResizeConfig} from './plugins/columnResize';
export type {
  UseXDSTableFilteringConfig,
  XDSTableFilterState,
  XDSTableFilterVariant,
  XDSTableFilterValue,
  XDSTableFilterFieldRef,
} from './plugins/filtering';
