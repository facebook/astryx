// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartSelect.tsx
 * @output Click/tap to select data points. Pointer events.
 */

import {useCallback} from 'react';
import {useChart} from './ChartContext';
import {xPixel} from './utils';

export interface ChartSelectProps {
  onSelect?: (datum: Record<string, unknown>, index: number) => void;
  onSelectionChange?: (indices: number[]) => void;
  selected?: number[];
  color?: string;
  radius?: number;
}

export function ChartSelect({
  onSelect,
  onSelectionChange,
  selected = [],
  color = 'var(--color-accent)',
  radius = 6,
}: ChartSelectProps) {
  const {width, height, data, xKey, xScale, yScale} = useChart();

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) {
        return;
      }
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const local = pt.matrixTransform(
        e.currentTarget.getScreenCTM()?.inverse(),
      );

      let closest = 0,
        minDist = Infinity;
      data.forEach((d, i) => {
        const px = xPixel(d, xKey, xScale);
        const numKeys = Object.keys(d).filter(
          k => k !== xKey && typeof d[k] === 'number',
        );
        const py = numKeys.length > 0 ? yScale(d[numKeys[0]] as number) : 0;
        const dist = Math.hypot(px - local.x, py - local.y);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      if (minDist > 30) {
        return;
      }
      onSelect?.(data[closest], closest);
      if (onSelectionChange) {
        if (e.shiftKey || e.metaKey) {
          onSelectionChange(
            selected.includes(closest)
              ? selected.filter(i => i !== closest)
              : [...selected, closest],
          );
        } else {
          onSelectionChange([closest]);
        }
      }
    },
    [data, xKey, xScale, yScale, selected, onSelect, onSelectionChange],
  );

  return (
    <g>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        style={{cursor: 'pointer'}}
        onPointerUp={handlePointerUp}
      />
      {selected.map(idx => {
        if (idx < 0 || idx >= data.length) {
          return null;
        }
        const d = data[idx];
        const px = xPixel(d, xKey, xScale);
        const yKey = Object.keys(d).find(
          k => k !== xKey && typeof d[k] === 'number',
        );
        const py = yKey ? yScale(d[yKey] as number) : 0;
        return (
          <circle
            key={idx}
            cx={px}
            cy={py}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={2}
            pointerEvents="none"
          />
        );
      })}
    </g>
  );
}
