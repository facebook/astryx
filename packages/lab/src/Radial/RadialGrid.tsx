// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadialGrid.tsx
 * @output Renders concentric grid rings and axis lines for spider charts
 */

import {useRadial} from './RadialContext';

export interface RadialGridProps {
  /** Number of concentric rings (default: 5) */
  rings?: number;
}

/**
 * Concentric grid rings and axis lines for spider charts.
 *
 * @example
 * ```
 * <RadialGrid rings={5} />
 * ```
 */
export function RadialGrid({rings = 5}: RadialGridProps) {
  const {cx, cy, radius, innerRadius, axes, angleByAxis, radiusScale} =
    useRadial();

  if (!axes || !angleByAxis || !radiusScale) {
    return null;
  }

  return (
    <g>
      {/* Concentric rings */}
      {Array.from({length: rings}, (_, i) => {
        const t = (i + 1) / rings;
        const r = radiusScale(t);
        // Draw polygon ring connecting points at this radius
        const points = axes
          .map(key => {
            const angle = angleByAxis.get(key);
            if (angle == null) {
              return '';
            }
            return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
          })
          .filter(Boolean)
          .join(' ');
        return (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="var(--color-border)"
            strokeOpacity={0.3}
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines from center to each vertex */}
      {axes.map(key => {
        const angle = angleByAxis.get(key);
        if (angle == null) {
          return null;
        }
        return (
          <line
            key={key}
            x1={cx + Math.cos(angle) * innerRadius}
            y1={cy + Math.sin(angle) * innerRadius}
            x2={cx + Math.cos(angle) * radius}
            y2={cy + Math.sin(angle) * radius}
            stroke="var(--color-border)"
            strokeOpacity={0.3}
            strokeWidth={1}
          />
        );
      })}
    </g>
  );
}
