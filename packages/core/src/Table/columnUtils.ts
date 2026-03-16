/**
 * @file columnUtils.ts
 * @input XDSTableColumn, ColumnWidth types from types.ts
 * @output Pure utility functions for column width and auto-generation
 * @position Utility layer; consumed by XDSBaseTable.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (utility descriptions)
 * - /packages/core/src/Table/index.ts (exports if functions change)
 */

import type {ReactNode} from 'react';
import type {
  XDSTableColumn,
  ColumnWidth,
  ProportionalWidth,
  PixelWidth,
} from './types';

/**
 * Default minimum column width in pixels.
 * Applied to proportional-width columns that don't specify a custom minWidth.
 * Pixel-width columns use their pixel value as the implicit minimum.
 */
export const DEFAULT_MIN_COLUMN_WIDTH = 60;

/**
 * Create a proportional column width (fr-like).
 * Columns share available space proportionally.
 *
 * @example
 * ```
 * proportional(2) // twice as wide as proportional(1)
 * ```
 */
export function proportional(value: number = 1): ProportionalWidth {
  return {type: 'proportional', value};
}

/**
 * Create a fixed pixel column width.
 *
 * @example
 * ```
 * pixel(200) // exactly 200px wide
 * ```
 */
export function pixel(value: number): PixelWidth {
  return {type: 'pixel', value};
}

/**
 * Convert a ColumnWidth to a CSS width string for `<col>`.
 *
 * Proportional widths are converted to percentages relative to the
 * total proportional units across all columns.
 */
export function columnWidthToCSS(
  width: ColumnWidth,
  totalProportional: number,
): string {
  if (width.type === 'pixel') {
    return `${width.value}px`;
  }
  // Convert proportional to percentage
  const pct = (width.value / totalProportional) * 100;
  return `${pct}%`;
}

/**
 * Capitalize the first letter of a string.
 * Used for auto-generating header text from data keys.
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Default cell renderer — converts the value at `item[key]` to a string.
 */
export function defaultCellRenderer<T extends Record<string, unknown>>(
  item: T,
  key: string,
): ReactNode {
  const value = item[key];
  if (value == null) return '';
  return String(value);
}

/**
 * Resolve the effective minimum width (in px) for a single column.
 *
 * Priority:
 * 1. Explicit `minWidth` on the column definition
 * 2. Pixel-width columns use their pixel value as the implicit minimum
 * 3. Falls back to `DEFAULT_MIN_COLUMN_WIDTH`
 */
export function resolveColumnMinWidth<T extends Record<string, unknown>>(
  column: XDSTableColumn<T>,
): number {
  if (column.minWidth != null) return column.minWidth;
  if (column.width?.type === 'pixel') return column.width.value;
  return DEFAULT_MIN_COLUMN_WIDTH;
}

/**
 * Compute the total minimum table width from all columns.
 * Returns undefined if the total equals 0 (no columns).
 */
export function computeTableMinWidth<T extends Record<string, unknown>>(
  columns: XDSTableColumn<T>[],
): number | undefined {
  if (columns.length === 0) return undefined;
  const total = columns.reduce(
    (sum, col) => sum + resolveColumnMinWidth(col),
    0,
  );
  return total > 0 ? total : undefined;
}

/**
 * Auto-generate column definitions from the keys of the first data item.
 * Each column gets `proportional(1)` width and a capitalized header.
 */
export function generateColumns<T extends Record<string, unknown>>(
  data: T[],
): XDSTableColumn<T>[] {
  if (data.length === 0) return [];
  const firstItem = data[0];
  return Object.keys(firstItem).map(key => ({
    key,
    header: capitalize(key),
    width: proportional(1),
  }));
}
