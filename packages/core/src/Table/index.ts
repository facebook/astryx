// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Table component files
 * @output Exports all Table components, types, and utilities
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Table/Table.doc.mjs
 */

export {XDSTable} from './XDSTable';
export {XDSTableRow} from './XDSTableRow';
export {XDSTableCell} from './XDSTableCell';
export {XDSTableHeaderCell} from './XDSTableHeaderCell';
export {XDSTableHeader} from './XDSTableHeader';
export {XDSTableBody} from './XDSTableBody';
export {XDSTableFooter} from './XDSTableFooter';
export {XDSTableContext} from './XDSTableContext';
export {useXDSTableSelection} from './plugins/selection';
export {useXDSTableSelectionState} from './plugins/selection';
export {useXDSTableSortable} from './plugins/sortable';
export {useXDSTableSortableState} from './plugins/sortable';
export {useXDSTablePagination, paginateData} from './plugins/pagination';
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
  XDSTableColumnAlign,
  XDSTableVerticalAlign,
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
} from './types';
export type {
  XDSTableProps,
  XDSTableDensity,
  XDSTableDividers,
  XDSTableTextOverflow,
} from './XDSTable';
export type {XDSTableRowProps} from './XDSTableRow';
export type {XDSTableCellProps} from './XDSTableCell';
export type {XDSTableHeaderCellProps} from './XDSTableHeaderCell';
export type {XDSTableHeaderProps} from './XDSTableHeader';
export type {XDSTableBodyProps} from './XDSTableBody';
export type {XDSTableFooterProps} from './XDSTableFooter';
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
export type {UseXDSTablePaginationConfig} from './plugins/pagination';
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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSTable as Table,
  XDSTableBody as TableBody,
  XDSTableCell as TableCell,
  XDSTableContext as TableContext,
  XDSTableFooter as TableFooter,
  XDSTableHeader as TableHeader,
  XDSTableHeaderCell as TableHeaderCell,
  XDSTableRow as TableRow,
  useXDSBaseTablePlugins as useBaseTablePlugins,
  useXDSTableColumnResize as useTableColumnResize,
  useXDSTableColumnSettings as useTableColumnSettings,
  useXDSTableColumnSettingsState as useTableColumnSettingsState,
  useXDSTableFilterState as useTableFilterState,
  useXDSTableFiltering as useTableFiltering,
  useXDSTablePagination as useTablePagination,
  useXDSTableSelection as useTableSelection,
  useXDSTableSelectionState as useTableSelectionState,
  useXDSTableSortable as useTableSortable,
  useXDSTableSortableState as useTableSortableState,
} from '.';
export type {
  XDSBaseTableProps as BaseTableProps,
  XDSColumnSettingsOption as ColumnSettingsOption,
  XDSTableBodyProps as TableBodyProps,
  XDSTableCellProps as TableCellProps,
  XDSTableColumn as TableColumn,
  XDSTableColumnAlign as TableColumnAlign,
  XDSTableContextValue as TableContextValue,
  XDSTableDensity as TableDensity,
  XDSTableDividers as TableDividers,
  XDSTableFilterFieldRef as TableFilterFieldRef,
  XDSTableFilterState as TableFilterState,
  XDSTableFilterValue as TableFilterValue,
  XDSTableFilterVariant as TableFilterVariant,
  XDSTableFooterProps as TableFooterProps,
  XDSTableHeaderCellProps as TableHeaderCellProps,
  XDSTableHeaderProps as TableHeaderProps,
  XDSTableProps as TableProps,
  XDSTableRowProps as TableRowProps,
  XDSTableSortComparator as TableSortComparator,
  XDSTableSortDirection as TableSortDirection,
  XDSTableSortEntry as TableSortEntry,
  XDSTableSortState as TableSortState,
  XDSTableSortableColumnConfig as TableSortableColumnConfig,
  XDSTableTextOverflow as TableTextOverflow,
  XDSTableVerticalAlign as TableVerticalAlign,
} from '.';
// <compat-aliases:end>
