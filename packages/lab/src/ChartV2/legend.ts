// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file legend.ts
 * @output Legend utility — derives legend items from series definitions
 * @position Used by Chart to bridge series → legend items
 */

import {isUtilityMarkType, type SeriesDef} from './types';

export interface LegendItem {
  label: string;
  color: string;
  /** Mark type — determines swatch shape (square for bar, line for everything else) */
  type?: string;
}

function hasLegendColor(
  series: SeriesDef,
): series is SeriesDef & {readonly color: string} {
  return !isUtilityMarkType(series.type) && series.color != null;
}

/**
 * Derive legend items from series definitions.
 * Skips utility marks and series without a color.
 */
export function deriveLegendItems(series: readonly SeriesDef[]): LegendItem[] {
  return series
    .filter(hasLegendColor)
    .map(s => ({label: s.label ?? s.key, color: s.color, type: s.type}));
}
