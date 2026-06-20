// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartGrid.tsx
 * @output Renders horizontal and/or vertical grid lines
 * @position Child of Chart; reads scales from context
 */

import {useMemo} from 'react';
import {useChart} from './ChartContext';
import {isBandScale} from './utils';
import type {ScaleLinear, ScaleTime} from 'd3-scale';

export interface ChartGridProps {
  /** Show horizontal grid lines (default: true) */
  horizontal?: boolean;
  /** Show vertical grid lines */
  vertical?: boolean;
}

/**
 * Grid lines behind chart marks.
 *
 * @example
 * ```
 * <ChartGrid horizontal />
 * <ChartGrid horizontal vertical />
 * ```
 */
export function ChartGrid({
  horizontal = true,
  vertical = false,
}: ChartGridProps) {
  const {width, height, xScale, yScale} = useChart();

  const hLines = useMemo(() => {
    if (!horizontal) {
      return [];
    }
    return yScale.ticks(5).map(tick => yScale(tick));
  }, [horizontal, yScale]);

  const vLines = useMemo(() => {
    if (!vertical) {
      return [];
    }
    if (isBandScale(xScale)) {
      return xScale
        .domain()
        .map(d => (xScale(d) ?? 0) + xScale.bandwidth() / 2);
    }
    const linear = xScale as
      | ScaleLinear<number, number>
      | ScaleTime<number, number>;
    return linear.ticks(5).map(d => linear(d as number & Date));
  }, [vertical, xScale]);

  return (
    <g>
      {hLines.map(y => (
        <line
          key={`h-${y}`}
          x1={0}
          x2={width}
          y1={y}
          y2={y}
          stroke="var(--color-border)"
          strokeOpacity={0.5}
          strokeDasharray="4 4"
        />
      ))}
      {vLines.map(x => (
        <line
          key={`v-${x}`}
          x1={x}
          x2={x}
          y1={0}
          y2={height}
          stroke="var(--color-border)"
          strokeOpacity={0.5}
          strokeDasharray="4 4"
        />
      ))}
    </g>
  );
}
