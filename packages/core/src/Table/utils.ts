/**
 * @file utils.ts
 * @output Server-safe re-exports of pure Table utility functions
 * @position Subpath entry point: `@xds/core/Table/utils`
 */

export {
  proportional,
  pixel,
  capitalize,
  generateColumns,
  resolveColumnWidths,
  DEFAULT_MIN_COLUMN_WIDTH,
} from './columnUtils';

export type {
  ColumnWidth,
  ProportionalWidth,
  PixelWidth,
  XDSTableColumn,
} from './types';
