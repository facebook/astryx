/**
 * @file XDSChartErrorBar.tsx
 * @output Renders error bars (whiskers) at each data point
 * @position Child of XDSChart; reads scales from context
 */

import {useChart} from './ChartContext';
import type {ScaleBand} from 'd3-scale';

export interface XDSChartErrorBarProps {
  /** Data key for the upper bound */
  yUpper: string;
  /** Data key for the lower bound */
  yLower: string;
  /** Stroke color */
  color?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Width of the whisker caps in pixels */
  capWidth?: number;
}

function isBandScale(scale: unknown): scale is ScaleBand<string> {
  return typeof scale === 'function' && 'bandwidth' in scale;
}

/**
 * Error bars with whisker caps. Pair with XDSChartBar or XDSChartDot.
 *
 * @example
 * ```
 * <XDSChartBar dataKey="mean" color={colors[0]} />
 * <XDSChartErrorBar yUpper="upper95" yLower="lower95" />
 * ```
 */
export function XDSChartErrorBar({
  yUpper,
  yLower,
  color = 'var(--color-text-primary)',
  strokeWidth = 1.5,
  capWidth = 8,
}: XDSChartErrorBarProps) {
  const {data, xScale, yScale} = useChart();

  return (
    <g>
      {data.map((d, i) => {
        let x: number;
        if (isBandScale(xScale)) {
          x =
            (xScale(String(Object.values(d)[0])) ?? 0) + xScale.bandwidth() / 2;
        } else {
          x = (xScale as (v: number) => number)(Object.values(d)[0] as number);
        }

        const upper = typeof d[yUpper] === 'number' ? (d[yUpper] as number) : 0;
        const lower = typeof d[yLower] === 'number' ? (d[yLower] as number) : 0;
        const yTop = yScale(upper);
        const yBot = yScale(lower);
        const half = capWidth / 2;

        return (
          <g key={i}>
            {/* Vertical stem */}
            <line
              x1={x}
              x2={x}
              y1={yTop}
              y2={yBot}
              stroke={color}
              strokeWidth={strokeWidth}
            />
            {/* Top cap */}
            <line
              x1={x - half}
              x2={x + half}
              y1={yTop}
              y2={yTop}
              stroke={color}
              strokeWidth={strokeWidth}
            />
            {/* Bottom cap */}
            <line
              x1={x - half}
              x2={x + half}
              y1={yBot}
              y2={yBot}
              stroke={color}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      })}
    </g>
  );
}
