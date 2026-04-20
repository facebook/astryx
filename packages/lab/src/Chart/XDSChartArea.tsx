/**
 * @file XDSChartArea.tsx
 * @output Renders a filled area under a line down to baseline (zero or stacked bottom)
 * @position Child of XDSChart; reads scales from context
 */

import {useMemo, useId} from 'react';
import {area, curveLinear, curveMonotoneX, curveNatural, curveStep} from 'd3-shape';
import {useChart} from './ChartContext';
import {useStack} from './useStack';
import {xPixel} from './utils';

const CURVES = {
  linear: curveLinear,
  monotone: curveMonotoneX,
  natural: curveNatural,
  step: curveStep,
} as const;

export interface XDSChartAreaProps {
  /** Data key for the y values */
  dataKey: string;
  /** Fill color */
  color: string;
  /** Fill opacity (default: 0.3) */
  opacity?: number;
  /** Curve interpolation */
  curve?: 'linear' | 'monotone' | 'natural' | 'step';
  /** Stack group ID — areas with same stack build on each other */
  stack?: string;
  /** Gradient fill from color to transparent at baseline */
  gradient?: boolean;
  /** Show the top edge as a stroke line */
  stroke?: boolean;
  /** Stroke width (default: 2) */
  strokeWidth?: number;
}

/**
 * Area mark — filled region from data values down to baseline.
 * Supports stacking (via `stack` prop) and gradient fills.
 *
 * @example
 * ```
 * <XDSChartArea dataKey="revenue" color="#3b82f6" gradient />
 * <XDSChartArea dataKey="costs" color="#ef4444" stack="totals" />
 * ```
 */
export function XDSChartArea({
  dataKey,
  color,
  opacity = 0.3,
  curve = 'monotone',
  stack: stackGroup,
  gradient = false,
  stroke = false,
  strokeWidth = 2,
}: XDSChartAreaProps) {
  const {data, xKey, xScale, yScale} = useChart();
  const {y0, y1} = useStack(stackGroup, dataKey);
  const gradientId = useId();

  const curveFactory = CURVES[curve];

  const pathD = useMemo(() => {
    const generator = area<number>()
      .x(i => xPixel(data[i], xKey, xScale))
      .y0(i => y0(i))
      .y1(i => y1(i))
      .curve(curveFactory);

    const indices = data.map((_, i) => i);
    return generator(indices) ?? '';
  }, [data, xKey, xScale, y0, y1, curveFactory]);

  if (!pathD) return null;

  const fill = gradient ? `url(#${gradientId})` : color;

  return (
    <g>
      {gradient && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      <path
        d={pathD}
        fill={fill}
        fillOpacity={gradient ? 1 : opacity}
        stroke="none"
      />
      {stroke && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          clipPath="none"
        />
      )}
    </g>
  );
}
