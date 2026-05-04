/**
 * @file columnUtils.ts
 * @input XDSTableColumn types from types.ts
 * @output Pure utility functions for column width, layout resolution, and auto-generation
 * @position Utility layer; consumed by XDSBaseTable.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (utility descriptions)
 * - /packages/core/src/Table/index.ts (exports if functions change)
 */

import type {CSSProperties, ReactNode} from 'react';
import type {XDSTableColumn, ProportionalWidth, PixelWidth} from './types';

/** Default minimum width (in px) for proportional columns. */
export const DEFAULT_MIN_COLUMN_WIDTH = 120;

// =============================================================================
// Resolved Column Widths
// =============================================================================

/**
 * Pre-computed width information for a single column.
 * Produced by `resolveColumnWidths()`, consumed by header cell rendering.
 */
export interface ResolvedColumnWidth {
  /** Inline style to apply on the `<th>` for this column. */
  style: CSSProperties;
}

/**
 * Result of `resolveColumnWidths()` — contains per-column width styles
 * and the aggregate table min-width. Computed once and shared between
 * the table min-width calculation and header cell rendering.
 */
export interface ResolvedColumnWidths {
  /** Per-column width styles, indexed by column key. */
  columns: Map<string, ResolvedColumnWidth>;
  /** Minimum table width (px) to prevent proportional columns from shrinking below their minWidth. */
  tableMinWidth: number;
}

/**
 * Resolve column widths for the entire table in a single pass.
 *
 * Computes:
 * - Per-column inline styles (`width`, `minWidth`) for `<th>` elements
 * - Aggregate `tableMinWidth` for the `<table>` element
 *
 * This consolidates width logic that was previously duplicated between
 * the `tableMinWidth` IIFE and the header cell rendering loop.
 *
 * @param columns - Resolved column definitions (after auto-generation)
 * @returns Pre-computed widths for each column and the table minimum width
 */
export function resolveColumnWidths<T extends Record<string, unknown>>(
  columns: XDSTableColumn<T>[],
): ResolvedColumnWidths {
  // --- Pass 1: Categorize columns and compute totals ---
  let totalProportion = 0;
  let pixelTotal = 0;
  const proportionalCols: Array<{
    key: string;
    proportion: number;
    minWidth: number;
  }> = [];

  for (const col of columns) {
    const w = col.width;
    if (w?.type === 'pixel') {
      pixelTotal += w.value;
    } else {
      const proportion = w?.value ?? 1;
      // Only count minWidth for columns that explicitly used proportional().
      // Columns with no width set (w === undefined) have no minimum —
      // they flex freely and the scroll wrapper handles overflow.
      const minW = w != null ? (w.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH) : 0;
      totalProportion += proportion;
      proportionalCols.push({key: col.key, proportion, minWidth: minW});
    }
  }

  // --- Pass 2: Compute table min-width ---
  let maxProportionalSpace = 0;
  if (totalProportion > 0) {
    for (const col of proportionalCols) {
      const required = (col.minWidth * totalProportion) / col.proportion;
      if (required > maxProportionalSpace) {
        maxProportionalSpace = required;
      }
    }
  }
  const tableMinWidth = pixelTotal + maxProportionalSpace;

  // --- Pass 3: Build per-column styles ---
  const result = new Map<string, ResolvedColumnWidth>();

  for (const col of columns) {
    const w = col.width;
    const style: CSSProperties = {};

    if (w?.type === 'pixel') {
      // Fixed pixel width — set both width and minWidth to prevent shrinking
      style.width = `${w.value}px`;
      style.minWidth = `${w.value}px`;
    } else {
      // Proportional width — compute percentage from total proportional units.
      const proportion = w?.value ?? 1;
      if (totalProportion > 0) {
        style.width = `${(proportion / totalProportion) * 100}%`;
      }
      // Only apply minWidth if the column explicitly used proportional().
      // Columns with no width set (w === undefined) have no minimum —
      // they flex freely and the scroll wrapper handles overflow.
      if (w != null) {
        const minW = w.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH;
        style.minWidth = `${minW}px`;
      }
    }

    result.set(col.key, {style});
  }

  return {columns: result, tableMinWidth};
}

/**
 * Create a proportional column width (fr-like).
 * Columns share available space proportionally.
 * Applies `DEFAULT_MIN_COLUMN_WIDTH` when no explicit minWidth is provided.
 *
 * @example
 * ```
 * proportional(2) // twice as wide as proportional(1)
 * proportional(1, { minWidth: 200 }) // explicit min
 * ```
 */
export function proportional(
  value: number = 1,
  options?: {minWidth?: number},
): ProportionalWidth {
  return {
    type: 'proportional',
    value,
    minWidth: options?.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH,
  };
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
