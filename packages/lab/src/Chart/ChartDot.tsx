// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartDot.tsx
 * @output Renders scatter dots for a data key
 * @position Child of Chart; reads scales from context
 */

import {useChart} from './ChartContext';
import {xPixel} from './utils';

export interface ChartDotProps {
  /** Which data key for the y values */
  dataKey: string;
  /** Dot fill color */
  color: string;
  /** Dot radius */
  radius?: number;
}

/**
 * Scatter dot marks.
 *
 * @example
 * ```
 * <ChartDot dataKey="outliers" color={useChartColors().categorical(3)[2]} />
 * ```
 */
export function ChartDot({dataKey, color, radius = 4}: ChartDotProps) {
  const {data, xKey, xScale, yScale} = useChart();

  return (
    <g>
      {data.map((d, i) => {
        const x = xPixel(d, xKey, xScale);
        const yVal =
          typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
        return (
          <circle key={i} cx={x} cy={yScale(yVal)} r={radius} fill={color} />
        );
      })}
    </g>
  );
}
