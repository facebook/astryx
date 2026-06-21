// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThreeDSurface.tsx
 * @output 3D surface mesh — projected triangulated grid with color mapping
 */

import {useMemo} from 'react';
import {use3D} from './ThreeDContext';

export interface ThreeDSurfaceProps {
  /**
   * Color ramp for surface height — low to high.
   * Use useChartColors().sequential.blue(5).
   */
  colorRange: string[];
  opacity?: number;
  wireframe?: boolean;
}

function lerpColor(colors: string[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  if (colors.length === 1) {
    return colors[0];
  }
  const scaled = clamped * (colors.length - 1);
  const lo = Math.floor(scaled);
  const hi = Math.min(lo + 1, colors.length - 1);
  // Simple: just return the nearest
  return scaled - lo < 0.5 ? colors[lo] : colors[hi];
}

/**
 * 3D surface mesh. Data should be a grid of points with x, y (height), z.
 * Points are triangulated in order and colored by y-value.
 */
export function ThreeDSurface({
  colorRange,
  opacity = 0.8,
  wireframe = false,
}: ThreeDSurfaceProps) {
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

  const faces = useMemo(() => {
    // Detect grid dimensions from unique x and z values
    const xVals = [...new Set(data.map(d => d[xKey] as number))].sort(
      (a, b) => a - b,
    );
    const zVals = [...new Set(data.map(d => d[zKey] as number))].sort(
      (a, b) => a - b,
    );
    const cols = xVals.length;
    const rows = zVals.length;

    if (cols < 2 || rows < 2) {
      return [];
    }

    // Build lookup grid
    const grid = new Map<string, Record<string, unknown>>();
    for (const d of data) {
      grid.set(`${d[xKey]},${d[zKey]}`, d);
    }

    const result: {points: string; color: string; depth: number}[] = [];

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const corners = [
          grid.get(`${xVals[c]},${zVals[r]}`),
          grid.get(`${xVals[c + 1]},${zVals[r]}`),
          grid.get(`${xVals[c + 1]},${zVals[r + 1]}`),
          grid.get(`${xVals[c]},${zVals[r + 1]}`),
        ];

        if (corners.some(c => !c)) {
          continue;
        }

        const validCorners = corners.filter(
          (c): c is Record<string, unknown> => c != null,
        );

        const projected = validCorners.map(d => {
          const nx = normalize(d[xKey] as number, xDomain);
          const ny = normalize(d[yKey] as number, yDomain);
          const nz = normalize(d[zKey] as number, zDomain);
          return {...project(nx, ny, nz), ny};
        });

        const avgY = projected.reduce((s, p) => s + p.ny, 0) / 4;
        const avgDepth = projected.reduce((s, p) => s + p.depth, 0) / 4;
        const color = lerpColor(colorRange, avgY);

        result.push({
          points: projected.map(p => `${p.px},${p.py}`).join(' '),
          color,
          depth: avgDepth,
        });
      }
    }

    return result.sort((a, b) => a.depth - b.depth);
  }, [
    data,
    xKey,
    yKey,
    zKey,
    project,
    xDomain,
    yDomain,
    zDomain,
    normalize,
    colorRange,
  ]);

  return (
    <g>
      {faces.map((f, i) => (
        <polygon
          key={i}
          points={f.points}
          fill={wireframe ? 'none' : f.color}
          fillOpacity={opacity}
          stroke={wireframe ? f.color : f.color}
          strokeWidth={wireframe ? 1 : 0.5}
          strokeOpacity={wireframe ? 0.8 : 0.3}
        />
      ))}
    </g>
  );
}
