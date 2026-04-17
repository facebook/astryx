/**
 * @file XDS3DScatter.tsx
 * @output 3D scatter plot — projected circles with depth-based sizing/opacity
 */

import {useMemo} from 'react';
import {use3D} from './ThreeDContext';

export interface XDS3DScatterProps {
  color: string;
  radius?: number;
  opacity?: number;
}

export function XDS3DScatter({
  color,
  radius = 4,
  opacity = 0.8,
}: XDS3DScatterProps) {
  const {
    data,
    xKey,
    yKey,
    zKey,
    project,
    xDomain,
    yDomain,
    zDomain,
    normalize,
  } = use3D();

  const points = useMemo(() => {
    return data
      .map((d, i) => {
        const nx = normalize(d[xKey] as number, xDomain);
        const ny = normalize(d[yKey] as number, yDomain);
        const nz = normalize(d[zKey] as number, zDomain);
        const {px, py, depth} = project(nx, ny, nz);
        return {px, py, depth, index: i};
      })
      .sort((a, b) => a.depth - b.depth); // painter's algorithm
  }, [data, xKey, yKey, zKey, project, xDomain, yDomain, zDomain, normalize]);

  return (
    <g>
      {points.map(p => {
        const depthFactor = 0.5 + (p.depth + 0.5) * 0.5; // 0.5-1.0
        return (
          <circle
            key={p.index}
            cx={p.px}
            cy={p.py}
            r={radius * depthFactor}
            fill={color}
            fillOpacity={opacity * depthFactor}
          />
        );
      })}
    </g>
  );
}
