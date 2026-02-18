/**
 * @file index.ts
 * @input Imports from Table component files
 * @output Exports all Table components, types, and utilities
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Table/README.md
 */

export {XDSBaseTable} from './XDSBaseTable';
export {XDSTable} from './XDSTable';
export {XDSTableRow} from './XDSTableRow';
export {XDSTableCell} from './XDSTableCell';
export {XDSTableHeaderCell} from './XDSTableHeaderCell';
export {XDSTableContext} from './XDSTableContext';
export {useXDSTableSelection} from './plugins/selection';
export {useXDSBaseTablePlugins} from './useXDSBaseTablePlugins';
export {
  proportional,
  pixel,
  generateColumns,
  columnWidthToCSS,
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
