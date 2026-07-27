// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file utils.ts
 * @output Shared utilities for chart components
 * @position Internal helpers; consumed by mark, axis, and interaction components
 */

import type {ScaleBand} from 'd3-scale';
import type {ChartScale} from './types';

/** Type guard for d3 band scales */
export function isBandScale(scale: ChartScale): scale is ScaleBand<string> {
  return typeof scale === 'function' && 'bandwidth' in scale;
}

/**
 * Get the x pixel position for a datum using the chart's xKey and xScale.
 * For band scales, returns the center of the band.
 */
export function xPixel(
  d: Record<string, unknown>,
  xKey: string,
  xScale: ChartScale,
): number {
  const raw = d[xKey];
  if (isBandScale(xScale)) {
    return (xScale(String(raw)) ?? 0) + xScale.bandwidth() / 2;
  }
  // Not a band scale → the guard narrows `xScale` to the linear scale, so no
  // cast is needed. Coerce explicitly: finite numbers pass through, Date/
  // numeric-string map as d3 would. Anything that coerces to a non-finite value
  // — a non-numeric (→ NaN) or a raw ±Infinity — collapses to NaN, a single
  // off-canvas sentinel that marks already skip, rather than a silently wrong
  // position (d3 maps ±Infinity to an out-of-range pixel, not off-canvas).
  const value = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(value) ? xScale(value) : NaN;
}
