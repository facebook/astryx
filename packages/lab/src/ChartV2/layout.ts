/**
 * @file layout.ts
 * @output Computes scales, stacking, grouping, then delegates to each series.resolve()
 * @position Called by XDSChart root — the single layout pass
 *
 * The layout engine does NOT know about specific mark types.
 * It handles cross-series coordination (scales, stacking, grouping)
 * then calls each series' own resolve() method.
 */

import {scaleLinear, scaleBand} from 'd3-scale';
import {stack as d3Stack, stackOrderNone, stackOffsetNone} from 'd3-shape';
import type {SeriesDef, ChartScale, ResolvedPoint, SeriesContext} from './types';

export interface LayoutInput {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesDef[];
  width: number;
  height: number;
}

export interface LayoutResult {
  xScale: ChartScale;
  yScale: ReturnType<typeof scaleLinear<number, number>>;
  resolved: Map<string, ResolvedPoint[]>;
}

export function computeLayout({data, xKey, series, width, height}: LayoutInput): LayoutResult {
  // ─── 1. X scale ──────────────────────────────────────────────────────
  const xValues = data.map(d => d[xKey]);
  const isNumericX = xValues.length > 0 && xValues.every(v => typeof v === 'number');

  let xScale: ChartScale;
  if (isNumericX) {
    const nums = xValues as number[];
    xScale = scaleLinear().domain([Math.min(...nums), Math.max(...nums)]).range([0, width]).nice();
  } else {
    xScale = scaleBand<string>().domain(xValues.map(String)).range([0, width]).padding(0.2);
  }

  // ─── 2. Y domain from all series dataKeys ────────────────────────────
  const allKeys = new Set<string>();
  let includeZero = false;
  for (const s of series) {
    for (const k of s.dataKeys) allKeys.add(k);
    if (s.layout.includeZero) includeZero = true;
  }

  let yMin = Infinity, yMax = -Infinity;
  for (const d of data) {
    for (const k of allKeys) {
      const v = d[k];
      if (typeof v === 'number') {
        if (v < yMin) yMin = v;
        if (v > yMax) yMax = v;
      }
    }
  }
  if (includeZero) {
    if (yMin > 0) yMin = 0;
    if (yMax < 0) yMax = 0;
  }
  const yScale = scaleLinear().domain([yMin, yMax]).range([height, 0]).nice();

  // ─── 3. Stacking ─────────────────────────────────────────────────────
  const stackGroups = new Map<string, string[]>();
  for (const s of series) {
    if (s.layout.stack) {
      const group = stackGroups.get(s.layout.stack) ?? [];
      group.push(s.dataKeys[0]);
      stackGroups.set(s.layout.stack, group);
    }
  }

  const stackedData = new Map<string, {y0: number; y1: number}[]>();
  for (const [, keys] of stackGroups) {
    const stackGen = d3Stack<Record<string, unknown>>()
      .keys(keys).order(stackOrderNone).offset(stackOffsetNone);
    const stacked = stackGen(data);
    for (const layer of stacked) {
      stackedData.set(layer.key, layer.map(d => ({y0: d[0], y1: d[1]})));
    }
  }

  // ─── 4. Bar grouping ─────────────────────────────────────────────────
  const barGroups = new Map<string, string[]>();
  for (const s of series) {
    if (s.type === 'bar' && s.layout.group && !s.layout.stack) {
      const group = barGroups.get(s.layout.group) ?? [];
      group.push(s.key);
      barGroups.set(s.layout.group, group);
    }
  }

  // ─── 5. Resolve each series ──────────────────────────────────────────
  const ctx: SeriesContext = {data, xKey, xScale, yScale, width, height};
  const resolved = new Map<string, ResolvedPoint[]>();

  for (const s of series) {
    const stackOffsets = stackedData.get(s.dataKeys[0]);

    let groupInfo: {index: number; count: number} | undefined;
    if (s.layout.group) {
      const groupKeys = barGroups.get(s.layout.group);
      if (groupKeys) {
        groupInfo = {index: groupKeys.indexOf(s.key), count: groupKeys.length};
      }
    }

    const points = s.resolve(ctx, stackOffsets, groupInfo);
    resolved.set(s.key, points);
  }

  return {xScale, yScale, resolved};
}
