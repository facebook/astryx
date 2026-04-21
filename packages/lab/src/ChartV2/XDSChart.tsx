/**
 * @file XDSChart.tsx (v2)
 * @output Root chart component — coordinates layout, rendering, and events
 * @position Top-level component; delegates to series renderers and interaction slots
 *
 * The chart root:
 *   1. Measures container width (responsive)
 *   2. Runs layout (scales + transforms + position resolution)
 *   3. Renders chrome (grid, axes) via slots
 *   4. Calls each series config's renderer
 *   5. Renders interaction slot with event dispatch
 *   6. Renders legend slot
 */

import {
  type ReactNode,
  useMemo,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';
import type {SeriesConfig} from './series';
import type {ChartV2Context, ChartMargin, ChartPointerEvent} from './types';
import {computeLayout} from './layout';
import {ChartV2Provider} from './ChartV2Context';
import {ChartProvider} from '../Chart/ChartContext';
import {renderSeries} from './renderers';

export interface XDSChartProps {
  /** The dataset */
  data: Record<string, unknown>[];
  /** Key for x-axis values */
  xKey: string;
  /** Series configs — defines what marks to render */
  series: SeriesConfig[];
  /** Chart height in pixels */
  height?: number;
  /** Margin overrides */
  margin?: Partial<ChartMargin>;
  /** Grid slot */
  grid?: ReactNode;
  /** Axes slot */
  axes?: ReactNode;
  /** Legend slot — true for auto-generated, or a ReactNode */
  legend?: boolean | ReactNode;
  /** Interactions slot */
  interactions?: ReactNode;
  /** Escape hatch — custom overlay content */
  children?: ReactNode;
}

const DEFAULT_MARGIN: ChartMargin = {top: 16, right: 16, bottom: 32, left: 48};

export function XDSChart({
  data,
  xKey,
  series,
  height = 300,
  margin: marginOverride,
  grid,
  axes,
  legend,
  interactions,
  children,
}: XDSChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const pointerHandlers = useRef<Set<(e: ChartPointerEvent) => void>>(
    new Set(),
  );

  // ─── Responsive width ─────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const margin = useMemo(
    () => ({...DEFAULT_MARGIN, ...marginOverride}),
    [marginOverride],
  );
  const innerWidth = Math.max(0, containerWidth - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  // ─── Layout pass ──────────────────────────────────────────────────────
  const layout = useMemo(
    () =>
      computeLayout({
        data,
        xKey,
        series,
        width: innerWidth,
        height: innerHeight,
      }),
    [data, xKey, series, innerWidth, innerHeight],
  );

  // ─── Event dispatch ───────────────────────────────────────────────────
  const onPointer = useCallback((handler: (e: ChartPointerEvent) => void) => {
    pointerHandlers.current.add(handler);
    return () => {
      pointerHandlers.current.delete(handler);
    };
  }, []);

  const dispatch = useCallback((e: ChartPointerEvent) => {
    for (const handler of pointerHandlers.current) handler(e);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const ctm = e.currentTarget.getScreenCTM()?.inverse();
      if (!ctm) return;
      const cursor = point.matrixTransform(ctm);

      // Find nearest resolved point
      let nearest: ChartPointerEvent['nearest'] = null;
      let bestDist = 40 * 40; // 40px snap radius
      for (const [seriesKey, points] of layout.resolved) {
        for (const p of points) {
          const dx = p.px - cursor.x;
          const dy = p.py - cursor.y;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            nearest = {...p, seriesKey};
          }
        }
      }

      dispatch({x: cursor.x, y: cursor.y, nearest, active: e.buttons > 0});
    },
    [layout.resolved, dispatch],
  );

  const handlePointerLeave = useCallback(() => {
    dispatch({x: -1, y: -1, nearest: null, active: false});
  }, [dispatch]);

  // ─── Context for interactions ─────────────────────────────────────────
  const ctx: ChartV2Context = useMemo(
    () => ({
      width: innerWidth,
      height: innerHeight,
      margin,
      data,
      xKey,
      xScale: layout.xScale,
      yScale: layout.yScale,
      resolved: layout.resolved,
      onPointer,
      svgRef,
    }),
    [innerWidth, innerHeight, margin, data, xKey, layout, onPointer],
  );

  // ─── Bridge to v1 context (so XDSChartGrid, XDSChartAxis etc. work) ──
  const v1Ctx = useMemo(
    () => ({
      width: innerWidth,
      height: innerHeight,
      margin,
      xKey,
      data,
      xScale: layout.xScale,
      yScale: layout.yScale,
      svgRef,
      pointerToData: (e: React.PointerEvent) => ({
        x: null as string | number | null,
        y: 0,
        px: 0,
        py: 0,
      }),
      pixelToData: (px: number, py: number) => ({
        x: null as string | number | null,
        y: 0,
        px,
        py,
      }),
    }),
    [innerWidth, innerHeight, margin, xKey, data, layout, svgRef],
  );

  // ─── Render ───────────────────────────────────────────────────────────
  if (containerWidth === 0) {
    return <div ref={containerRef} style={{width: '100%', height}} />;
  }

  return (
    <div ref={containerRef} style={{width: '100%'}}>
      <ChartV2Provider value={ctx}>
        <ChartProvider value={v1Ctx}>
          <svg ref={svgRef} width={containerWidth} height={height}>
            <g transform={`translate(${margin.left},${margin.top})`}>
              {/* 1. Grid (background) */}
              {grid}

              {/* 2. Marks (data layer) — each series renders itself */}
              {renderSeries(series, layout, data, xKey)}

              {/* 3. Axes (frame) */}
              {axes}

              {/* 4. Event capture rect + interactions (overlay) */}
              <rect
                x={0}
                y={0}
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
              />
              {interactions}

              {/* 5. Escape hatch */}
              {children}
            </g>
          </svg>

          {/* 6. Legend (outside SVG if needed) */}
          {legend === true ? null /* TODO: auto legend */ : legend}
        </ChartProvider>
      </ChartV2Provider>
    </div>
  );
}
