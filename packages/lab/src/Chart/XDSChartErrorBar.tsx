// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSChartErrorBar.tsx
 * @output Renders error bars (whiskers) at each data point
 * @position Child of XDSChart; reads scales from context
 */

import {useChart} from './ChartContext';
import {xPixel} from './utils';

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
  const {data, xKey, xScale, yScale} = useChart();

  return (
    <g>
      {data.map((d, i) => {
        const x = xPixel(d, xKey, xScale);
        const upper = typeof d[yUpper] === 'number' ? (d[yUpper] as number) : 0;
        const lower = typeof d[yLower] === 'number' ? (d[yLower] as number) : 0;
        const yTop = yScale(upper);
        const yBot = yScale(lower);
        const half = capWidth / 2;

        return (
          <g key={i}>
            <line
              x1={x}
              x2={x}
              y1={yTop}
              y2={yBot}
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <line
              x1={x - half}
              x2={x + half}
              y1={yTop}
              y2={yTop}
              stroke={color}
              strokeWidth={strokeWidth}
            />
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
