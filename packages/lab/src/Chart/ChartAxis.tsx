// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartAxis.tsx
 * @output Renders an axis (top, right, bottom, left) using the chart's scales
 * @position Child of Chart; reads scales from context
 *
 * Ticks use CSS transitions for smooth sliding during streaming updates.
 */

import {useMemo} from 'react';
import {useChart} from './ChartContext';
import {isBandScale} from './utils';
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
}

/**
 * Chart axis. Renders tick marks and labels for the x or y dimension.
 * Ticks transition smoothly when the scale domain shifts (e.g. streaming).
 *
 * @example
 * ```
 * <ChartAxis position="bottom" />
 * <ChartAxis position="left" tickCount={5} tickFormat={currency} />
 * <ChartAxis position="bottom" maxTicks={6} truncate={10} />
 * ```
 */
export function ChartAxis({
  position,
  tickCount = 5,
  maxTicks,
  tickFormat,
  truncate,
  animated = true,
}: ChartAxisProps) {
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

  // For the bottom axis, draw the axis line at y=0 when the domain spans negative values
  const axisLineY = (() => {
    if (position !== 'bottom') {
      return 0;
    }
    const domain = yScale.domain();
    if (domain[0] < 0 && domain[1] > 0) {
      // The axis line should appear at the zero mark relative to the bottom edge
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
  const tickSize = 6;

  // Transition style for smooth tick movement during streaming
  const tickTransition = animated
    ? 'transform 150ms linear, opacity 150ms ease'
    : undefined;

  return (
    <g transform={transform}>
      {/* Axis line — at y=0 for bottom axis when domain spans negative values */}
      <line
        x1={isHorizontal ? 0 : 0}
        x2={isHorizontal ? width : 0}
        y1={isHorizontal ? axisLineY : 0}
        y2={isHorizontal ? axisLineY : height}
        stroke="var(--color-border-emphasized)"
        strokeWidth={1}
      />
      {ticks.map(({value, offset}) => {
        const label = format(value);
        // Clip ticks that are outside the visible area
        const isVisible = isHorizontal
          ? offset >= -10 && offset <= width + 10
          : offset >= -10 && offset <= height + 10;

        if (isHorizontal) {
          const y = position === 'bottom' ? tickSize : -tickSize;
          return (
            <g
              key={label}
              style={{
                transform: `translateX(${offset}px)`,
                transition: tickTransition,
                opacity: isVisible ? 1 : 0,
              }}>
              <line
                y2={y}
                stroke="var(--color-border-emphasized)"
                strokeWidth={1}
              />
              <text
                y={position === 'bottom' ? tickSize + 12 : -(tickSize + 4)}
                textAnchor="middle"
                fill="var(--color-text-secondary)"
                fontSize={12}>
                {label}
              </text>
            </g>
          );
        }
        // Vertical axis
        const x = position === 'left' ? -tickSize : tickSize;
        return (
          <g
            key={label}
            style={{
              transform: `translateY(${offset}px)`,
              transition: tickTransition,
              opacity: isVisible ? 1 : 0,
            }}>
            <line
              x2={x}
              stroke="var(--color-border-emphasized)"
              strokeWidth={1}
            />
            <text
              x={position === 'left' ? -(tickSize + 4) : tickSize + 4}
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
