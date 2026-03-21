/**
 * @file columnUtils.ts
 * @input XDSTableColumn types from types.ts
 * @output Pure utility functions for column width and auto-generation
 * @position Utility layer; consumed by XDSBaseTable.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (utility descriptions)
 * - /packages/core/src/Table/index.ts (exports if functions change)
 */

import type {ReactNode} from 'react';
import type {XDSTableColumn, ProportionalWidth, PixelWidth} from './types';

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
