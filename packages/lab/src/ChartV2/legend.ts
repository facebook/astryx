// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file legend.ts
 * @output Legend utility — derives legend items from series definitions
 * @position Used by XDSChart to bridge series → legend items
 */

import {isUtilityMarkType, type SeriesDef} from './types';

export interface LegendItem {
  label: string;
  color: string;
  /** Mark type — determines swatch shape (square for bar, line for everything else) */
  type?: string;
}

/**
 * Derive legend items from series definitions.
 * Skips utility marks and series without a color.
 */
export function deriveLegendItems(series: readonly SeriesDef[]): LegendItem[] {
  return series
    .filter(s => !isUtilityMarkType(s.type) && s.color)
    .map(s => ({label: s.label ?? s.key, color: s.color!, type: s.type}));
}
