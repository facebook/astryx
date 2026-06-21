// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartReferenceLine.tsx
 * @output Horizontal or vertical reference line with crosshair-style badge label
 */

import {useChart} from './ChartContext';
import {isBandScale} from './utils';
import type {ScaleLinear} from 'd3-scale';

export interface ChartReferenceLineProps {
  y?: number;
  x?: number;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  label?: string;
  labelPosition?: 'start' | 'end';
}

export function ChartReferenceLine({
  y, x, color = 'var(--color-border-emphasized)',
  strokeWidth = 1, strokeDasharray = '6 3', label, labelPosition = 'end',
}: ChartReferenceLineProps) {
  const {width, height, xScale, yScale} = useChart();

  // Shared badge dimensions — matches crosshair label style
  const badgeH = 14;
  const badgeRx = 3;
  const fontSize = 10;

  if (y != null) {
    const py = yScale(y);
    const textW = label ? label.length * 5.5 + 8 : 0;
    const bx = labelPosition === 'end' ? width - textW - 2 : 2;
    return (
      <g>
        <line x1={0} x2={width} y1={py} y2={py}
          stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
        {label && (
          <g transform={`translate(${bx},${py})`} pointerEvents="none">
            <rect x={0} y={-badgeH / 2} width={textW} height={badgeH} rx={badgeRx}
              fill="var(--color-background-popover)" fillOpacity={0.85}
              stroke={color} strokeWidth={0.5} />
            <text x={textW / 2} dy="0.35em" textAnchor="middle"
              fontSize={fontSize} fontWeight={500} fill={color}>{label}</text>
          </g>
        )}
      </g>
    );
  }

  if (x != null && !isBandScale(xScale)) {
    const px = (xScale as ScaleLinear<number, number>)(x);
    const textW = label ? label.length * 5.5 + 8 : 0;
    const by = labelPosition === 'end' ? 4 : height - badgeH - 4;
    return (
      <g>
        <line x1={px} x2={px} y1={0} y2={height}
          stroke={color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
        {label && (
          <g transform={`translate(${px - textW / 2},${by})`} pointerEvents="none">
            <rect x={0} y={0} width={textW} height={badgeH} rx={badgeRx}
              fill="var(--color-background-popover)" fillOpacity={0.85}
              stroke={color} strokeWidth={0.5} />
            <text x={textW / 2} y={badgeH / 2} dy="0.35em" textAnchor="middle"
              fontSize={fontSize} fontWeight={500} fill={color}>{label}</text>
          </g>
        )}
      </g>
    );
  }

  return null;
}
