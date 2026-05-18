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
  return (xScale as (v: number) => number)(raw as number);
}
