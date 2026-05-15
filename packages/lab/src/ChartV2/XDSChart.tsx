// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSChart.tsx (v2)
 * @output Root chart — coordinates layout, rendering, and events
 * @position Top-level; delegates everything to series configs and interaction slots
 *
 * The chart root has ZERO knowledge of mark types. It:
 *   1. Runs the layout engine (scales + stacking + grouping)
 *   2. Calls each series' resolve() and render() methods
 *   3. Provides a single event layer for interaction children
 */

import {
  type ReactNode,
  useId,
  useMemo,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';
import type {SeriesDef} from './types';
import type {ChartV2Context, ChartMargin, ChartPointerEvent} from './types';
import {computeLayout} from './layout';
import {ChartV2Provider} from './ChartV2Context';
import {ChartProvider} from '../Chart/ChartContext';
import {XDSText} from '@xds/core';
import {XDSVStack, XDSHStack} from '@xds/core';
import * as stylex from '@stylexjs/stylex';
import {ChartLegend, type LegendConfig, type LegendItem, type LegendPosition, type LegendAlignment} from './legend';

export interface XDSChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  margin?: Partial<ChartMargin>;
  grid?: ReactNode;
  axes?: ReactNode;
  /** Legend configuration. Pass `true` for defaults, or a config object. */
  legend?: boolean | LegendConfig;
  interactions?: ReactNode;
  children?: ReactNode;
  /** Chart title displayed above the visualization */
  title?: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
}

const DEFAULT_MARGIN: ChartMargin = {top: 16, right: 16, bottom: 32, left: 48};

const styles = stylex.create({
  title: {
    marginBottom: 16,
  },
});

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
  title,
  subtitle,
}: XDSChartProps) {
  const chartId = useId();
  const descId = `${chartId}-desc`;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const pointerHandlers = useRef<Set<(e: ChartPointerEvent) => void>>(
    new Set(),
  );

  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
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

  const seriesCtx = useMemo(
    () => ({
      data,
      xKey,
      xScale: layout.xScale,
      yScale: layout.yScale,
      width: innerWidth,
      height: innerHeight,
    }),
    [data, xKey, layout, innerWidth, innerHeight],
  );

  // ─── Event dispatch ───────────────────────────────────────────────────
  const onPointer = useCallback((handler: (e: ChartPointerEvent) => void) => {
    pointerHandlers.current.add(handler);
    return () => {
      pointerHandlers.current.delete(handler);
    };
  }, []);

  const dispatch = useCallback((e: ChartPointerEvent) => {
    for (const handler of pointerHandlers.current) {
      handler(e);
    }
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      const svg = svgRef.current;
      if (!svg) {
        return;
      }
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const ctm = e.currentTarget.getScreenCTM()?.inverse();
      if (!ctm) {
        return;
      }
      const cursor = point.matrixTransform(ctm);

      let nearest: ChartPointerEvent['nearest'] = null;
      let bestDist = 40 * 40;
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

  // ─── Context for interactions + v1 chrome ─────────────────────────────
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

  // Bridge v1 context for XDSChartGrid/Axis compatibility
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
      pointerToData: () => ({
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

  // ─── Legend ────────────────────────────────────────────────────────────
  const legendConfig = useMemo((): LegendConfig | null => {
    if (!legend) return null;
    if (legend === true) return {position: 'bottom', alignment: 'start'};
    return {position: 'bottom', alignment: 'start', ...legend};
  }, [legend]);

  const legendItems = useMemo((): LegendItem[] => {
    if (!legendConfig) return [];
    if (legendConfig.items) return legendConfig.items;
    // Auto-derive from series — skip utility marks (referenceLine, errorBar, band)
    const skipTypes = new Set(['referenceLine', 'errorBar', 'band']);
    return series
      .filter(s => !skipTypes.has(s.type) && s.color)
      .map(s => ({label: s.label ?? s.key, color: s.color!, type: s.type}));
  }, [legendConfig, series]);

  // ─── Render ───────────────────────────────────────────────────────────
  if (containerWidth === 0) {
    return <div ref={containerRef} style={{width: '100%', height}} />;
  }

  const legendElement = legendItems.length > 0 ? (
    <ChartLegend items={legendItems} position={legendConfig!.position!} alignment={legendConfig!.alignment!} />
  ) : null;

  const isLegendHorizontal = legendConfig?.position === 'start' || legendConfig?.position === 'end';

  return (
    <div ref={containerRef} style={{width: '100%'}}>
      {(title || subtitle) && (
        <div {...stylex.props(styles.title)}>
          {title && (
            <XDSText type="body" weight="semibold" display="block">
              {title}
            </XDSText>
          )}
          {subtitle && (
            <XDSText type="supporting" display="block">
              {subtitle}
            </XDSText>
          )}
        </div>
      )}
      <ChartV2Provider value={ctx}>
        <ChartProvider value={v1Ctx}>
          {legendConfig == null ? (
            renderSvg()
          ) : isLegendHorizontal ? (
            <XDSHStack gap={4}>
              {legendConfig.position === 'start' && legendElement}
              <div style={{flex: 1, minWidth: 0, overflow: 'hidden'}}>
                {renderSvg()}
              </div>
              {legendConfig.position === 'end' && legendElement}
            </XDSHStack>
          ) : (
            <XDSVStack gap={4}>
              {legendConfig.position === 'top' && legendElement}
              {renderSvg()}
              {legendConfig.position === 'bottom' && legendElement}
            </XDSVStack>
          )}
        </ChartProvider>
      </ChartV2Provider>
    </div>
  );

  function renderSvg() {
    return (
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        aria-label={title ?? undefined}
        aria-describedby={subtitle ? descId : undefined}>
        {title && <title>{title}</title>}
        {subtitle && <desc id={descId}>{subtitle}</desc>}
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* 1. Grid */}
          {grid}

          {/* 2. Marks — each series renders itself */}
          {series.map(s => {
            const resolved = layout.resolved.get(s.key);
            if (!resolved) {
              return null;
            }
            return <g key={s.key}>{s.render(resolved, seriesCtx)}</g>;
          })}

          {/* 3. Axes */}
          {axes}

          {/* 4. Event capture + interactions */}
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
    );
  }
}
