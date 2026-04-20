/**
 * @file XDSChart.tsx
 * @output Root chart container — sets up SVG, scales, and context
 * @position Parent component; all chart marks/axes/interactions are children
 *
 * Handles the d3 margin convention: outer SVG at full size, inner <g> translated
 * by margins. Children receive scales and dimensions via context.
 */

import {
  type ReactNode,
  type ReactElement,
  useMemo,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  Children,
  isValidElement,
} from 'react';
import {scaleLinear, scaleBand} from 'd3-scale';
import {stack as d3Stack, stackOrderNone, stackOffsetNone} from 'd3-shape';
import type {ScaleLinear} from 'd3-scale';
import {isBandScale} from './utils';
import {ChartProvider} from './ChartContext';
import type {ChartMargin, ChartScale, StackedSeries} from './types';

/**
 * Controls how the y-axis domain is computed:
 * - `'auto'` — includes 0 when all values are positive (default, bar-friendly)
 * - `'zero'` — symmetric range centered on 0 (good for +/- data)
 * - `'data'` — tight fit to data extent only (no forced zero)
 */
export type YBaseline = 'auto' | 'zero' | 'data';

export interface XDSChartProps {
  /** The dataset — array of objects with consistent keys */
  data: Record<string, unknown>[];
  /**
   * Key for the x-axis domain values.
   * String values produce a band scale; numeric values produce a linear scale.
   */
  xKey: string;
  /**
   * Key(s) for the y-axis domain values.
   * Used to compute the y-domain across all series.
   */
  yKeys: string[];
  /** Chart height in pixels. Width is responsive (fills container). */
  height?: number;
  /** Override default margins */
  margin?: Partial<ChartMargin>;
  /**
   * How the y-axis domain is computed.
   * - `'auto'` — includes 0 when all values are positive (default)
   * - `'zero'` — symmetric around 0 (use for profit/loss, sentiment, etc.)
   * - `'data'` — tight fit to data extent
   */
  yBaseline?: YBaseline;
  /**
   * Explicit y-axis domain [min, max].
   * When provided, this is the y-axis range. Data outside it is not clipped
   * visually but will extend beyond the chart area.
   */
  yDomain?: [number, number];
  /**
   * Explicit x-axis domain [min, max] for linear/time scales.
   * When provided, this is the x-axis range — the chart renders exactly
   * this window. Use for streaming charts where the range shifts over time.
   * Ignored for band (categorical) scales.
   */
  xDomain?: [number, number];
  /**
   * Set touch-action on the chart container. Use 'none' when interactive
   * components (brush, zoom, crosshair) are present to prevent scroll
   * interference on mobile.
   */
  interactive?: boolean;
  /**
   * Chart orientation — 'vertical' (default) or 'horizontal' (swaps x/y axes).
   * Horizontal orientation places categories on the y-axis and values on the x-axis.
   */
  orientation?: 'vertical' | 'horizontal';
  /** Chart contents — axes, marks, tooltips */
  children: ReactNode;
}

const DEFAULT_MARGIN: ChartMargin = {top: 16, right: 16, bottom: 32, left: 48};

/**
 * Root chart container. Computes scales from data and provides them to children.
 *
 * @example
 * ```
 * <XDSChart data={data} xKey="month" yKeys={['revenue']} height={300}>
 *   <XDSChartAxis position="bottom" />
 *   <XDSChartAxis position="left" />
 *   <XDSChartBar dataKey="revenue" color={useXDSChartColors().categorical(1)[0]} />
 * </XDSChart>
 * ```
 */
export function XDSChart({
  data,
  xKey,
  yKeys,
  height = 300,
  margin: marginOverride,
  yBaseline = 'auto',
  yDomain: yDomainProp,
  xDomain: xDomainProp,
  interactive = false,
  orientation = 'vertical',
  children,
}: XDSChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Block scroll/zoom on the container when interactive.
  // Must be non-passive to actually prevent default on touch events.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !interactive) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    el.addEventListener('touchstart', prevent, {passive: false});
    el.addEventListener('touchmove', prevent, {passive: false});
    return () => {
      el.removeEventListener('touchstart', prevent);
      el.removeEventListener('touchmove', prevent);
    };
  }, [interactive]);

  const margin = useMemo(
    () => ({...DEFAULT_MARGIN, ...marginOverride}),
    [marginOverride],
  );

  const innerWidth = Math.max(0, containerWidth - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const xScale = useMemo((): ChartScale => {
    if (orientation === 'horizontal') {
      // Horizontal: x-axis is the value (linear) axis
      let min = Infinity;
      let max = -Infinity;
      for (const d of data) {
        for (const key of yKeys) {
          const v = d[key];
          if (typeof v === 'number') {
            if (v < min) min = v;
            if (v > max) max = v;
          }
        }
      }
      if (yBaseline === 'zero') {
        const abs = Math.max(Math.abs(min), Math.abs(max));
        min = -abs;
        max = abs;
      } else if (yBaseline === 'auto') {
        if (min > 0) min = 0;
        if (max < 0) max = 0;
      }
      return scaleLinear().domain([min, max]).range([0, innerWidth]).nice();
    }

    const xValues = data.map(d => d[xKey]);
    const isNumeric = xValues.every(v => typeof v === 'number');

    if (isNumeric) {
      if (xDomainProp) {
        // Explicit domain is authoritative — use as-is
        return scaleLinear().domain(xDomainProp).range([0, innerWidth]);
      }
      // Auto-compute from data
      const nums = xValues as number[];
      let min = Infinity;
      let max = -Infinity;
      for (const n of nums) {
        if (n < min) min = n;
        if (n > max) max = n;
      }
      return scaleLinear().domain([min, max]).range([0, innerWidth]).nice();
    }

    // Categorical — xDomain doesn't apply to band scales
    return scaleBand<string>()
      .domain(xValues.map(String))
      .range([0, innerWidth])
      .padding(0.2);
  }, [data, xKey, yKeys, innerWidth, xDomainProp, orientation, yBaseline]);

  const yScale = useMemo((): ScaleLinear<number, number> => {
    if (orientation === 'horizontal') {
      // Horizontal: y-axis is the category (band) axis
      // We cast to ScaleLinear for the type, but XDSChartBar handles it specially
      const categories = data.map(d => String(d[xKey]));
      return scaleBand<string>()
        .domain(categories)
        .range([0, innerHeight])
        .padding(0.2) as unknown as ScaleLinear<number, number>;
    }

    if (yDomainProp) {
      // Explicit domain is authoritative — apply baseline logic but don't expand from data
      let [min, max] = yDomainProp;
      if (yBaseline === 'zero') {
        const abs = Math.max(Math.abs(min), Math.abs(max));
        min = -abs;
        max = abs;
      } else if (yBaseline === 'auto') {
        if (min > 0) min = 0;
        if (max < 0) max = 0;
      }
      return scaleLinear().domain([min, max]).range([innerHeight, 0]).nice();
    }

    // Auto-compute from data
    let min = Infinity;
    let max = -Infinity;
    for (const d of data) {
      for (const key of yKeys) {
        const v = d[key];
        if (typeof v === 'number') {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
    }

    if (yBaseline === 'zero') {
      const abs = Math.max(Math.abs(min), Math.abs(max));
      min = -abs;
      max = abs;
    } else if (yBaseline === 'auto') {
      if (min > 0) min = 0;
      if (max < 0) max = 0;
    }

    return scaleLinear().domain([min, max]).range([innerHeight, 0]).nice();
  }, [data, xKey, yKeys, innerHeight, yBaseline, yDomainProp, orientation]);

  // Compute stack layout from yKeys using d3-stack
  const stackLayout = useMemo((): Map<string, StackedSeries> | undefined => {
    if (yKeys.length < 2) return undefined;
    const stackGen = d3Stack<Record<string, unknown>>()
      .keys(yKeys)
      .order(stackOrderNone)
      .offset(stackOffsetNone);
    const stacked = stackGen(data);
    const layout = new Map<string, StackedSeries>();
    for (const series of stacked) {
      layout.set(series.key, {
        y0: series.map(d => d[0]),
        y1: series.map(d => d[1]),
      });
    }
    return layout;
  }, [data, yKeys]);

  // Compute bar grouping — count Bar children without stack prop and assign indices
  const barGroup = useMemo((): Map<string, {index: number; count: number}> | undefined => {
    const barDataKeys: string[] = [];
    Children.forEach(children, child => {
      if (
        isValidElement(child) &&
        (child as ReactElement<{dataKey?: string; stack?: string}>).props.dataKey &&
        !(child as ReactElement<{stack?: string}>).props.stack &&
        typeof child.type === 'function' &&
        (child.type as {name?: string}).name === 'XDSChartBar'
      ) {
        barDataKeys.push(
          (child as ReactElement<{dataKey: string}>).props.dataKey,
        );
      }
    });
    if (barDataKeys.length <= 1) return undefined;
    const map = new Map<string, {index: number; count: number}>();
    barDataKeys.forEach((key, idx) => {
      map.set(key, {index: idx, count: barDataKeys.length});
    });
    return map;
  }, [children]);

  const pixelToData = useCallback(
    (px: number, py: number) => {
      const y = yScale.invert(py);
      let x: number | string | null = null;
      if (isBandScale(xScale)) {
        const domain = xScale.domain();
        const step = xScale.step();
        const idx = Math.min(domain.length - 1, Math.max(0, Math.floor(px / step)));
        x = domain[idx];
      } else {
        x = (xScale as ScaleLinear<number, number>).invert(px);
      }
      return {x, y, px, py};
    },
    [xScale, yScale],
  );

  const pointerToData = useCallback(
    (e: React.PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return {x: null, y: 0, px: 0, py: 0};
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      // Transform to the inner <g> coordinate space (accounts for margins)
      const gEl = svg.querySelector('g');
      const ctm = gEl?.getScreenCTM?.()?.inverse();
      const local = ctm ? pt.matrixTransform(ctm) : {x: 0, y: 0};
      return pixelToData(local.x, local.y);
    },
    [pixelToData],
  );

  const ctx = useMemo(
    () => ({
      width: innerWidth,
      height: innerHeight,
      margin,
      xKey,
      data,
      xScale,
      yScale,
      svgRef,
      pointerToData,
      pixelToData,
      stackLayout,
      orientation,
      barGroup,
    }),
    [innerWidth, innerHeight, margin, xKey, data, xScale, yScale, pointerToData, pixelToData, stackLayout, orientation, barGroup],
  );

  return (
    <div ref={containerRef} style={{width: '100%', touchAction: interactive ? 'none' : undefined, userSelect: interactive ? 'none' : undefined} as React.CSSProperties}>
      {containerWidth > 0 && (
        <svg ref={svgRef} width={containerWidth} height={height} style={interactive ? {touchAction: 'none'} : undefined}>
          <defs>
            <clipPath id="xds-chart-plot">
              <rect x={0} y={0} width={innerWidth} height={innerHeight} />
            </clipPath>
          </defs>
          <g transform={`translate(${margin.left},${margin.top})`}>
            <ChartProvider value={ctx}>{children}</ChartProvider>
          </g>
        </svg>
      )}
    </div>
  );
}
