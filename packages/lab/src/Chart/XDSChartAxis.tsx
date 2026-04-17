/**
 * @file XDSChartAxis.tsx
 * @output Renders an axis (top, right, bottom, left) using the chart's scales
 * @position Child of XDSChart; reads scales from context
 *
 * Ticks use CSS transitions for smooth sliding during streaming updates.
 */

import {useMemo} from 'react';
import {useChart} from './ChartContext';
import {isBandScale} from './utils';
import type {ScaleLinear, ScaleTime} from 'd3-scale';

export interface XDSChartAxisProps {
  /** Which edge to render the axis on */
  position: 'top' | 'right' | 'bottom' | 'left';
  /** Number of ticks (approximate — d3 decides final count) */
  tickCount?: number;
  /** Custom tick formatter */
  tickFormat?: (value: unknown) => string;
  /** Enable smooth transitions for streaming (default: true) */
  animated?: boolean;
}

/**
 * Chart axis. Renders tick marks and labels for the x or y dimension.
 * Ticks transition smoothly when the scale domain shifts (e.g. streaming).
 *
 * @example
 * ```
 * <XDSChartAxis position="bottom" />
 * <XDSChartAxis position="left" tickCount={5} />
 * ```
 */
export function XDSChartAxis({
  position,
  tickCount = 5,
  tickFormat,
  animated = true,
}: XDSChartAxisProps) {
  const {width, height, xScale, yScale} = useChart();

  const isHorizontal = position === 'top' || position === 'bottom';
  const scale = isHorizontal ? xScale : yScale;

  const ticks = useMemo(() => {
    if (isBandScale(scale)) {
      return scale.domain().map(d => ({
        value: d,
        offset: (scale(d) ?? 0) + scale.bandwidth() / 2,
      }));
    }
    const linearScale = scale as
      | ScaleLinear<number, number>
      | ScaleTime<number, number>;
    return linearScale.ticks(tickCount).map(d => ({
      value: d,
      offset: linearScale(d as number & Date),
    }));
  }, [scale, tickCount]);

  const transform =
    position === 'bottom'
      ? `translate(0,${height})`
      : position === 'right'
        ? `translate(${width},0)`
        : undefined;

  const format = tickFormat ?? String;
  const tickSize = 6;

  // Transition style for smooth tick movement during streaming
  const tickTransition = animated
    ? 'transform 150ms linear, opacity 150ms ease'
    : undefined;

  return (
    <g transform={transform}>
      {/* Axis line */}
      <line
        x1={isHorizontal ? 0 : 0}
        x2={isHorizontal ? width : 0}
        y1={isHorizontal ? 0 : 0}
        y2={isHorizontal ? 0 : height}
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
