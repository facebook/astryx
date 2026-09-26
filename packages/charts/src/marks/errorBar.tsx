// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/errorBar.tsx
 * @output Error bar (whisker) series — vertical high/low bounds. Bounds are
 *   absolute (so asymmetric intervals work); a point missing either bound is
 *   skipped rather than drawn down to the axis.
 */

import type {SeriesDef, ResolvedPoint} from '../types';
import {xPixel} from '../utils';

export interface ErrorBarOptions {
  /** Data key for the upper bound */
  high: string;
  /** Data key for the lower bound */
  low: string;
  /** Stroke color */
  color?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Width of the whisker caps in pixels */
  capWidth?: number;
}

/**
 * Error bars with whisker caps. Pair with bar() or dot().
 *
 * @example
 * ```
 * series={[bar('mean'), errorBar({high: 'upper95', low: 'lower95'})]}
 * ```
 */
export function errorBar(options: ErrorBarOptions): SeriesDef {
  const {high, low} = options;
  const color = options.color ?? 'var(--color-text-primary)';
  const strokeWidth = options.strokeWidth ?? 1.5;
  const capWidth = options.capWidth ?? 8;

  return {
    type: 'errorBar',
    key: `errorBar-${high}-${low}`,
    dataKeys: [high, low],
    layout: {},

    resolve(ctx) {
      const {data, xKey, xScale, yScale} = ctx;
      const points: ResolvedPoint[] = [];
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        // NaN for a missing bound so render() skips the whole whisker instead
        // of anchoring a cap at the axis (a misleading zero-height error bar).
        const hiVal = d[high];
        const loVal = d[low];
        const upper =
          typeof hiVal === 'number' && Number.isFinite(hiVal) ? hiVal : NaN;
        const lower =
          typeof loVal === 'number' && Number.isFinite(loVal) ? loVal : NaN;
        points.push({
          px: xPixel(d, xKey, xScale),
          py: yScale(upper),
          py0: yScale(lower),
          dataIndex: i,
        });
      }
      return points;
    },

    render(resolved) {
      // Non-finite capWidth (NaN/±Infinity) would leak into the cap x-coords;
      // treat it like a non-positive width — draw the stem, drop the caps.
      const half = Number.isFinite(capWidth) ? Math.max(0, capWidth) / 2 : 0;
      return (
        <g>
          {resolved.map(p => {
            if (
              !Number.isFinite(p.px) ||
              !Number.isFinite(p.py) ||
              !Number.isFinite(p.py0)
            ) {
              return null;
            }
            return (
              <g key={p.dataIndex}>
                {/* Vertical stem */}
                <line
                  x1={p.px}
                  x2={p.px}
                  y1={p.py}
                  y2={p.py0}
                  stroke={color}
                  strokeWidth={strokeWidth}
                />
                {/* Upper cap */}
                <line
                  x1={p.px - half}
                  x2={p.px + half}
                  y1={p.py}
                  y2={p.py}
                  stroke={color}
                  strokeWidth={strokeWidth}
                />
                {/* Lower cap */}
                <line
                  x1={p.px - half}
                  x2={p.px + half}
                  y1={p.py0}
                  y2={p.py0}
                  stroke={color}
                  strokeWidth={strokeWidth}
                />
              </g>
            );
          })}
        </g>
      );
    },
  };
}
