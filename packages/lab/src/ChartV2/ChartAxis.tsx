// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartAxis.tsx (v2)
 * @output Renders an axis (top, right, bottom, left) using the chart's scales
 * @position Child of Chart v2; reads scales from chart context
 *
 * The axis edge line and tick marks are independently toggleable so callers
 * can compose: line-only, line + ticks, or line + ticks + grid (paired with
 * `<ChartGrid>`). To stay consistent with most charts, the bottom axis
 * draws its edge line by default and other positions don't.
 *
 * Ticks use CSS transitions for smooth sliding during streaming updates.
 */

import {useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@xds/core/theme/tokens.stylex';
import {useChart} from '../Chart/ChartContext';
import {isBandScale} from '../Chart/utils';
import type {ScaleLinear, ScaleTime} from 'd3-scale';

export interface ChartAxisProps {
  /** Which edge to render the axis on */
  position: 'top' | 'right' | 'bottom' | 'left';
  /** Number of ticks (approximate — d3 decides final count) */
  tickCount?: number;
  /** Maximum number of tick labels to show. Labels are evenly skipped when exceeded. */
  maxTicks?: number;
  /** Custom tick formatter */
  tickFormat?: (value: unknown) => string;
  /** Truncate labels to this many characters (appends "\u2026"). */
  truncate?: number;
  /** Enable smooth transitions for streaming (default: true) */
  animated?: boolean;
  /**
   * Show the axis edge line. Defaults to `true` for `position="bottom"`,
   * `false` otherwise. Forced to `true` when `showTicks` is enabled.
   * Pair with `<ChartGrid vertical />` and pass `showAxisLine` on the
   * corresponding side axis to keep the visual edge grounded.
   */
  showAxisLine?: boolean;
  /** Show perpendicular tick marks at each tick label. Default: `false`. */
  showTicks?: boolean;
}

const styles = stylex.create({
  axisLine: {
    stroke: colorVars['--color-text-primary'],
    strokeWidth: 1,
  },
  tickMark: {
    stroke: colorVars['--color-text-primary'],
    strokeWidth: 1,
  },
});

const TICK_SIZE = 6;

/**
 * Chart axis. Always draws tick labels; the axis edge line and tick marks
 * are independently toggleable. Pair with `<ChartGrid>` for grid lines.
 *
 * @example
 * ```
 * <ChartAxis position="bottom" />               // edge line + labels
 * <ChartAxis position="left" />                 // labels only (no edge line)
 * <ChartAxis position="left" showAxisLine showTicks />
 * ```
 */
export function ChartAxis({
  position,
  tickCount = 5,
  maxTicks,
  tickFormat,
  truncate,
  animated = true,
  showAxisLine = position === 'bottom',
  showTicks = false,
}: ChartAxisProps) {
  // Tick marks need an axis line to anchor against; force it on when ticks
  // are enabled so the two visuals stay coherent.
  const renderAxisLine = showAxisLine || showTicks;
  const {width, height, xScale, yScale} = useChart();

  const isHorizontal = position === 'top' || position === 'bottom';
  const scale = isHorizontal ? xScale : yScale;

  const ticks = useMemo(() => {
    let allTicks: {value: unknown; offset: number}[];
    if (isBandScale(scale)) {
      allTicks = scale.domain().map(d => ({
        value: d,
        offset: (scale(d) ?? 0) + scale.bandwidth() / 2,
      }));
    } else {
      const linearScale = scale as
        | ScaleLinear<number, number>
        | ScaleTime<number, number>;
      allTicks = linearScale.ticks(tickCount).map(d => ({
        value: d,
        offset: linearScale(d as number & Date),
      }));
    }

    // Auto-skip: show every Nth label if maxTicks is exceeded
    if (maxTicks && allTicks.length > maxTicks) {
      const step = Math.ceil(allTicks.length / maxTicks);
      allTicks = allTicks.filter((_, i) => i % step === 0);
    }

    return allTicks;
  }, [scale, tickCount, maxTicks]);

  const transform =
    position === 'bottom'
      ? `translate(0,${height})`
      : position === 'right'
        ? `translate(${width},0)`
        : undefined;

  // For the bottom axis, draw the axis line at y=0 when the domain spans
  // negative values (so the axis line still represents zero, not the chart edge).
  const axisLineY = (() => {
    if (position !== 'bottom') {
      return 0;
    }
    const domain = yScale.domain();
    if (domain[0] < 0 && domain[1] > 0) {
      return yScale(0) - height;
    }
    return 0;
  })();

  const baseFormat = tickFormat ?? String;
  const format = truncate
    ? (value: unknown) => {
        const str = baseFormat(value);
        return str.length > truncate ? str.slice(0, truncate) + '\u2026' : str;
      }
    : baseFormat;

  const tickTransition = animated
    ? 'transform 150ms linear, opacity 150ms ease'
    : undefined;

  return (
    <g transform={transform}>
      {renderAxisLine && (
        <line
          x1={0}
          x2={isHorizontal ? width : 0}
          y1={isHorizontal ? axisLineY : 0}
          y2={isHorizontal ? axisLineY : height}
          {...stylex.props(styles.axisLine)}
        />
      )}
      {ticks.map(({value, offset}) => {
        const label = format(value);
        const isVisible = isHorizontal
          ? offset >= -10 && offset <= width + 10
          : offset >= -10 && offset <= height + 10;

        if (isHorizontal) {
          const y = position === 'bottom' ? TICK_SIZE : -TICK_SIZE;
          return (
            <g
              key={label}
              style={{
                transform: `translateX(${offset}px)`,
                transition: tickTransition,
                opacity: isVisible ? 1 : 0,
              }}>
              {showTicks && <line y2={y} {...stylex.props(styles.tickMark)} />}
              <text
                y={position === 'bottom' ? TICK_SIZE + 12 : -(TICK_SIZE + 4)}
                textAnchor="middle"
                fill="var(--color-text-secondary)"
                fontSize={12}>
                {label}
              </text>
            </g>
          );
        }
        // Vertical axis
        const x = position === 'left' ? -TICK_SIZE : TICK_SIZE;
        return (
          <g
            key={label}
            style={{
              transform: `translateY(${offset}px)`,
              transition: tickTransition,
              opacity: isVisible ? 1 : 0,
            }}>
            {showTicks && <line x2={x} {...stylex.props(styles.tickMark)} />}
            <text
              x={position === 'left' ? -(TICK_SIZE + 4) : TICK_SIZE + 4}
              dy="0.32em"
              textAnchor={position === 'left' ? 'end' : 'start'}
              fill="var(--color-text-secondary)"
              fontSize={12}>
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
