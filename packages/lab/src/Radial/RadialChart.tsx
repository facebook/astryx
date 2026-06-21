// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadialChart.tsx
 * @output Root radial chart container — spider, pie, donut
 * @position Parent component; all radial marks read from its context
 *
 * Owns the radial coordinate space: center, radius, angle/radius scales.
 * Same Tier 1 guarantee as Chart — all children map through the same context.
 */

import {
  type ReactNode,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import {RadialProvider} from './RadialContext';
import type {RadialMode} from './types';

export interface RadialChartProps {
  /** The dataset */
  data: Record<string, unknown>[];
  /** Chart height in pixels. Width is responsive. */
  height?: number;
  /**
   * Spider mode: array of axis keys (each key is a dimension).
   * When provided, the chart operates in spider mode.
   */
  axes?: string[];
  /**
   * Pie/donut mode: data key containing the numeric value for each slice.
   * When provided (without axes), the chart operates in pie mode.
   */
  valueKey?: string;
  /**
   * Pie/donut mode: data key for the slice label.
   */
  labelKey?: string;
  /**
   * Inner radius as a fraction of outer radius (0-1).
   * 0 = full pie/spider, 0.6 = donut. Default: 0.
   */
  innerRadius?: number;
  /**
   * Padding between pie slices in radians. Default: 0.02.
   */
  padAngle?: number;
  /** Chart contents */
  /**
   * Enable touch interaction mode — blocks scroll on mobile.
   */
  interactive?: boolean;
  children: ReactNode;
}

/**
 * Root radial chart container. Computes angular/radial scales and provides
 * them to children via context.
 *
 * @example
 * ```
 * // Spider
 * <RadialChart data={data} axes={['speed', 'handling', 'comfort']} height={400}>
 *   <RadialGrid rings={5} />
 *   <RadialArea dataKey="modelA" color={colors[0]} />
 *   <RadialAxis />
 * </RadialChart>
 *
 * // Pie
 * <RadialChart data={data} valueKey="revenue" labelKey="region" height={400}>
 *   <RadialSlice />
 * </RadialChart>
 *
 * // Donut
 * <RadialChart data={data} valueKey="revenue" labelKey="region" innerRadius={0.6} height={400}>
 *   <RadialSlice />
 * </RadialChart>
 * ```
 */
export function RadialChart({
  data,
  height = 400,
  axes,
  valueKey,
  labelKey,
  innerRadius: innerRadiusFraction = 0,
  padAngle = 0.02,
  children,
}: RadialChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

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

  const size = Math.min(containerWidth, height);
  const cx = containerWidth / 2;
  const cy = height / 2;
  const outerRadius = size / 2 - 40; // leave room for labels
  const innerRadiusPx = outerRadius * innerRadiusFraction;

  const mode: RadialMode = axes ? 'spider' : 'pie';

  // Spider: compute axis angles and domains
  const spiderCtx = useMemo(() => {
    if (!axes || axes.length === 0) {
      return {};
    }

    const angleByAxis = new Map<string, number>();
    const step = (2 * Math.PI) / axes.length;
    axes.forEach((key, i) => {
      // Start from top (-PI/2) and go clockwise
      angleByAxis.set(key, -Math.PI / 2 + step * i);
    });

    // Compute domain per axis
    const axisDomains = new Map<string, [number, number]>();
    for (const key of axes) {
      let min = Infinity;
      let max = -Infinity;
      for (const d of data) {
        const v = d[key];
        if (typeof v === 'number') {
          if (v < min) {
            min = v;
          }
          if (v > max) {
            max = v;
          }
        }
      }
      // Include 0 as floor
      if (min > 0) {
        min = 0;
      }
      axisDomains.set(key, [min, max]);
    }

    const radiusScale = (t: number) =>
      innerRadiusPx + t * (outerRadius - innerRadiusPx);

    return {axes, angleByAxis, radiusScale, axisDomains};
  }, [axes, data, outerRadius, innerRadiusPx]);

  // Pie: compute slices
  const pieCtx = useMemo(() => {
    if (!valueKey) {
      return {};
    }

    const total = data.reduce((sum, d) => {
      const v = d[valueKey];
      return sum + (typeof v === 'number' ? v : 0);
    }, 0);

    if (total === 0) {
      return {slices: []};
    }

    const totalPad = padAngle * data.length;
    const available = 2 * Math.PI - totalPad;
    let currentAngle = -Math.PI / 2; // start from top

    const slices = data.map(d => {
      const v = typeof d[valueKey] === 'number' ? (d[valueKey] as number) : 0;
      const percentage = v / total;
      const sweep = percentage * available;
      const slice = {
        key: labelKey ? String(d[labelKey]) : String(v),
        value: v,
        startAngle: currentAngle,
        endAngle: currentAngle + sweep,
        percentage,
      };
      currentAngle += sweep + padAngle;
      return slice;
    });

    return {slices};
  }, [data, valueKey, labelKey, padAngle]);

  const ctx = useMemo(
    () => ({
      cx,
      cy,
      radius: outerRadius,
      innerRadius: innerRadiusPx,
      data,
      mode,
      ...spiderCtx,
      ...pieCtx,
    }),
    [cx, cy, outerRadius, innerRadiusPx, data, mode, spiderCtx, pieCtx],
  );

  return (
    <div ref={containerRef} style={{width: '100%'}}>
      {containerWidth > 0 && (
        <svg width={containerWidth} height={height}>
          <RadialProvider value={ctx}>{children}</RadialProvider>
        </svg>
      )}
    </div>
  );
}
