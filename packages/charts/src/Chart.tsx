// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Chart.tsx (v2)
 * @output Root chart — coordinates layout, rendering, and events
 * @position Top-level; delegates everything to series configs and interaction slots
 *
 * The chart root has ZERO knowledge of mark types. It:
 *   1. Runs the layout engine (scales + stacking + grouping)
 *   2. Calls each series' resolve() and render() methods
 *   3. Provides a single event layer for interaction children
 */

'use client';

import {
  type ReactNode,
  useId,
  useMemo,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';
import type {SeriesDef, YBaseline} from './types';
import type {ChartContext, ChartMargin, ChartPointerEvent} from './types';
import {computeLayout} from './layout';
import {ChartProvider} from './ChartContext';
import {Text} from '@astryxdesign/core';
import {VStack, HStack} from '@astryxdesign/core';
import * as stylex from '@stylexjs/stylex';
import {ChartLegend, type ChartLegendProps} from './ChartLegend';
import {deriveLegendItems} from './legend';
import {ChartTooltip, type ChartTooltipProps} from './ChartTooltip';
import {useChartColors} from './useChartColors';
import {isUtilityMarkType} from './types';

export interface ChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  margin?: Partial<ChartMargin>;
  /** How the y-domain is derived when `yDomain` is not set. Default `'auto'`. */
  yBaseline?: YBaseline;
  /** Explicit y-domain [min, max]. Authoritative — disables baseline/headroom. */
  yDomain?: [number, number];
  /**
   * Explicit x-domain [min, max] for numeric/linear x. Honored even when `data`
   * is empty (stable streaming window). Ignored for categorical (band) scales.
   */
  xDomain?: [number, number];
  grid?: ReactNode;
  axes?: ReactNode;
  legend?: boolean | ChartLegendProps;
  tooltip?: boolean | Omit<ChartTooltipProps, 'series'>;
  interactions?: ReactNode;
  children?: ReactNode;
  title?: string;
  subtitle?: string;
}

const DEFAULT_MARGIN: ChartMargin = {top: 24, right: 24, bottom: 32, left: 48};

const styles = stylex.create({
  container: {
    width: '100%',
  },
  title: {
    marginBottom: 16,
  },
  chartArea: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
});

export function Chart({
  data,
  xKey,
  series,
  height = 300,
  margin: marginOverride,
  yBaseline,
  yDomain,
  xDomain,
  grid,
  axes,
  legend,
  tooltip,
  interactions,
  children,
  title,
  subtitle,
}: ChartProps) {
  const chartId = useId();
  const descId = `${chartId}-desc`;
  // useId() can contain ':' which is invalid in an SVG url(#id) reference.
  const clipId = `plot-${chartId.replace(/:/g, '')}`;
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

  // ─── Color assignment ─────────────────────────────────────────────────
  // Give every primary series that doesn't supply a static color (auto-colored
  // or accessor-colored) a distinct color from the theme's categorical palette.
  // Utility marks (band/errorBar/referenceLine) don't consume palette slots.
  // Assigned during render (like the layout pass annotates `_uid`) so the first
  // paint is already colored; intentionally not a `useMemo` — it mutates the
  // caller's series defs, and useMemo is allowed to drop its cached result.
  const chartColors = useChartColors();
  const needsColor = series.filter(
    s => !isUtilityMarkType(s.type) && s.color == null,
  );
  const palette = chartColors.categorical(Math.max(needsColor.length, 1));
  for (let i = 0; i < needsColor.length; i++) {
    needsColor[i]._resolvedColor = palette[i % palette.length];
  }

  // ─── Layout pass ──────────────────────────────────────────────────────
  const layout = useMemo(
    () =>
      computeLayout({
        data,
        xKey,
        series,
        width: innerWidth,
        height: innerHeight,
        yBaseline,
        yDomain,
        xDomain,
      }),
    [data, xKey, series, innerWidth, innerHeight, yBaseline, yDomain, xDomain],
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

      // Find nearest point by x-distance only (full vertical column is the hover zone)
      let nearest: ChartPointerEvent['nearest'] = null;
      let bestXDist = Infinity;
      for (const [seriesKey, points] of layout.resolved) {
        for (const p of points) {
          const xDist = Math.abs(p.px - cursor.x);
          if (xDist < bestXDist) {
            bestXDist = xDist;
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
  const ctx: ChartContext = useMemo(
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

  // ─── Legend ────────────────────────────────────────────────────────────
  const legendConfig = legend === true ? {} : legend || null;

  const legendElement = legendConfig ? (
    <ChartLegend
      items={legendConfig.items ?? deriveLegendItems(series)}
      position={legendConfig.position}
      alignment={legendConfig.alignment}
    />
  ) : null;

  const legendPosition = legendConfig?.position ?? 'bottom';
  const isLegendHorizontal =
    legendPosition === 'start' || legendPosition === 'end';

  // ─── Render ───────────────────────────────────────────────────────────
  if (containerWidth === 0) {
    return (
      <div
        ref={containerRef}
        {...stylex.props(styles.container)}
        style={{height}}
      />
    );
  }

  return (
    <div ref={containerRef} {...stylex.props(styles.container)}>
      {(title || subtitle) && (
        <div {...stylex.props(styles.title)}>
          {title && (
            <Text type="body" weight="semibold" display="block">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text type="supporting" display="block">
              {subtitle}
            </Text>
          )}
        </div>
      )}
      <ChartProvider value={ctx}>
        {legendConfig == null ? (
          renderSvg()
        ) : isLegendHorizontal ? (
          <HStack gap={4}>
            {legendPosition === 'start' && legendElement}
            <div {...stylex.props(styles.chartArea)}>{renderSvg()}</div>
            {legendPosition === 'end' && legendElement}
          </HStack>
        ) : (
          <VStack gap={4}>
            {legendPosition === 'top' && legendElement}
            {renderSvg()}
            {legendPosition === 'bottom' && legendElement}
          </VStack>
        )}
      </ChartProvider>
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
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={innerWidth} height={innerHeight} />
          </clipPath>
        </defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* 1. Grid */}
          {grid}

          {/* 2. Marks — each series renders itself. Clipped to the plot area so
              curve overshoot (monotone/natural) can't escape into the margins. */}
          <g clipPath={`url(#${clipId})`}>
            {series.map(s => {
              const resolved = s._uid ? layout.resolved.get(s._uid) : undefined;
              if (!resolved) {
                return null;
              }
              return <g key={s._uid}>{s.render(resolved, seriesCtx)}</g>;
            })}
          </g>

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

          {/* 5. Tooltip — declarative shortcut. For full control, render
              <ChartTooltip> directly via the `children` slot. */}
          {tooltip && (
            <ChartTooltip
              series={series}
              {...(tooltip === true ? {} : tooltip)}
            />
          )}

          {/* 6. Escape hatch */}
          {children}
        </g>
      </svg>
    );
  }
}
