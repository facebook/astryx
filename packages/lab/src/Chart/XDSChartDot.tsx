/**
 * @file XDSChartDot.tsx
 * @output Renders scatter dots for a pair of data keys
 * @position Child of XDSChart; reads scales from context
 */

import {useChart} from './ChartContext';
import type {ScaleBand} from 'd3-scale';

export interface XDSChartDotProps {
  /** Which data key for the y values */
  dataKey: string;
  /** Dot fill color */
  color: string;
  /** Dot radius */
  radius?: number;
}

function isBandScale(scale: unknown): scale is ScaleBand<string> {
  return typeof scale === 'function' && 'bandwidth' in scale;
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
  const {data, xScale, yScale} = useChart();

  return (
    <g>
      {data.map((d, i) => {
        let x: number;
        if (isBandScale(xScale)) {
          x =
            (xScale(String(Object.values(d)[0])) ?? 0) + xScale.bandwidth() / 2;
        } else {
          const xVal = Object.values(d)[0];
          x = (xScale as (v: number) => number)(xVal as number);
        }
        const yVal =
          typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
        return (
          <circle key={i} cx={x} cy={yScale(yVal)} r={radius} fill={color} />
        );
      })}
    </g>
  );
}
