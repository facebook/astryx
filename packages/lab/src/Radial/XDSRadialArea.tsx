/**
 * @file XDSRadialArea.tsx
 * @output Renders a spider/radar polygon for a dataset
 */

import {useMemo} from 'react';
import {useRadial} from './RadialContext';

export interface XDSRadialAreaProps {
  /** Key identifying which dataset row to plot (matches a value in data) */
  dataKey: string;
  /** Fill color */
  color: string;
  /** Fill opacity (default: 0.2) */
  opacity?: number;
  /** Stroke width (default: 2) */
  strokeWidth?: number;
  /** Show dots at vertices */
  dots?: boolean;
  /** Dot radius */
  dotRadius?: number;
}

/**
 * Spider/radar polygon. Reads axis definitions and scales from radial context.
 * Each axis value is normalized to [0,1] within its domain, then mapped to radius.
 *
 * @example
 * ```
 * <XDSRadialArea dataKey="modelA" color={colors[0]} dots />
 * ```
 */
export function XDSRadialArea({
  dataKey,
  color,
  opacity = 0.2,
  strokeWidth = 2,
  dots = false,
  dotRadius = 4,
}: XDSRadialAreaProps) {
  const {cx, cy, data, axes, angleByAxis, radiusScale, axisDomains} =
    useRadial();

  const points = useMemo(() => {
    if (!axes || !angleByAxis || !radiusScale || !axisDomains) return [];

    // Find the data row matching this key
    // dataKey matches a value in the first non-axis field, or we use the index
    const datum =
      data.find(d => {
        // Check if any string field matches dataKey
        return Object.values(d).some(v => v === dataKey);
      }) ?? data[0];

    if (!datum) return [];

    return axes.map(key => {
      const angle = angleByAxis.get(key)!;
      const domain = axisDomains.get(key)!;
      const raw = typeof datum[key] === 'number' ? (datum[key] as number) : 0;
      const [min, max] = domain;
      const t = max > min ? (raw - min) / (max - min) : 0;
      const r = radiusScale(Math.max(0, Math.min(1, t)));
      return {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        key,
      };
    });
  }, [cx, cy, data, dataKey, axes, angleByAxis, radiusScale, axisDomains]);

  if (points.length === 0) return null;

  const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <g>
      <polygon
        points={pathPoints}
        fill={color}
        fillOpacity={opacity}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {dots &&
        points.map(p => (
          <circle key={p.key} cx={p.x} cy={p.y} r={dotRadius} fill={color} />
        ))}
    </g>
  );
}
