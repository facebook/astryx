/**
 * @file XDSChartZoom.tsx
 * @output Zoom and pan with mouse wheel, pinch, and toolbar chrome.
 */

import {useCallback, useRef, useState} from 'react';
import {useChart} from './ChartContext';
import {isBandScale} from './utils';
import type {ScaleLinear} from 'd3-scale';

export interface XDSChartZoomProps {
  onXDomainChange?: (domain: [number, number]) => void;
  onYDomainChange?: (domain: [number, number]) => void;
  zoomSpeed?: number;
  xOnly?: boolean;
  yOnly?: boolean;
  /** Show zoom/pan toolbar (default: true) */
  chrome?: boolean;
  /** Initial x domain for reset */
  initialXDomain?: [number, number];
  /** Initial y domain for reset */
  initialYDomain?: [number, number];
}

export function XDSChartZoom({
  onXDomainChange,
  onYDomainChange,
  zoomSpeed = 0.1,
  xOnly = false,
  yOnly = false,
  chrome = true,
  initialXDomain,
  initialYDomain,
}: XDSChartZoomProps) {
  const {width, height, xScale, yScale} = useChart();
  const [panMode, setPanMode] = useState(false);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    xDomain: [number, number];
    yDomain: [number, number];
  } | null>(null);
  const pinchRef = useRef<{
    dist: number;
    xDomain: [number, number];
    yDomain: [number, number];
  } | null>(null);
  const pointersRef = useRef<Map<number, {x: number; y: number}>>(new Map());

  const getXDomain = useCallback(
    (): [number, number] =>
      isBandScale(xScale)
        ? [0, 0]
        : ((xScale as ScaleLinear<number, number>).domain() as [
            number,
            number,
          ]),
    [xScale],
  );

  const zoomBy = useCallback(
    (factor: number, pivotX?: number, pivotY?: number) => {
      if (!yOnly && !isBandScale(xScale)) {
        const linear = xScale as ScaleLinear<number, number>;
        const [xMin, xMax] = linear.domain() as [number, number];
        const xRange = xMax - xMin;
        const xPivot =
          pivotX != null ? linear.invert(pivotX) : (xMin + xMax) / 2;
        const leftRatio = (xPivot - xMin) / xRange;
        const newRange = xRange * factor;
        onXDomainChange?.([
          xPivot - newRange * leftRatio,
          xPivot + newRange * (1 - leftRatio),
        ]);
      }
      if (!xOnly) {
        const [yMin, yMax] = yScale.domain() as [number, number];
        const yRange = yMax - yMin;
        const yPivot =
          pivotY != null ? yScale.invert(pivotY) : (yMin + yMax) / 2;
        const topRatio = (yMax - yPivot) / yRange;
        const newRange = yRange * factor;
        onYDomainChange?.([
          yPivot - newRange * (1 - topRatio),
          yPivot + newRange * topRatio,
        ]);
      }
    },
    [xScale, yScale, onXDomainChange, onYDomainChange, xOnly, yOnly],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGRectElement>) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const local = pt.matrixTransform(
        e.currentTarget.getScreenCTM()?.inverse(),
      );
      zoomBy(factor, local.x, local.y);
    },
    [zoomSpeed, zoomBy],
  );

  // Pointer tracking for pan + pinch
  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      (e.target as Element).setPointerCapture(e.pointerId);
      pointersRef.current.set(e.pointerId, {x: e.clientX, y: e.clientY});

      if (pointersRef.current.size === 2) {
        // Start pinch
        const pts = [...pointersRef.current.values()];
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        pinchRef.current = {
          dist,
          xDomain: getXDomain(),
          yDomain: yScale.domain() as [number, number],
        };
        dragRef.current = null;
      } else if (pointersRef.current.size === 1 && panMode) {
        // Start pan
        dragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          xDomain: getXDomain(),
          yDomain: yScale.domain() as [number, number],
        };
      }
    },
    [panMode, getXDomain, yScale],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      pointersRef.current.set(e.pointerId, {x: e.clientX, y: e.clientY});

      if (pointersRef.current.size === 2 && pinchRef.current) {
        // Pinch zoom
        const pts = [...pointersRef.current.values()];
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const ratio = pinchRef.current.dist / dist;
        if (!yOnly && !isBandScale(xScale)) {
          const [xMin, xMax] = pinchRef.current.xDomain;
          const mid = (xMin + xMax) / 2;
          const half = ((xMax - xMin) / 2) * ratio;
          onXDomainChange?.([mid - half, mid + half]);
        }
        if (!xOnly) {
          const [yMin, yMax] = pinchRef.current.yDomain;
          const mid = (yMin + yMax) / 2;
          const half = ((yMax - yMin) / 2) * ratio;
          onYDomainChange?.([mid - half, mid + half]);
        }
      } else if (dragRef.current && panMode) {
        // Pan
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        if (!yOnly && !isBandScale(xScale)) {
          const [xMin, xMax] = dragRef.current.xDomain;
          const xShift = -(dx / width) * (xMax - xMin);
          onXDomainChange?.([xMin + xShift, xMax + xShift]);
        }
        if (!xOnly) {
          const [yMin, yMax] = dragRef.current.yDomain;
          const yShift = (dy / height) * (yMax - yMin);
          onYDomainChange?.([yMin + yShift, yMax + yShift]);
        }
      }
    },
    [
      panMode,
      xScale,
      width,
      height,
      onXDomainChange,
      onYDomainChange,
      xOnly,
      yOnly,
    ],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) dragRef.current = null;
  }, []);

  const handleReset = useCallback(() => {
    if (initialXDomain) onXDomainChange?.(initialXDomain);
    if (initialYDomain) onYDomainChange?.(initialYDomain);
  }, [initialXDomain, initialYDomain, onXDomainChange, onYDomainChange]);

  const btnStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    background: 'var(--color-background-popover)',
    color: 'var(--color-text-primary)',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  };

  return (
    <g>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        style={{
          cursor: panMode ? 'grab' : 'default',
          touchAction: panMode ? 'none' : 'pan-y',
        }}
        onWheel={handleWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      {chrome && (
        <foreignObject
          x={width - 36}
          y={4}
          width={32}
          height={140}
          style={{overflow: 'visible'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <button
              style={btnStyle}
              onClick={() => zoomBy(1 - zoomSpeed)}
              title="Zoom in">
              +
            </button>
            <button
              style={btnStyle}
              onClick={() => zoomBy(1 + zoomSpeed)}
              title="Zoom out">
              &minus;
            </button>
            <button
              style={{
                ...btnStyle,
                background: panMode
                  ? 'var(--color-accent-muted)'
                  : btnStyle.background,
              }}
              onClick={() => setPanMode(!panMode)}
              title={panMode ? 'Disable pan' : 'Enable pan'}>
              &#9995;
            </button>
            <button style={btnStyle} onClick={handleReset} title="Reset zoom">
              &#8634;
            </button>
          </div>
        </foreignObject>
      )}
    </g>
  );
}
