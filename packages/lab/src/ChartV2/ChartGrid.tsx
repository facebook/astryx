// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartGrid.tsx (v2)
 * @output Grid lines behind chart marks
 * @position Child of Chart v2; reads scales from chart context
 */

import {useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@xds/core/theme/tokens.stylex';
import {useChart} from '../Chart/ChartContext';
import {isBandScale} from '../Chart/utils';
import type {ScaleLinear, ScaleTime} from 'd3-scale';

export interface ChartGridProps {
  /** Show horizontal grid lines. Default: `true`. */
  horizontal?: boolean;
  /** Show vertical grid lines. Default: `false`. */
  vertical?: boolean;
}

const styles = stylex.create({
  gridLine: {
    stroke: colorVars['--color-border-emphasized'],
    strokeWidth: 1,
  },
});

/**
 * Grid lines behind chart marks.
 *
 * Pair with `<ChartAxis>` so users always see an axis line beside the
 * grid — the components are designed to be used together.
 *
 * @example
 * ```
 * <ChartGrid />                 // horizontal grid lines (default)
 * <ChartGrid horizontal vertical />
 * ```
 */
export function ChartGrid({
  horizontal = true,
  vertical = false,
}: ChartGridProps) {
  const {width, height, xScale, yScale} = useChart();

  // Skip the y=0 line when emphasizing it via the axis. Without this we'd
  // double-draw on top of the axis line.
  const hLines = useMemo(() => {
    if (!horizontal) {
      return [];
    }
    return yScale
      .ticks(5)
      .filter(tick => tick !== 0)
      .map(tick => yScale(tick));
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
          {...stylex.props(styles.gridLine)}
        />
      ))}
      {vLines.map(x => (
        <line
          key={`v-${x}`}
          x1={x}
          x2={x}
          y1={0}
          y2={height}
          {...stylex.props(styles.gridLine)}
        />
      ))}
    </g>
  );
}
