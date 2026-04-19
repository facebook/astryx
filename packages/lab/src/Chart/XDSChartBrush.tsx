/**
 * @file XDSChartBrush.tsx
 * @output Drag to select an x-range. Pointer events (mouse + touch + pen).
 */

import {useState, useCallback, useRef, useEffect} from 'react';
import {useChart} from './ChartContext';
import {isBandScale} from './utils';
import type {ScaleLinear} from 'd3-scale';

export interface XDSChartBrushProps {
  onBrush?: (range: [number, number], data: Record<string, unknown>[]) => void;
  onClear?: () => void;
  color?: string;
  opacity?: number;
}

function localX(e: React.PointerEvent<SVGRectElement>): number {
  const svg = e.currentTarget.ownerSVGElement;
  if (!svg) return 0;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  return pt.matrixTransform(e.currentTarget.getScreenCTM()?.inverse()).x;
}

export function XDSChartBrush({
  onBrush,
  onClear,
  color = 'var(--color-accent)',
  opacity = 0.15,
}: XDSChartBrushProps) {
  const {width, height, data, xKey, xScale} = useChart();
  const [brush, setBrush] = useState<{x0: number; x1: number} | null>(null);
  const dragging = useRef(false);

  const startXRef = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragging.current = true;
    const x = localX(e);
    startXRef.current = x;
    setBrush({x0: x, x1: x});
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    if (!dragging.current) return;
    const x = localX(e);
    setBrush({
      x0: Math.min(startXRef.current, x),
      x1: Math.max(startXRef.current, x),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    if (!brush || Math.abs(brush.x1 - brush.x0) < 3) {
      setBrush(null);
      onClear?.();
      return;
    }
    if (!isBandScale(xScale)) {
      const linear = xScale as ScaleLinear<number, number>;
      const min = linear.invert(brush.x0);
      const max = linear.invert(brush.x1);
      const selected = data.filter(d => {
        const v = d[xKey];
        return typeof v === 'number' && v >= min && v <= max;
      });
      onBrush?.([min, max], selected);
    }
  }, [brush, xScale, data, xKey, onBrush, onClear]);

  return (
    <g>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        style={{cursor: 'crosshair'}}
        onTouchStart={e => e.preventDefault()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {brush && Math.abs(brush.x1 - brush.x0) > 1 && (
        <rect
          x={brush.x0}
          y={0}
          width={brush.x1 - brush.x0}
          height={height}
          fill={color}
          fillOpacity={opacity}
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.4}
          pointerEvents="none"
        />
      )}
    </g>
  );
}
