/**
 * @file XDSChartArea.tsx
 * @output Renders a filled area between two y-bounds — confidence intervals, bands, ranges
 * @position Child of XDSChart; reads scales from context
 */

import {useMemo} from 'react';
import {area, curveMonotoneX} from 'd3-shape';
import {useChart} from './ChartContext';
import type {ScaleBand} from 'd3-scale';

export interface XDSChartAreaProps {
  /** Data key for the upper bound. If omitted, uses `baseline`. */
  yUpper?: string;
  /** Data key for the lower bound. If omitted, uses `baseline`. */
  yLower?: string;
  /**
   * Fallback data key when only one bound is specified.
   * Acts as the other edge of the band.
   */
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

function isBandScale(scale: unknown): scale is ScaleBand<string> {
  return typeof scale === 'function' && 'bandwidth' in scale;
}

/**
 * Area band between two y-values. Use for confidence intervals, error ranges,
 * or any min/max band around a line.
 *
 * Supports full band (both bounds), upper-only, or lower-only:
 *
 * @example
 * ```
 * // Full band
 * <XDSChartArea yUpper="upper95" yLower="lower95" color={colors[0]} />
 *
 * // Upper confidence only — shades from mean up to upper bound
 * <XDSChartArea yUpper="upper95" baseline="mean" color={colors[0]} />
 *
 * // Lower confidence only — shades from lower bound up to mean
 * <XDSChartArea yLower="lower95" baseline="mean" color={colors[0]} />
 * ```
 */
export function XDSChartArea({
  yUpper,
  yLower,
  baseline,
  color,
  opacity = 0.2,
  stroke = false,
  strokeWidth = 1,
}: XDSChartAreaProps) {
  const {data, xScale, yScale} = useChart();

  // Resolve which keys to use for upper and lower edges
  const upperKey = yUpper ?? baseline;
  const lowerKey = yLower ?? baseline;

  const pathD = useMemo(() => {
    if (!upperKey || !lowerKey) return '';

    const generator = area<Record<string, unknown>>()
      .x(d => {
        if (isBandScale(xScale)) {
          return (
            (xScale(String(Object.values(d)[0])) ?? 0) + xScale.bandwidth() / 2
          );
        }
        return (xScale as (v: number) => number)(Object.values(d)[0] as number);
      })
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
  }, [data, xScale, yScale, upperKey, lowerKey]);

  if (!pathD) return null;

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
