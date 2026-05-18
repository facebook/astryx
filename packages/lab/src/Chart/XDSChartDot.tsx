// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSChartDot.tsx
 * @output Renders scatter dots for a data key
 * @position Child of XDSChart; reads scales from context
 */

import {useChart} from './ChartContext';
import {xPixel} from './utils';

export interface XDSChartDotProps {
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
 * <XDSChartDot dataKey="outliers" color={useXDSChartColors().categorical(3)[2]} />
 * ```
 */
export function XDSChartDot({dataKey, color, radius = 4}: XDSChartDotProps) {
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
