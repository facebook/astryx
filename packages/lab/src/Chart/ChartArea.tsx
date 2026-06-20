// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartArea.tsx
 * @output Renders a filled area between two y-bounds — confidence intervals, bands, ranges
 * @position Child of Chart; reads scales from context
 */

import {useMemo} from 'react';
import {area, curveMonotoneX} from 'd3-shape';
import {useChart} from './ChartContext';
import {xPixel} from './utils';

export interface ChartAreaProps {
  /** Data key for the upper bound. If omitted, uses `baseline`. */
  yUpper?: string;
  /** Data key for the lower bound. If omitted, uses `baseline`. */
  yLower?: string;
  /** Fallback data key when only one bound is specified. */
  baseline?: string;
  /** Fill color */
  color: string;
  /** Fill opacity (default: 0.2) */
  opacity?: number;
  /** Optional stroke on the band edges */
  stroke?: boolean;
  /** Stroke width when stroke is enabled */
  strokeWidth?: number;
}

/**
 * Area band between two y-values. Use for confidence intervals, error ranges,
 * or any min/max band around a line.
 *
 * @example
 * ```
 * <ChartArea yUpper="upper95" yLower="lower95" color={colors[0]} />
 * <ChartArea yUpper="upper95" baseline="mean" color={colors[0]} />
 * ```
 */
export function ChartArea({
  yUpper,
  yLower,
  baseline,
  color,
  opacity = 0.2,
  stroke = false,
  strokeWidth = 1,
}: ChartAreaProps) {
  const {data, xKey, xScale, yScale} = useChart();

  const upperKey = yUpper ?? baseline;
  const lowerKey = yLower ?? baseline;

  const pathD = useMemo(() => {
    if (!upperKey || !lowerKey) {
      return '';
    }
    const generator = area<Record<string, unknown>>()
      .x(d => xPixel(d, xKey, xScale))
      .y0(d => {
        const v = typeof d[lowerKey] === 'number' ? (d[lowerKey] as number) : 0;
        return yScale(v);
      })
      .y1(d => {
        const v = typeof d[upperKey] === 'number' ? (d[upperKey] as number) : 0;
        return yScale(v);
      })
      .curve(curveMonotoneX);
    return generator(data) ?? '';
  }, [data, xKey, xScale, yScale, upperKey, lowerKey]);

  if (!pathD) {
    return null;
  }

  return (
    <g>
      <path d={pathD} fill={color} fillOpacity={opacity} stroke="none" />
      {stroke && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity * 2}
        />
      )}
    </g>
  );
}
