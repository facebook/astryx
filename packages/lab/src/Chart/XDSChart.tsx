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
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import {scaleLinear, scaleBand} from 'd3-scale';
import type {ScaleLinear} from 'd3-scale';
import {ChartProvider} from './ChartContext';
import type {ChartMargin, ChartScale} from './types';

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
  children,
}: XDSChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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

  const margin = useMemo(
    () => ({...DEFAULT_MARGIN, ...marginOverride}),
    [marginOverride],
  );

  const innerWidth = Math.max(0, containerWidth - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const xScale = useMemo((): ChartScale => {
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
  }, [data, xKey, innerWidth, xDomainProp]);

  const yScale = useMemo((): ScaleLinear<number, number> => {
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
  }, [data, yKeys, innerHeight, yBaseline, yDomainProp]);

  const ctx = useMemo(
    () => ({
      width: innerWidth,
      height: innerHeight,
      margin,
      xKey,
      data,
      xScale,
      yScale,
    }),
    [innerWidth, innerHeight, margin, xKey, data, xScale, yScale],
  );

  return (
    <div ref={containerRef} style={{width: '100%'}}>
      {containerWidth > 0 && (
        <svg width={containerWidth} height={height}>
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
