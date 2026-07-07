// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markColor.ts
 * @output Color resolution shared by marks
 * @position Used by mark renderers to turn an optional color into a concrete one
 *
 * Precedence: an explicit color (string or accessor) always wins; otherwise the
 * chart root's palette color for the series (`_resolvedColor`); otherwise a real
 * data-viz token fallback. This is what makes an un-colored `bar('revenue')`
 * render a real color instead of the historical broken `--color-chart-1`.
 */

import {
  DEFAULT_SERIES_COLOR,
  type SeriesDef,
  type ColorAccessor,
} from './types';

/** The single resolved color for a series (line/area/band and similar). */
export function seriesFill(
  def: SeriesDef,
  color: ColorAccessor | undefined,
): string {
  if (typeof color === 'string') {
    return color;
  }
  return def._resolvedColor ?? DEFAULT_SERIES_COLOR;
}

/** Per-point fill: an accessor wins, then an explicit string, then the palette. */
export function pointFill(
  def: SeriesDef,
  color: ColorAccessor | undefined,
  datum: Record<string, unknown>,
  index: number,
): string {
  if (typeof color === 'function') {
    return color(datum, index);
  }
  if (typeof color === 'string') {
    return color;
  }
  return def._resolvedColor ?? DEFAULT_SERIES_COLOR;
}
