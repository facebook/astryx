// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartBrush.tsx
 * @output Drag-to-select region. Supports x-only or 2D (xy) brush modes.
 * @position Child of Chart; reads scales from context
 */

import React, {useState, useCallback, useRef} from 'react';
import {useChart} from './ChartContext';
import {isBandScale} from './utils';
import type {ScaleLinear} from 'd3-scale';

/**
 * Brush direction mode:
 * - `'x'` — horizontal range selection (default)
 * - `'xy'` — 2D rectangular selection
 */
export type BrushMode = 'x' | 'xy';

export interface BrushRange {
  x: [number, number];
  y?: [number, number];
}

export interface ChartBrushProps {
  /**
   * Brush direction mode.
   * - `'x'` — horizontal selection (default, good for time ranges)
   * - `'xy'` — rectangular 2D selection (good for scatter plots)
   *
   * @default 'x'
   */
  mode?: BrushMode;

  /**
   * Called when the user finishes a brush gesture.
   * Receives the selected range in data coordinates and the matching data points.
   */
  onBrush?: (range: BrushRange, data: Record<string, unknown>[]) => void;

  /**
   * Called when the brush is cleared (click without drag).
   */
  onClear?: () => void;

  /**
   * Brush overlay color.
   * @default 'var(--color-accent)'
   */
  color?: string;

  /**
   * Brush overlay opacity.
   * @default 0.15
   */
  opacity?: number;
}

function localCoords(e: React.PointerEvent<SVGRectElement>): {
  x: number;
  y: number;
} {
  const svg = e.currentTarget.ownerSVGElement;
  if (!svg) {
    return {x: 0, y: 0};
  }
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const local = pt.matrixTransform(e.currentTarget.getScreenCTM()?.inverse());
  return {x: local.x, y: local.y};
}

/**
 * Brush interaction for range selection.
 *
 * @example
 * ```tsx
 * // X-only (default)
 * <ChartBrush onBrush={({x}) => setZoom(x)} />
 *
 * // 2D rectangular
 * <ChartBrush mode="xy" onBrush={({x, y}, points) => setSelected(points)} />
 * ```
 */
export function ChartBrush({
  mode = 'x',
  onBrush,
  onClear,
  color = 'var(--color-accent)',
  opacity = 0.15,
}: ChartBrushProps) {
  const {width, height, data, xKey, xScale, yScale} = useChart();
  const [brush, setBrush] = useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
  const dragging = useRef(false);
  const startRef = useRef({x: 0, y: 0});

  const onPointerDown = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragging.current = true;
    const {x, y} = localCoords(e);
    startRef.current = {x, y};
    setBrush({x0: x, y0: y, x1: x, y1: y});
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      if (!dragging.current) {
        return;
      }
      const {x, y} = localCoords(e);
      const {x: sx, y: sy} = startRef.current;

      if (mode === 'x') {
        setBrush({
          x0: Math.min(sx, x),
          y0: 0,
          x1: Math.max(sx, x),
          y1: height,
        });
      } else {
        setBrush({
          x0: Math.min(sx, x),
          y0: Math.min(sy, y),
          x1: Math.max(sx, x),
          y1: Math.max(sy, y),
        });
      }
    },
    [mode, height],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    if (!brush) {
      return;
    }

    const dx = Math.abs(brush.x1 - brush.x0);
    const dy = Math.abs(brush.y1 - brush.y0);

    // Too small — treat as click (clear)
    if (dx < 3 && (mode === 'x' || dy < 3)) {
      setBrush(null);
      onClear?.();
      return;
    }

    if (isBandScale(xScale)) {
      // Band scale — can't invert meaningfully for range
      setBrush(null);
      return;
    }

    const linear = xScale as ScaleLinear<number, number>;
    const xMin = linear.invert(brush.x0);
    const xMax = linear.invert(brush.x1);

    const range: BrushRange = {x: [xMin, xMax]};

    let selected: Record<string, unknown>[];

    if (mode === 'xy') {
      const yMin = yScale.invert(brush.y1); // y is inverted (top=0)
      const yMax = yScale.invert(brush.y0);
      range.y = [yMin, yMax];

      selected = data.filter(d => {
        const xv = d[xKey];
        if (typeof xv !== 'number' || xv < xMin || xv > xMax) {
          return false;
        }
        // Check all numeric values against y range
        return Object.entries(d).some(
          ([k, v]) =>
            k !== xKey && typeof v === 'number' && v >= yMin && v <= yMax,
        );
      });
    } else {
      selected = data.filter(d => {
        const v = d[xKey];
        return typeof v === 'number' && v >= xMin && v <= xMax;
      });
    }

    onBrush?.(range, selected);
  }, [brush, mode, xScale, yScale, data, xKey, onBrush, onClear]);

  const rectX = brush ? brush.x0 : 0;
  const rectY = brush ? brush.y0 : 0;
  const rectW = brush ? brush.x1 - brush.x0 : 0;
  const rectH = brush ? brush.y1 - brush.y0 : 0;

  const brushRectStyle: React.CSSProperties = {
    cursor: 'crosshair',
    touchAction: 'none',
    userSelect: 'none',
  };

  return (
    <g>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        style={brushRectStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {brush && (rectW > 1 || rectH > 1) && (
        <rect
          x={rectX}
          y={rectY}
          width={rectW}
          height={rectH}
          fill={color}
          fillOpacity={opacity}
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.4}
          rx={mode === 'xy' ? 2 : 0}
          pointerEvents="none"
        />
      )}
    </g>
  );
}
