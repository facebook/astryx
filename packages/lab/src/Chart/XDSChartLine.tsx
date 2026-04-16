/**
 * @file XDSChartLine.tsx
 * @output Renders a line for a data key
 * @position Child of XDSChart; reads scales from context
 */

import {useMemo} from 'react';
import {line, curveMonotoneX} from 'd3-shape';
import {useChart} from './ChartContext';
import type {ScaleBand} from 'd3-scale';

export interface XDSChartLineProps {
  /** Which data key to visualize */
  dataKey: string;
  /** Line stroke color */
  color: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Show dots at data points */
  dots?: boolean;
  /** Dot radius */
  dotRadius?: number;
}

function isBandScale(scale: unknown): scale is ScaleBand<string> {
  return typeof scale === 'function' && 'bandwidth' in scale;
}

/**
 * Line mark. Works with both band and linear x-scales.
 *
 * @example
 * ```
 * <XDSChartLine dataKey="trend" color={useXDSChartColors().categorical(2)[1]} />
 * <XDSChartLine dataKey="trend" color="#0171E3" dots />
 * ```
 */
export function XDSChartLine({
  dataKey,
  color,
  strokeWidth = 2,
  dots = false,
  dotRadius = 3,
}: XDSChartLineProps) {
  const {data, xScale, yScale} = useChart();

  const points = useMemo(() => {
    return data.map((d, i) => {
      let x: number;
      if (isBandScale(xScale)) {
        x = (xScale(String(Object.values(d)[0])) ?? 0) + xScale.bandwidth() / 2;
      } else {
        const xVal = Object.values(d)[0];
        x = (xScale as (v: number) => number)(xVal as number);
      }
      const yVal = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
      return {x, y: yScale(yVal), index: i};
    });
  }, [data, dataKey, xScale, yScale]);

  const pathD = useMemo(() => {
    const generator = line<{x: number; y: number}>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(curveMonotoneX);
    return generator(points) ?? '';
  }, [points]);

  return (
    <g>
      <path d={pathD} fill="none" stroke={color} strokeWidth={strokeWidth} />
      {dots &&
        points.map(p => (
          <circle key={p.index} cx={p.x} cy={p.y} r={dotRadius} fill={color} />
        ))}
    </g>
  );
}
