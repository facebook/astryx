/**
 * @file XDSRadialTooltip.tsx
 * @output Hover tooltip for radial charts (pie/donut/spider)
 * @position Child of XDSRadialChart; reads geometry from radial context
 *
 * Uses the XDS Layer system for top-layer rendering.
 * Hit-tests pointer position against slices (pie/donut) or axis proximity (spider).
 */

'use client';

import {useState, useCallback, useRef, useEffect, type ReactNode} from 'react';
import {useXDSLayer} from '@xds/core/Layer';
import {useRadial} from './RadialContext';

export interface RadialTooltipDatum {
  /** The slice key or axis name */
  label: string;
  /** The numeric value */
  value: number;
  /** For pie/donut: the percentage of total */
  percentage?: number;
  /** Index in the dataset */
  index: number;
}

export interface XDSRadialTooltipProps {
  /**
   * Custom render function for tooltip content.
   * Receives the hovered slice/point info.
   *
   * @default Renders label, value, and percentage
   */
  render?: (datum: RadialTooltipDatum) => ReactNode;

  /**
   * Whether to highlight the hovered slice by scaling it outward.
   * @default true
   */
  highlight?: boolean;

  /**
   * Highlight offset in pixels (how far the slice pushes out).
   * @default 6
   */
  highlightOffset?: number;
}

/**
 * Tooltip for radial charts. Detects which slice the pointer is over
 * using polar coordinate math and renders a tooltip in the top layer.
 *
 * @example
 * ```tsx
 * <XDSRadialChart data={data} valueKey="revenue" labelKey="region" height={400}>
 *   <XDSRadialSlice colors={colors} />
 *   <XDSRadialTooltip />
 * </XDSRadialChart>
 * ```
 */
export function XDSRadialTooltip({
  render,
  highlight = true,
  highlightOffset = 6,
}: XDSRadialTooltipProps) {
  const {
    cx,
    cy,
    radius,
    innerRadius,
    slices,
    mode,
    data,
    axes,
    angleByAxis,
    axisDomains,
  } = useRadial();

  const [hoverState, setHoverState] = useState<RadialTooltipDatum | null>(null);
  const [tooltipCoords, setTooltipCoords] = useState({x: 0, y: 0});
  const svgRef = useRef<SVGSVGElement | null>(null);

  const layer = useXDSLayer({mode: 'fixed'});

  // Resolve SVG element from the <g> parent
  const gRef = useCallback((el: SVGGElement | null) => {
    if (el) svgRef.current = el.ownerSVGElement;
  }, []);

  const hitTestPie = useCallback(
    (localX: number, localY: number): RadialTooltipDatum | null => {
      if (!slices || slices.length === 0) return null;

      const dx = localX - cx;
      const dy = localY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Outside the chart or inside the donut hole
      if (dist > radius || dist < innerRadius) return null;

      // Compute angle (matching the chart's convention: start from -PI/2, clockwise)
      let angle = Math.atan2(dy, dx);
      // Normalize to match slice angles
      if (angle < -Math.PI / 2) angle += 2 * Math.PI;

      for (let i = 0; i < slices.length; i++) {
        const slice = slices[i];
        if (angle >= slice.startAngle && angle <= slice.endAngle) {
          return {
            label: slice.key,
            value: slice.value,
            percentage: slice.percentage,
            index: i,
          };
        }
      }

      return null;
    },
    [slices, cx, cy, radius, innerRadius],
  );

  const hitTestSpider = useCallback(
    (localX: number, localY: number): RadialTooltipDatum | null => {
      if (!axes || !angleByAxis || !axisDomains) return null;

      const dx = localX - cx;
      const dy = localY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius + 20) return null;

      // Find nearest axis by angle
      const angle = Math.atan2(dy, dx);
      let nearestAxis = axes[0];
      let minAngleDist = Infinity;

      for (const [key, axisAngle] of angleByAxis) {
        let diff = Math.abs(angle - axisAngle);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        if (diff < minAngleDist) {
          minAngleDist = diff;
          nearestAxis = key;
        }
      }

      // Only trigger if reasonably close to an axis
      if (minAngleDist > Math.PI / axes.length) return null;

      // Find which data point is closest along that axis
      // For simplicity, use the first data entry (single-series spider)
      // or the one with the highest value on that axis
      let bestIdx = 0;
      let bestVal = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i][nearestAxis];
        if (typeof v === 'number' && v > bestVal) {
          bestVal = v;
          bestIdx = i;
        }
      }

      return {
        label: nearestAxis,
        value: bestVal,
        index: bestIdx,
      };
    },
    [axes, angleByAxis, axisDomains, cx, cy, radius, data],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGCircleElement>) => {
      const svg = svgRef.current;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM()?.inverse();
      if (!ctm) return;
      const local = pt.matrixTransform(ctm);

      const hit =
        mode === 'pie'
          ? hitTestPie(local.x, local.y)
          : hitTestSpider(local.x, local.y);

      if (hit) {
        setHoverState(hit);
        setTooltipCoords({x: e.clientX + 12, y: e.clientY - 8});
        layer.show();
      } else {
        setHoverState(null);
        layer.hide();
      }
    },
    [mode, hitTestPie, hitTestSpider, layer],
  );

  const handlePointerLeave = useCallback(() => {
    setHoverState(null);
    layer.hide();
  }, [layer]);

  const defaultRender = (d: RadialTooltipDatum) => (
    <div
      style={{display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12}}>
      <div style={{fontWeight: 600}}>{d.label}</div>
      <div>
        <span style={{color: 'var(--color-text-secondary)'}}>Value:</span>{' '}
        <span style={{fontWeight: 500}}>{d.value.toLocaleString()}</span>
      </div>
      {d.percentage != null && (
        <div>
          <span style={{color: 'var(--color-text-secondary)'}}>Share:</span>{' '}
          <span style={{fontWeight: 500}}>
            {Math.round(d.percentage * 100)}%
          </span>
        </div>
      )}
    </div>
  );

  // Highlight: render a translated copy of the hovered slice
  const highlightSlice =
    highlight && hoverState && mode === 'pie' && slices?.[hoverState.index];

  return (
    <>
      <g ref={gRef}>
        {/* Event capture — circle covering the chart area */}
        <circle
          cx={cx}
          cy={cy}
          r={radius + 10}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        />

        {/* Highlight offset for pie slice */}
        {highlightSlice && (
          <g
            transform={(() => {
              const midAngle =
                (highlightSlice.startAngle + highlightSlice.endAngle) / 2;
              const tx = Math.cos(midAngle) * highlightOffset;
              const ty = Math.sin(midAngle) * highlightOffset;
              return `translate(${tx},${ty})`;
            })()}
            pointerEvents="none"
            opacity={0.3}>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--color-border-emphasized)"
              strokeWidth={2}
              clipPath={`url(#radial-highlight-${hoverState.index})`}
            />
          </g>
        )}
      </g>

      {/* Tooltip in top layer */}
      {layer.render(
        hoverState ? (
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
            {render ? render(hoverState) : defaultRender(hoverState)}
          </div>
        ) : null,
        {x: tooltipCoords.x, y: tooltipCoords.y},
      )}
    </>
  );
}
