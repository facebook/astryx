/**
 * @file XDSChartDot.tsx
 * @output Renders scatter dots for a data key
 * @position Child of XDSChart; reads scales from context
 *
 * Supports two modes:
 * 1. Scale-derived: positions computed from dataKey + scales (default)
 * 2. Pre-resolved: positions read from pxKey/pyKey fields in data
 *    (use when a data transform like dodge has computed pixel positions)
 */

import {useChart} from './ChartContext';
import {xPixel} from './utils';

export interface XDSChartDotProps {
  /** Which data key for the y values (used for scale-derived positioning) */
  dataKey: string;
  /** Dot fill color — string or function of (datum, index) */
  color: string | ((datum: Record<string, unknown>, index: number) => string);
  /** Dot radius (default: 4) */
  radius?: number;
  /** Opacity (default: 0.8) */
  opacity?: number;
  /**
   * Data key for pre-resolved x pixel positions.
   * When set, bypasses xScale and reads px directly from data.
   */
  pxKey?: string;
  /**
   * Data key for pre-resolved y pixel positions.
   * When set, bypasses yScale and reads py directly from data.
   */
  pyKey?: string;
}

/**
 * Scatter dot marks.
 *
 * For pre-computed layouts (dodge, force, jitter), pass positions via
 * pxKey/pyKey so tooltip and other interactions can read the same data.
 *
 * @example
 * ```
 * // Scale-derived (default)
 * <XDSChartDot dataKey="revenue" color="#3b82f6" />
 *
 * // Pre-resolved positions (e.g. after dodge transform)
 * <XDSChartDot dataKey="mass" pxKey="_px" pyKey="_py" color={(d) => colorBySex(d)} />
 * ```
 */
export function XDSChartDot({
  dataKey,
  color,
  radius = 4,
  opacity = 0.8,
  pxKey,
  pyKey,
}: XDSChartDotProps) {
  const {data, xKey, xScale, yScale} = useChart();

  return (
    <g>
      {data.map((d, i) => {
        const cx =
          pxKey != null && typeof d[pxKey] === 'number'
            ? (d[pxKey] as number)
            : xPixel(d, xKey, xScale);
        const cy =
          pyKey != null && typeof d[pyKey] === 'number'
            ? (d[pyKey] as number)
            : yScale(
                typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0,
              );
        const fill = typeof color === 'function' ? color(d, i) : color;

        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill={fill}
            opacity={opacity}
          />
        );
      })}
    </g>
  );
}
