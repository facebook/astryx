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
export {XDSBaseTableRow} from './XDSBaseTableRow';
export {XDSBaseTableCell} from './XDSBaseTableCell';
export {TableContext} from './TableContext';
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
} from './types';
export type {
  XDSTableProps,
  XDSTableDensity,
  XDSTableDividers,
} from './XDSTable';
export type {XDSBaseTableRowProps} from './XDSBaseTableRow';
export type {XDSBaseTableCellProps} from './XDSBaseTableCell';
export type {TableContextValue} from './TableContext';
