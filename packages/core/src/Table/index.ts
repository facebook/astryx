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

export {Table} from './Table';
export {TableRow} from './TableRow';
export {TableCell} from './TableCell';
export {TableHeaderCell} from './TableHeaderCell';
export {TableHeader} from './TableHeader';
export {TableBody} from './TableBody';
export {TableFooter} from './TableFooter';
export {TableContext} from './TableContext';
export {useTableSelection} from './plugins/selection';
export {useTableSelectionState} from './plugins/selection';
export {useTableSortable} from './plugins/sortable';
export {useTableSortableState} from './plugins/sortable';
export {useTablePagination, paginateData} from './plugins/pagination';
export {useTableColumnSettings} from './plugins/columnSettings';
export {useTableColumnSettingsState} from './plugins/columnSettings';
export {useTableColumnResize} from './plugins/columnResize';
export {
  useTableFiltering,
  useTableFilterState,
  toSearchFilters,
} from './plugins/filtering';
export {useBaseTablePlugins} from './useBaseTablePlugins';
export {
  proportional,
  pixel,
  generateColumns,
  resolveColumnWidths,
  DEFAULT_MIN_COLUMN_WIDTH,
} from './columnUtils';
export type {
  TableColumn,
  TableColumnAlign,
  TableVerticalAlign,
  ColumnWidth,
  ProportionalWidth,
  PixelWidth,
  TablePlugin,
  TableRenderProps,
  HeaderRowRenderProps,
  HeaderCellRenderProps,
  BodyRowRenderProps,
  BodyCellRenderProps,
  BaseTableProps,
} from './types';
export type {
  TableProps,
  TableDensity,
  TableDividers,
  TableTextOverflow,
} from './Table';
export type {TableRowProps} from './TableRow';
export type {TableCellProps} from './TableCell';
export type {TableHeaderCellProps} from './TableHeaderCell';
export type {TableHeaderProps} from './TableHeader';
export type {TableBodyProps} from './TableBody';
export type {TableFooterProps} from './TableFooter';
export type {TableContextValue} from './TableContext';
export type {UseXDSTableSelectionConfig} from './plugins/selection';
export type {
  UseXDSTableSelectionStateConfig,
  UseXDSTableSelectionStateResult,
} from './plugins/selection';
export type {
  UseXDSTableSortableConfig,
  UseXDSTableSortableStateConfig,
  UseXDSTableSortableStateResult,
  TableSortComparator,
  TableSortDirection,
  TableSortEntry,
  TableSortState,
} from './plugins/sortable';
export type {TableSortableColumnConfig} from './types';
export type {UseXDSTablePaginationConfig} from './plugins/pagination';
export type {
  UseXDSTableColumnSettingsConfig,
  ColumnSettingsOption,
} from './plugins/columnSettings';
export type {
  UseXDSTableColumnSettingsStateConfig,
  UseXDSTableColumnSettingsStateReturn,
} from './plugins/columnSettings';
export type {UseXDSTableColumnResizeConfig} from './plugins/columnResize';
export type {
  UseXDSTableFilteringConfig,
  TableFilterState,
  TableFilterVariant,
  TableFilterValue,
  TableFilterFieldRef,
} from './plugins/filtering';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  DEFAULT_MIN_COLUMN_WIDTH as XDSDEFAULT_MIN_COLUMN_WIDTH,
  Table as XDSTable,
  TableBody as XDSTableBody,
  TableCell as XDSTableCell,
  TableContext as XDSTableContext,
  TableFooter as XDSTableFooter,
  TableHeader as XDSTableHeader,
  TableHeaderCell as XDSTableHeaderCell,
  TableRow as XDSTableRow,
  useBaseTablePlugins as useXDSBaseTablePlugins,
  useTableColumnResize as useXDSTableColumnResize,
  useTableColumnSettings as useXDSTableColumnSettings,
  useTableColumnSettingsState as useXDSTableColumnSettingsState,
  useTableFilterState as useXDSTableFilterState,
  useTableFiltering as useXDSTableFiltering,
  useTablePagination as useXDSTablePagination,
  useTableSelection as useXDSTableSelection,
  useTableSelectionState as useXDSTableSelectionState,
  useTableSortable as useXDSTableSortable,
  useTableSortableState as useXDSTableSortableState,
} from '.';
export type {
  BaseTableProps as XDSBaseTableProps,
  BodyCellRenderProps as XDSBodyCellRenderProps,
  BodyRowRenderProps as XDSBodyRowRenderProps,
  ColumnSettingsOption as XDSColumnSettingsOption,
  ColumnWidth as XDSColumnWidth,
  HeaderCellRenderProps as XDSHeaderCellRenderProps,
  HeaderRowRenderProps as XDSHeaderRowRenderProps,
  PixelWidth as XDSPixelWidth,
  ProportionalWidth as XDSProportionalWidth,
  TableBodyProps as XDSTableBodyProps,
  TableCellProps as XDSTableCellProps,
  TableColumn as XDSTableColumn,
  TableColumnAlign as XDSTableColumnAlign,
  TableContextValue as XDSTableContextValue,
  TableDensity as XDSTableDensity,
  TableDividers as XDSTableDividers,
  TableFilterFieldRef as XDSTableFilterFieldRef,
  TableFilterState as XDSTableFilterState,
  TableFilterValue as XDSTableFilterValue,
  TableFilterVariant as XDSTableFilterVariant,
  TableFooterProps as XDSTableFooterProps,
  TableHeaderCellProps as XDSTableHeaderCellProps,
  TableHeaderProps as XDSTableHeaderProps,
  TablePlugin as XDSTablePlugin,
  TableProps as XDSTableProps,
  TableRenderProps as XDSTableRenderProps,
  TableRowProps as XDSTableRowProps,
  TableSortComparator as XDSTableSortComparator,
  TableSortDirection as XDSTableSortDirection,
  TableSortEntry as XDSTableSortEntry,
  TableSortState as XDSTableSortState,
  TableSortableColumnConfig as XDSTableSortableColumnConfig,
  TableTextOverflow as XDSTableTextOverflow,
  TableVerticalAlign as XDSTableVerticalAlign,
  UseXDSTableColumnResizeConfig as XDSUseXDSTableColumnResizeConfig,
  UseXDSTableColumnSettingsConfig as XDSUseXDSTableColumnSettingsConfig,
  UseXDSTableColumnSettingsStateConfig as XDSUseXDSTableColumnSettingsStateConfig,
  UseXDSTableColumnSettingsStateReturn as XDSUseXDSTableColumnSettingsStateReturn,
  UseXDSTableFilteringConfig as XDSUseXDSTableFilteringConfig,
  UseXDSTablePaginationConfig as XDSUseXDSTablePaginationConfig,
  UseXDSTableSelectionConfig as XDSUseXDSTableSelectionConfig,
  UseXDSTableSelectionStateConfig as XDSUseXDSTableSelectionStateConfig,
  UseXDSTableSelectionStateResult as XDSUseXDSTableSelectionStateResult,
  UseXDSTableSortableConfig as XDSUseXDSTableSortableConfig,
  UseXDSTableSortableStateConfig as XDSUseXDSTableSortableStateConfig,
  UseXDSTableSortableStateResult as XDSUseXDSTableSortableStateResult,
} from '.';
// <compat-aliases:end>
