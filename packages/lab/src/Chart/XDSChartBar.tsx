/**
 * @file XDSChartBar.tsx
 * @output Renders vertical bars for a data key
 * @position Child of XDSChart; reads scales from context
 */

import {useChart} from './ChartContext';
import type {ScaleBand} from 'd3-scale';

export interface XDSChartBarProps {
  /** Which data key to visualize */
  dataKey: string;
  /** Bar fill color (hex string, CSS var, etc.) */
  color: string;
  /** Corner radius on bar tops */
  radius?: number;
}

function isBandScale(scale: unknown): scale is ScaleBand<string> {
  return typeof scale === 'function' && 'bandwidth' in scale;
}

/**
 * Bar marks. Requires a band xScale (categorical x-axis).
 *
 * @example
 * ```
 * <XDSChartBar dataKey="revenue" color={useXDSChartColors().categorical(1)[0]} />
 * ```
 */
export function XDSChartBar({dataKey, color, radius = 4}: XDSChartBarProps) {
  const {data, xScale, yScale, height} = useChart();

  if (!isBandScale(xScale)) return null;

  return (
    <g>
      {data.map((d, i) => {
        const xVal = xScale(String(Object.values(d)[0]));
        if (xVal == null) return null;

        const yVal =
          typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
        const barHeight = height - yScale(yVal);
        const barY = yScale(yVal);

        return (
          <rect
            key={i}
            x={xVal}
            y={barY}
            width={xScale.bandwidth()}
            height={Math.max(0, barHeight)}
            fill={color}
            rx={radius}
            ry={radius}
          />
        );
      })}
    </g>
  );
}
