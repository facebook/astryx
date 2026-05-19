/**
 * @file legend.ts
 * @output Legend utility — derives legend items from series definitions
 * @position Used by XDSChart to bridge series → legend items
 */

import type {SeriesDef} from './types';

export interface LegendItem {
  label: string;
  color: string;
  /** Mark type — determines swatch shape (square for bar/area/dot, line for line) */
  type?: string;
}

/** Series types that don't appear in the legend */
const SKIP_TYPES = new Set(['referenceLine', 'errorBar', 'band']);

/**
 * Derive legend items from series definitions.
 * Skips utility marks and series without a color.
 */
export function deriveLegendItems(series: readonly SeriesDef[]): LegendItem[] {
  return series
    .filter(s => !SKIP_TYPES.has(s.type) && s.color)
    .map(s => ({label: s.label ?? s.key, color: s.color!, type: s.type}));
}
