// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThreeDGrid.tsx
 * @output 3D wireframe grid on the floor plane (y=0)
 */

import {useMemo} from 'react';
import {use3D} from './ThreeDContext';

export interface ThreeDGridProps {
  divisions?: number;
}

export function ThreeDGrid({divisions = 5}: ThreeDGridProps) {
  const {project} = use3D();

  const lines = useMemo(() => {
    const result: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      depth: number;
    }[] = [];
    for (let i = 0; i <= divisions; i++) {
      const t = i / divisions;
      // X-parallel lines (along z)
      const a = project(t, 0, 0);
      const b = project(t, 0, 1);
      result.push({
        x1: a.px,
        y1: a.py,
        x2: b.px,
        y2: b.py,
        depth: (a.depth + b.depth) / 2,
      });
      // Z-parallel lines (along x)
      const c = project(0, 0, t);
      const d = project(1, 0, t);
      result.push({
        x1: c.px,
        y1: c.py,
        x2: d.px,
        y2: d.py,
        depth: (c.depth + d.depth) / 2,
      });
    }
    return result.sort((a, b) => a.depth - b.depth);
  }, [project, divisions]);

  return (
    <g>
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="var(--color-border)"
          strokeOpacity={0.3}
          strokeWidth={1}
        />
      ))}
    </g>
  );
}
