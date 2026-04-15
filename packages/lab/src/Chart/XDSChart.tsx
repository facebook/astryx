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
 *   <XDSChartBar dataKey="revenue" color={XDSChartColors.categorical(1)[0]} />
 * </XDSChart>
 * ```
 */
export function XDSChart({
  data,
  xKey,
  yKeys,
  height = 300,
  margin: marginOverride,
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
      const nums = xValues as number[];
      return scaleLinear()
        .domain([Math.min(...nums), Math.max(...nums)])
        .range([0, innerWidth])
        .nice();
    }

    // Categorical / string
    return scaleBand<string>()
      .domain(xValues.map(String))
      .range([0, innerWidth])
      .padding(0.2);
  }, [data, xKey, innerWidth]);

  const yScale = useMemo((): ScaleLinear<number, number> => {
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
    // Always include 0 in bar-friendly charts
    if (min > 0) min = 0;
    return scaleLinear().domain([min, max]).range([innerHeight, 0]).nice();
  }, [data, yKeys, innerHeight]);

  const ctx = useMemo(
    () => ({
      width: innerWidth,
      height: innerHeight,
      margin,
      data,
      xScale,
      yScale,
    }),
    [innerWidth, innerHeight, margin, data, xScale, yScale],
  );

  return (
    <div ref={containerRef} style={{width: '100%'}}>
      {containerWidth > 0 && (
        <svg width={containerWidth} height={height}>
          <g transform={`translate(${margin.left},${margin.top})`}>
            <ChartProvider value={ctx}>{children}</ChartProvider>
          </g>
        </svg>
      )}
    </div>
  );
}
