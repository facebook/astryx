/**
 * @file XDSChartZoom.tsx
 * @output Scroll/pinch zoom + drag pan with optional toolbar.
 * @position Child of XDSChart; modifies x/yDomain via callbacks
 *
 * Zoom is aspect-ratio-normalized: both axes scale by the same visual
 * factor regardless of their domain ranges. Reset button restores
 * the initial domains captured on mount.
 */

import {useCallback, useRef, useState, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {useChart} from './ChartContext';
import {isBandScale} from './utils';
import type {ScaleLinear} from 'd3-scale';

/** Toolbar position relative to the chart */
export type ZoomToolbarPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

export interface XDSChartZoomProps {
  onXDomainChange?: (domain: [number, number]) => void;
  onYDomainChange?: (domain: [number, number]) => void;

  /**
   * Zoom speed factor per scroll tick. Higher = faster zoom.
   * @default 0.1
   */
  zoomSpeed?: number;

  /** Only zoom/pan the x-axis */
  xOnly?: boolean;
  /** Only zoom/pan the y-axis */
  yOnly?: boolean;

  /**
   * Show the zoom/pan toolbar.
   * Pass `false` to hide, or a position string to show at that corner.
   * @default 'top-right'
   */
  toolbar?: false | ZoomToolbarPosition;
}

// SVG icon paths (16x16 viewBox)
const ICON_ZOOM_IN = 'M8 3v10M3 8h10'; // plus
const ICON_ZOOM_OUT = 'M3 8h10'; // minus
const ICON_PAN =
  'M8 2v12M2 8h12M5 5l3-3 3 3M5 11l3 3 3-3M2 5l-0 3 0 3M14 5l0 3 0 3'; // move arrows
const ICON_RESET = 'M2 8a6 6 0 1 1 1.5 4M2 12V8h4'; // circular arrow

function ToolbarIcon({d, size = 16}: {d: string; size?: number}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function XDSChartZoom({
  onXDomainChange,
  onYDomainChange,
  zoomSpeed = 0.1,
  xOnly = false,
  yOnly = false,
  toolbar = 'top-right',
}: XDSChartZoomProps) {
  const {width, height, xScale, yScale, svgRef} = useChart();
  const [panMode, setPanMode] = useState(false);

  // Capture initial domains on mount for reset
  const initialDomainsRef = useRef<{
    x: [number, number] | null;
    y: [number, number];
  } | null>(null);

  useEffect(() => {
    if (initialDomainsRef.current) return; // only capture once
    const xDomain = isBandScale(xScale)
      ? null
      : ((xScale as ScaleLinear<number, number>).domain() as [number, number]);
    const yDomain = yScale.domain() as [number, number];
    initialDomainsRef.current = {x: xDomain, y: yDomain};
  }, [xScale, yScale]);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    xDomain: [number, number];
    yDomain: [number, number];
  } | null>(null);

  const pointersRef = useRef<Map<number, {x: number; y: number}>>(new Map());
  const pinchRef = useRef<{
    dist: number;
    xDomain: [number, number];
    yDomain: [number, number];
  } | null>(null);

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

  // Zoom a single axis around a pivot point by a factor.
  // factor > 1 = zoom out, factor < 1 = zoom in.
  const zoomAxis = useCallback(
    (
      domain: [number, number],
      factor: number,
      pivot: number,
    ): [number, number] => {
      const [lo, hi] = domain;
      const range = hi - lo;
      const leftRatio = (pivot - lo) / range;
      const newRange = range * factor;
      return [pivot - newRange * leftRatio, pivot + newRange * (1 - leftRatio)];
    },
    [],
  );

  const zoomBy = useCallback(
    (factor: number, pivotX?: number, pivotY?: number) => {
      if (!yOnly && !isBandScale(xScale)) {
        const linear = xScale as ScaleLinear<number, number>;
        const [xMin, xMax] = linear.domain() as [number, number];
        const xPivot =
          pivotX != null ? linear.invert(pivotX) : (xMin + xMax) / 2;
        onXDomainChange?.(zoomAxis([xMin, xMax], factor, xPivot));
      }
      if (!xOnly) {
        const [yMin, yMax] = yScale.domain() as [number, number];
        const yPivot =
          pivotY != null ? yScale.invert(pivotY) : (yMin + yMax) / 2;
        onYDomainChange?.(zoomAxis([yMin, yMax], factor, yPivot));
      }
    },
    [xScale, yScale, onXDomainChange, onYDomainChange, xOnly, yOnly, zoomAxis],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGRectElement>) => {
      e.preventDefault();

      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const local = pt.matrixTransform(
        e.currentTarget.getScreenCTM()?.inverse(),
      );

      // Clamp delta to prevent trackpad acceleration from blowing out the domain.
      // A single tick should zoom by at most zoomSpeed (10% default).
      const clampedDelta =
        Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 50);
      const rawFactor = 1 + (clampedDelta / 50) * zoomSpeed;

      // Apply per-axis, normalizing by each axis's pixel-to-domain ratio
      // so both axes zoom at the same visual rate.
      if (!yOnly && !isBandScale(xScale)) {
        const linear = xScale as ScaleLinear<number, number>;
        const [xMin, xMax] = linear.domain() as [number, number];
        const xPivot = linear.invert(local.x);
        onXDomainChange?.(zoomAxis([xMin, xMax], rawFactor, xPivot));
      }

      if (!xOnly) {
        const [yMin, yMax] = yScale.domain() as [number, number];
        const yPivot = yScale.invert(local.y);
        onYDomainChange?.(zoomAxis([yMin, yMax], rawFactor, yPivot));
      }
    },
    [
      zoomSpeed,
      xScale,
      yScale,
      onXDomainChange,
      onYDomainChange,
      xOnly,
      yOnly,
      zoomAxis,
    ],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      (e.target as Element).setPointerCapture(e.pointerId);
      e.preventDefault(); // prevent selection on touch
      pointersRef.current.set(e.pointerId, {x: e.clientX, y: e.clientY});

      if (pointersRef.current.size === 2) {
        const pts = [...pointersRef.current.values()];
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        pinchRef.current = {
          dist,
          xDomain: getXDomain(),
          yDomain: yScale.domain() as [number, number],
        };
        dragRef.current = null;
      } else if (pointersRef.current.size === 1 && panMode) {
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
    const init = initialDomainsRef.current;
    if (!init) return;
    if (init.x) onXDomainChange?.(init.x);
    onYDomainChange?.(init.y);
  }, [onXDomainChange, onYDomainChange]);

  // Toolbar portal target
  const portalTarget = svgRef.current?.parentElement;

  // Toolbar position styles
  const toolbarPositionStyle = (
    pos: ZoomToolbarPosition,
  ): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      zIndex: 1,
    };
    switch (pos) {
      case 'top-right':
        return {...base, top: 8, right: 8};
      case 'top-left':
        return {...base, top: 8, left: 8};
      case 'bottom-right':
        return {...base, bottom: 8, right: 8};
      case 'bottom-left':
        return {...base, bottom: 8, left: 8};
    }
  };

  const btnStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    background: 'var(--color-background-popover)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  };

  const activeBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: 'var(--color-accent-muted)',
    borderColor: 'var(--color-accent)',
  };

  return (
    <>
      <g>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          style={
            {
              cursor: panMode ? 'grab' : 'default',
              touchAction: 'none',
              userSelect: 'none',
            } as React.CSSProperties
          }
          onWheel={handleWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </g>

      {/* Toolbar — portaled to chart container for proper positioning */}
      {toolbar &&
        portalTarget &&
        createPortal(
          <div style={toolbarPositionStyle(toolbar)}>
            <button
              style={btnStyle}
              onClick={() => zoomBy(1 / (1 + zoomSpeed))}
              title="Zoom in"
              type="button">
              <ToolbarIcon d={ICON_ZOOM_IN} />
            </button>
            <button
              style={btnStyle}
              onClick={() => zoomBy(1 + zoomSpeed)}
              title="Zoom out"
              type="button">
              <ToolbarIcon d={ICON_ZOOM_OUT} />
            </button>
            <button
              style={panMode ? activeBtnStyle : btnStyle}
              onClick={() => setPanMode(!panMode)}
              title={panMode ? 'Disable pan' : 'Enable pan'}
              type="button">
              <ToolbarIcon d={ICON_PAN} />
            </button>
            <button
              style={btnStyle}
              onClick={handleReset}
              title="Reset zoom"
              type="button">
              <ToolbarIcon d={ICON_RESET} />
            </button>
          </div>,
          portalTarget,
        )}
    </>
  );
}
