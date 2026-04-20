/**
 * @file XDSChartLine.tsx
 * @output Renders a line for a data key
 * @position Child of XDSChart; reads scales from context
 */

import {useMemo} from 'react';
import {line, curveMonotoneX} from 'd3-shape';
import {useChart} from './ChartContext';
import {useBrush} from './BrushContext';
import {xPixel} from './utils';

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
  const {data, xKey, xScale, yScale} = useChart();
  const {range} = useBrush();

  const points = useMemo(() => {
    return data.map((d, i) => {
      const x = xPixel(d, xKey, xScale);
      const yVal = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
      const xv = d[xKey];
      const inBrush =
        !range ||
        (typeof xv === 'number' && xv >= range.x[0] && xv <= range.x[1]);
      return {x, y: yScale(yVal), index: i, inBrush};
    });
  }, [data, xKey, dataKey, xScale, yScale, range]);

  const pathD = useMemo(() => {
    const generator = line<{x: number; y: number}>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(curveMonotoneX);
    return generator(points) ?? '';
  }, [points]);

  // When brush is active, draw the full line muted and overlay the selected segment
  const hasActiveBrush = range != null;

  return (
    <g>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={hasActiveBrush ? 0.2 : 1}
      />
      {hasActiveBrush &&
        (() => {
          // Draw highlighted segment
          const selectedPoints = points.filter(p => p.inBrush);
          if (selectedPoints.length < 2) return null;
          const gen = line<{x: number; y: number}>()
            .x(d => d.x)
            .y(d => d.y)
            .curve(curveMonotoneX);
          const highlightPath = gen(selectedPoints) ?? '';
          return (
            <path
              d={highlightPath}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth + 0.5}
            />
          );
        })()}
      {dots &&
        points.map(p => (
          <circle
            key={p.index}
            cx={p.x}
            cy={p.y}
            r={dotRadius}
            fill={color}
            opacity={p.inBrush ? 1 : 0.15}
          />
        ))}
    </g>
  );
}
