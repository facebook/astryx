// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThreeDBar.tsx
 * @output 3D bar chart — projected rectangles with depth shading
 */

import {useMemo} from 'react';
import {use3D} from './ThreeDContext';

export interface ThreeDBarProps {
  color: string;
  barWidth?: number;
  barDepth?: number;
}

export function ThreeDBar({
  color,
  barWidth = 0.06,
  barDepth = 0.06,
}: ThreeDBarProps) {
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

  const bars = useMemo(() => {
    return data
      .map((d, i) => {
        const nx = normalize(d[xKey] as number, xDomain);
        const ny = normalize(d[yKey] as number, yDomain);
        const nz = normalize(d[zKey] as number, zDomain);
        const hw = barWidth / 2;
        const hd = barDepth / 2;

        // Bar goes from y=0 to y=ny
        // Four top corners of the bar
        const topFL = project(nx - hw, ny, nz - hd); // front-left
        const topFR = project(nx + hw, ny, nz - hd); // front-right
        const topBL = project(nx - hw, ny, nz + hd); // back-left
        const topBR = project(nx + hw, ny, nz + hd); // back-right

        // Four bottom corners (y=0)
        const botFL = project(nx - hw, 0, nz - hd);
        const botFR = project(nx + hw, 0, nz - hd);
        const botBL = project(nx - hw, 0, nz + hd);
        const botBR = project(nx + hw, 0, nz + hd);

        // Average depth for sorting
        const avgDepth =
          (topFL.depth + topBR.depth + botFL.depth + botBR.depth) / 4;

        return {
          topFL,
          topFR,
          topBL,
          topBR,
          botFL,
          botFR,
          botBL,
          botBR,
          avgDepth,
          index: i,
          ny,
        };
      })
      .sort((a, b) => a.avgDepth - b.avgDepth);
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
    barWidth,
    barDepth,
  ]);

  return (
    <g>
      {bars.map(b => {
        const face = (pts: {px: number; py: number}[], _shade: number) =>
          pts.map(p => `${p.px},${p.py}`).join(' ');

        // Front face
        const front = [b.botFL, b.botFR, b.topFR, b.topFL];
        // Right face
        const right = [b.botFR, b.botBR, b.topBR, b.topFR];
        // Top face
        const top = [b.topFL, b.topFR, b.topBR, b.topBL];

        return (
          <g key={b.index}>
            <polygon
              points={face(front, 0)}
              fill={color}
              fillOpacity={0.9}
              stroke={color}
              strokeWidth={0.5}
            />
            <polygon
              points={face(right, 0)}
              fill={color}
              fillOpacity={0.7}
              stroke={color}
              strokeWidth={0.5}
            />
            <polygon
              points={face(top, 0)}
              fill={color}
              fillOpacity={1}
              stroke={color}
              strokeWidth={0.5}
            />
          </g>
        );
      })}
    </g>
  );
}
