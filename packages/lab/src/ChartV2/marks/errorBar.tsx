// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/errorBar.tsx
 * @output Error bar (whisker) series — vertical high/low bounds
 */

import type {SeriesDef, ResolvedPoint} from '../types';
import type {ScaleBand} from 'd3-scale';

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
        let px: number;
        if ('bandwidth' in xScale) {
          px = ((xScale as ScaleBand<string>)(String(d[xKey])) ?? 0) + (xScale as ScaleBand<string>).bandwidth() / 2;
        } else {
          px = xScale(d[xKey] as number);
        }
        const upper = typeof d[high] === 'number' ? (d[high] as number) : 0;
        const lower = typeof d[low] === 'number' ? (d[low] as number) : 0;
        points.push({px, py: yScale(upper), py0: yScale(lower), dataIndex: i});
      }
      return points;
    },

    render(resolved) {
      const half = capWidth / 2;
      return (
        <g>
          {resolved.map((p, i) => (
            <g key={i}>
              {/* Vertical stem */}
              <line
                x1={p.px} x2={p.px} y1={p.py} y2={p.py0}
                stroke={color} strokeWidth={strokeWidth}
              />
              {/* Upper cap */}
              <line
                x1={p.px - half} x2={p.px + half} y1={p.py} y2={p.py}
                stroke={color} strokeWidth={strokeWidth}
              />
              {/* Lower cap */}
              <line
                x1={p.px - half} x2={p.px + half} y1={p.py0} y2={p.py0}
                stroke={color} strokeWidth={strokeWidth}
              />
            </g>
          ))}
        </g>
      );
    },
  };
}
