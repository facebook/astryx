/**
 * @file XDSRadialAxis.tsx
 * @output Renders axis labels at each spider vertex
 */

import {useRadial} from './RadialContext';

export interface XDSRadialAxisProps {
  /** Label offset from the outer ring in pixels (default: 16) */
  labelOffset?: number;
}

/**
 * Axis labels positioned at each spider chart vertex.
 *
 * @example
 * ```
 * <XDSRadialAxis />
 * ```
 */
export function XDSRadialAxis({labelOffset = 16}: XDSRadialAxisProps) {
  const {cx, cy, radius, axes, angleByAxis} = useRadial();

  if (!axes || !angleByAxis) return null;

  return (
    <g>
      {axes.map(key => {
        const angle = angleByAxis.get(key)!;
        const x = cx + Math.cos(angle) * (radius + labelOffset);
        const y = cy + Math.sin(angle) * (radius + labelOffset);

        // Determine text anchor based on position
        const isRight = Math.cos(angle) > 0.1;
        const isLeft = Math.cos(angle) < -0.1;
        const anchor = isRight ? 'start' : isLeft ? 'end' : 'middle';

        return (
          <text
            key={key}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="central"
            fill="var(--color-text-secondary)"
            fontSize={12}>
            {key}
          </text>
        );
      })}
    </g>
  );
}
