/**
 * @file XDSChartTooltip.tsx
 * @output Hover tooltip with optional crosshair lines, rendered in the top layer
 * @position Child of XDSChart; reads scales from context
 *
 * Combines tooltip content and crosshair display into one component.
 * Uses the XDS Layer system (Popover API) so the tooltip renders above
 * all other content — portaled to the chart container div (outside SVG).
 */

'use client';

import {useState, useCallback, useRef, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {useXDSLayer} from '@xds/core/Layer';
import {useChart} from './ChartContext';
import {xPixel} from './utils';
import type {DataPoint} from './types';

/**
 * Crosshair mode:
 * - `'x'` — vertical line only (most common for time series)
 * - `'y'` — horizontal line only
 * - `'xy'` — both axes
 * - `false` — no crosshair lines
 */
export type ChartCrosshairMode = 'x' | 'y' | 'xy' | false;

export interface XDSChartTooltipProps {
  /**
   * Custom render function for tooltip content.
   * Receives the nearest data point and its index.
   * Return `null` to hide the tooltip card while keeping crosshair visible.
   *
   * @default Renders all keys as "key: value" lines
   */
  render?: (datum: Record<string, unknown>, index: number) => ReactNode;

  /**
   * Crosshair line display mode.
   * - `'x'` — vertical crosshair line (default)
   * - `'y'` — horizontal crosshair line
   * - `'xy'` — both axes
   * - `false` — no crosshair lines, tooltip only
   *
   * @default 'x'
   */
  crosshair?: ChartCrosshairMode;

  /**
   * Whether to show axis value labels on the crosshair lines.
   * Only relevant when `crosshair` is not `false`.
   *
   * @default false
   */
  crosshairLabels?: boolean;

  /**
   * Whether to snap to the nearest data point (true) or follow
   * the pointer freely (false). Snap mode finds the closest datum
   * by x-distance and positions the tooltip at that point.
   *
   * @default true
   */
  snap?: boolean;

  /**
   * Format function for x-axis crosshair label.
   */
  xFormat?: (value: number | string | null) => string;

  /**
   * Format function for y-axis crosshair label.
   */
  yFormat?: (value: number) => string;

  /**
   * Color for crosshair lines.
   * @default 'var(--color-border-emphasized)'
   */
  crosshairColor?: string;

  /**
   * Whether to show a dot indicator at the snapped data point.
   * @default true
   */
  dot?: boolean;
}

/**
 * Chart tooltip with integrated crosshair.
 *
 * Renders crosshair lines within the SVG and a floating tooltip card
 * in the top layer (via Popover API, portaled outside the SVG).
 *
 * @example
 * ```tsx
 * // Default: vertical crosshair + tooltip card
 * <XDSChartTooltip />
 *
 * // Both axes, with labels
 * <XDSChartTooltip crosshair="xy" crosshairLabels />
 *
 * // Tooltip only, no crosshair lines
 * <XDSChartTooltip crosshair={false} />
 *
 * // Custom render
 * <XDSChartTooltip render={(d) => <span>{d.month}: ${d.revenue}</span>} />
 * ```
 */
export function XDSChartTooltip({
  render,
  crosshair = 'x',
  crosshairLabels = false,
  snap = true,
  xFormat,
  yFormat,
  crosshairColor = 'var(--color-border-emphasized)',
  dot = true,
}: XDSChartTooltipProps) {
  const {data, xKey, xScale, yScale, width, height, svgRef, pointerToData} =
    useChart();

  const [hoverState, setHoverState] = useState<{
    index: number;
    point: DataPoint;
  } | null>(null);

  // Screen-space coords for the tooltip popover
  const [tooltipCoords, setTooltipCoords] = useState({x: 0, y: 0});
  const layerContainerRef = useRef<HTMLElement | null>(null);
  const active = useRef(false);

  const layer = useXDSLayer({mode: 'fixed'});

  // Find nearest data point. Uses Euclidean distance for scatter (linear x)
  // and x-only distance for categorical/time series (band x).
  const findNearest = useCallback(
    (px: number, py: number): {index: number; point: DataPoint} | null => {
      if (data.length === 0) return null;

      let closestIdx = 0;
      let minDist = Infinity;

      // Determine y keys (all numeric keys that aren't xKey)
      const yKeys =
        data.length > 0
          ? Object.keys(data[0]).filter(
              k => k !== xKey && typeof data[0][k] === 'number',
            )
          : [];

      for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        const datumPx = xPixel(datum, xKey, xScale);
        const dx = datumPx - px;

        // For each y key, compute distance to that point
        let bestDistForDatum = Infinity;
        let bestYKey = yKeys[0];

        for (const yk of yKeys) {
          const yv = datum[yk];
          if (typeof yv !== 'number') continue;
          const datumPy = yScale(yv);
          const dy = datumPy - py;
          const dist = dx * dx + dy * dy; // squared euclidean
          if (dist < bestDistForDatum) {
            bestDistForDatum = dist;
            bestYKey = yk;
          }
        }

        if (bestDistForDatum < minDist) {
          minDist = bestDistForDatum;
          closestIdx = i;
        }
      }

      const datum = data[closestIdx];
      const dpx = xPixel(datum, xKey, xScale);

      // Use the y value of the closest key for this datum
      let bestY = 0;
      let bestPy = height / 2;
      let bestDist = Infinity;
      for (const yk of yKeys) {
        const yv = datum[yk];
        if (typeof yv !== 'number') continue;
        const dpy = yScale(yv);
        const dx = dpx - px;
        const dy = dpy - py;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          bestY = yv;
          bestPy = dpy;
        }
      }

      return {
        index: closestIdx,
        point: {
          x: datum[xKey] as number | string | null,
          y: bestY,
          px: dpx,
          py: bestPy,
        },
      };
    },
    [data, xKey, xScale, yScale, height],
  );

  const updateTooltip = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      const dataPoint = pointerToData(e);

      let result: {index: number; point: DataPoint} | null = null;

      if (snap) {
        result = findNearest(dataPoint.px, dataPoint.py);
      } else {
        result = {index: -1, point: dataPoint};
      }

      if (result) {
        setHoverState(result);
        setTooltipCoords({x: e.clientX + 12, y: e.clientY - 8});
        layer.show();
      }

      // Resolve portal container on first interaction
      if (!layerContainerRef.current && svgRef.current) {
        layerContainerRef.current = svgRef.current.parentElement;
      }
    },
    [pointerToData, findNearest, snap, layer, svgRef],
  );

  // Touch: tap to show, drag to scrub
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      if (e.pointerType !== 'mouse') {
        e.preventDefault(); // blocks text selection on touch
        active.current = true;
        updateTooltip(e);
      }
    },
    [updateTooltip],
  );

  // Mouse: hover to show. Touch: drag to scrub (only if active).
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      if (e.pointerType !== 'mouse' && !active.current) return;
      updateTooltip(e);
    },
    [updateTooltip],
  );

  // Touch: lift to dismiss
  const handlePointerUp = useCallback(() => {
    if (active.current) {
      active.current = false;
      setHoverState(null);
      layer.hide();
    }
  }, [layer]);

  const handlePointerLeave = useCallback(() => {
    if (!active.current) {
      setHoverState(null);
      layer.hide();
    }
  }, [layer]);

  const fmtX =
    xFormat ??
    ((v: number | string | null) =>
      v != null ? (typeof v === 'number' ? v.toFixed(1) : String(v)) : '');
  const fmtY = yFormat ?? ((v: number) => v.toFixed(1));

  const datum = hoverState ? data[hoverState.index] : null;
  const point = hoverState?.point ?? null;

  const defaultRender = (d: Record<string, unknown>) => (
    <div
      style={{display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12}}>
      {Object.entries(d).map(([k, v]) => (
        <div key={k}>
          <span style={{color: 'var(--color-text-secondary)'}}>{k}:</span>{' '}
          <span style={{fontWeight: 500}}>{String(v)}</span>
        </div>
      ))}
    </div>
  );

  const showX = crosshair === 'x' || crosshair === 'xy';
  const showY = crosshair === 'y' || crosshair === 'xy';

  // Portal target: the chart's container div (parent of the SVG)
  const portalTarget =
    layerContainerRef.current ?? svgRef.current?.parentElement;

  return (
    <>
      <g>
        {/* Event capture rect — pointer events only, no capture/selection */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          style={{touchAction: 'none'}}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        />

        {point && (
          <>
            {/* Vertical crosshair line */}
            {showX && (
              <line
                x1={point.px}
                x2={point.px}
                y1={0}
                y2={height}
                stroke={crosshairColor}
                strokeWidth={1}
                strokeDasharray="3 3"
                pointerEvents="none"
              />
            )}

            {/* Horizontal crosshair line */}
            {showY && (
              <line
                x1={0}
                x2={width}
                y1={point.py}
                y2={point.py}
                stroke={crosshairColor}
                strokeWidth={1}
                strokeDasharray="3 3"
                pointerEvents="none"
              />
            )}

            {/* Data point indicator dot */}
            {dot && snap && hoverState && hoverState.index >= 0 && (
              <circle
                cx={point.px}
                cy={point.py}
                r={4}
                fill="var(--color-background-surface)"
                stroke={crosshairColor}
                strokeWidth={2}
                pointerEvents="none"
              />
            )}

            {/* X-axis label */}
            {crosshairLabels && showX && point.x != null && (
              <g
                transform={`translate(${point.px},${height})`}
                pointerEvents="none">
                <rect
                  x={-24}
                  y={2}
                  width={48}
                  height={16}
                  rx={4}
                  fill="var(--color-background-popover)"
                  stroke={crosshairColor}
                  strokeWidth={0.5}
                />
                <text
                  y={14}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--color-text-primary)">
                  {fmtX(point.x)}
                </text>
              </g>
            )}

            {/* Y-axis label */}
            {crosshairLabels && showY && (
              <g transform={`translate(0,${point.py})`} pointerEvents="none">
                <rect
                  x={-48}
                  y={-8}
                  width={44}
                  height={16}
                  rx={4}
                  fill="var(--color-background-popover)"
                  stroke={crosshairColor}
                  strokeWidth={0.5}
                />
                <text
                  x={-26}
                  dy="0.35em"
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--color-text-primary)">
                  {fmtY(point.y)}
                </text>
              </g>
            )}
          </>
        )}
      </g>

      {/* Tooltip card — portaled outside SVG into chart container div */}
      {portalTarget &&
        createPortal(
          layer.render(
            datum && hoverState && hoverState.index >= 0 ? (
              <div
                style={{
                  background: 'var(--color-background-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  boxShadow: 'var(--shadow-med)',
                  whiteSpace: 'nowrap',
                  width: 'fit-content',
                  pointerEvents: 'none',
                }}>
                {render
                  ? render(datum, hoverState.index)
                  : defaultRender(datum)}
              </div>
            ) : null,
            {x: tooltipCoords.x, y: tooltipCoords.y},
          ),
          portalTarget,
        )}
    </>
  );
}
