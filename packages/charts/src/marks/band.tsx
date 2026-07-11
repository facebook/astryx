// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/band.tsx
 * @output Band (confidence interval) series — area between upper/lower bounds.
 *   Non-numeric/NaN bounds break the area into gaps instead of collapsing to a
 *   false zero baseline.
 */

import {area as d3Area, curveMonotoneX} from 'd3-shape';
import {
  DEFAULT_SERIES_COLOR,
  type SeriesDef,
  type ResolvedPoint,
} from '../types';
import type {ScaleBand} from 'd3-scale';

export interface BandOptions {
  upper: string;
  lower: string;
  color?: string;
  opacity?: number;
}

export function band(options: BandOptions): SeriesDef {
  const color = options.color ?? DEFAULT_SERIES_COLOR;
  const opacity = options.opacity ?? 0.15;

  return {
    type: 'band',
    key: `band-${options.upper}-${options.lower}`,
    dataKeys: [options.upper, options.lower],
    layout: {},

    resolve(ctx) {
      const {data, xKey, xScale, yScale} = ctx;
      const points: ResolvedPoint[] = [];
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        let px: number;
        if ('bandwidth' in xScale) {
          px =
            ((xScale as ScaleBand<string>)(String(d[xKey])) ?? 0) +
            (xScale as ScaleBand<string>).bandwidth() / 2;
        } else {
          px = xScale(d[xKey] as number);
        }
        // NaN for missing/non-numeric bounds so render() can gap the area
        // rather than draw a spike down to the axis.
        const upperVal = d[options.upper];
        const lowerVal = d[options.lower];
        const upper = Number.isFinite(upperVal) ? (upperVal as number) : NaN;
        const lower = Number.isFinite(lowerVal) ? (lowerVal as number) : NaN;
        points.push({px, py: yScale(upper), py0: yScale(lower), dataIndex: i});
      }
      return points;
    },

    render(resolved) {
      if (resolved.length === 0) {
        return null;
      }
      const areaGen = d3Area<ResolvedPoint>()
        .defined(
          d =>
            Number.isFinite(d.px) &&
            Number.isFinite(d.py) &&
            Number.isFinite(d.py0),
        )
        .x(d => d.px)
        .y0(d => d.py0)
        .y1(d => d.py)
        .curve(curveMonotoneX);
      const pathD = areaGen(resolved) ?? '';
      if (!pathD) {
        return null;
      }
      return (
        <path d={pathD} fill={color} fillOpacity={opacity} stroke="none" />
      );
    },
  };
}
