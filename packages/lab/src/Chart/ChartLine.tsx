// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartLine.tsx
 * @output Renders a line for a data key
 * @position Child of Chart; reads scales from context
 */

import {useMemo} from 'react';
import {line, curveMonotoneX} from 'd3-shape';
import {useChart} from './ChartContext';
import {xPixel} from './utils';

export interface ChartLineProps {
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

/**
 * Line mark. Works with both band and linear x-scales.
 *
 * @example
 * ```
 * <ChartLine dataKey="trend" color={useChartColors().categorical(2)[1]} />
 * <ChartLine dataKey="trend" color="#0171E3" dots />
 * ```
 */
export function ChartLine({
  dataKey,
  color,
  strokeWidth = 2,
  dots = false,
  dotRadius = 3,
}: ChartLineProps) {
  const {data, xKey, xScale, yScale} = useChart();

  const points = useMemo(() => {
    return data.map((d, i) => {
      const x = xPixel(d, xKey, xScale);
      const yVal = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
      return {x, y: yScale(yVal), index: i};
    });
  }, [data, xKey, dataKey, xScale, yScale]);

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
