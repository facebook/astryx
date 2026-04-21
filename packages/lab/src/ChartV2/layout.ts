/**
 * @file layout.ts
 * @output Computes scales, layout transforms, and resolved positions from data + series
 * @position Called by XDSChart root — the single layout pass
 *
 * Pipeline: data + series → scales → transforms (stack, group, dodge) → resolvedPositions
 */

import {scaleLinear, scaleBand} from 'd3-scale';
import {stack as d3Stack, stackOrderNone, stackOffsetNone} from 'd3-shape';
import type {SeriesConfig, BarConfig, DotConfig, AreaConfig} from './series';
import type {
  ChartScale,
  ResolvedPositions,
  ResolvedPoint,
  ChartMargin,
} from './types';

export interface LayoutInput {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesConfig[];
  width: number;
  height: number;
}

export interface LayoutResult {
  xScale: ChartScale;
  yScale: ReturnType<typeof scaleLinear<number, number>>;
  resolved: ResolvedPositions;
  /** Bar group info: groupId → {keys[], bandwidth per bar} */
  barGroups: Map<string, {keys: string[]; barWidth: number}>;
}

export function computeLayout({
  data,
  xKey,
  series,
  width,
  height,
}: LayoutInput): LayoutResult {
  // ─── 1. Determine x scale ────────────────────────────────────────────
  const xValues = data.map(d => d[xKey]);
  const isNumericX =
    xValues.length > 0 && xValues.every(v => typeof v === 'number');

  let xScale: ChartScale;
  if (isNumericX) {
    const nums = xValues as number[];
    const xMin = Math.min(...nums);
    const xMax = Math.max(...nums);
    xScale = scaleLinear().domain([xMin, xMax]).range([0, width]).nice();
  } else {
    xScale = scaleBand<string>()
      .domain(xValues.map(String))
      .range([0, width])
      .padding(0.2);
  }

  // ─── 2. Collect all y keys and compute y domain ───────────────────────
  const allYKeys = new Set<string>();
  for (const s of series) {
    for (const k of s.keys) allYKeys.add(k);
  }

  let yMin = Infinity;
  let yMax = -Infinity;
  for (const d of data) {
    for (const k of allYKeys) {
      const v = d[k];
      if (typeof v === 'number') {
        if (v < yMin) yMin = v;
        if (v > yMax) yMax = v;
      }
    }
  }
  // Include zero for bar charts
  if (series.some(s => s.type === 'bar' || s.type === 'area')) {
    if (yMin > 0) yMin = 0;
    if (yMax < 0) yMax = 0;
  }

  const yScale = scaleLinear().domain([yMin, yMax]).range([height, 0]).nice();

  // ─── 3. Compute stacking ─────────────────────────────────────────────
  const stackGroups = new Map<string, string[]>();
  for (const s of series) {
    if ((s.type === 'bar' || s.type === 'area') && 'stack' in s && s.stack) {
      const group = stackGroups.get(s.stack) ?? [];
      group.push(s.dataKey);
      stackGroups.set(s.stack, group);
    }
  }

  // d3-stack produces cumulative y0/y1 per series
  const stackedData = new Map<string, {y0: number; y1: number}[]>();
  for (const [, keys] of stackGroups) {
    const stackGen = d3Stack<Record<string, unknown>>()
      .keys(keys)
      .order(stackOrderNone)
      .offset(stackOffsetNone);
    const stacked = stackGen(data);
    for (const layer of stacked) {
      stackedData.set(
        layer.key,
        layer.map(d => ({y0: d[0], y1: d[1]})),
      );
    }
  }

  // ─── 4. Compute bar grouping ─────────────────────────────────────────
  const barGroups = new Map<string, {keys: string[]; barWidth: number}>();
  const groupedBars = new Map<string, string[]>();
  for (const s of series) {
    if (s.type === 'bar' && 'group' in s && s.group && !s.stack) {
      const group = groupedBars.get(s.group) ?? [];
      group.push(s.dataKey);
      groupedBars.set(s.group, group);
    }
  }
  if ('bandwidth' in xScale) {
    const bw = xScale.bandwidth();
    for (const [groupId, keys] of groupedBars) {
      barGroups.set(groupId, {keys, barWidth: bw / keys.length});
    }
  }

  // ─── 5. Resolve positions for every series ────────────────────────────
  const resolved: ResolvedPositions = new Map();

  for (const s of series) {
    const points: ResolvedPoint[] = [];

    switch (s.type) {
      case 'bar': {
        if (!('bandwidth' in xScale)) break;
        const bw = xScale.bandwidth();
        const stacked = stackedData.get(s.dataKey);
        const groupInfo = s.group ? barGroups.get(s.group) : undefined;
        const barWidth = groupInfo ? groupInfo.barWidth : bw;
        const barIndex = groupInfo ? groupInfo.keys.indexOf(s.dataKey) : 0;

        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          const xPos =
            (xScale(String(d[xKey])) ?? 0) + barIndex * barWidth + barWidth / 2;
          let yPos: number;
          let y0Pos: number;
          if (stacked) {
            yPos = yScale(stacked[i].y1);
            y0Pos = yScale(stacked[i].y0);
          } else {
            const v =
              typeof d[s.dataKey] === 'number' ? (d[s.dataKey] as number) : 0;
            yPos = yScale(v);
            y0Pos = yScale(0);
          }
          points.push({px: xPos, py: yPos, py0: y0Pos, dataIndex: i});
        }
        break;
      }

      case 'line':
      case 'area': {
        const stacked =
          s.type === 'area' && s.stack ? stackedData.get(s.dataKey) : undefined;
        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          let px: number;
          if ('bandwidth' in xScale) {
            px = (xScale(String(d[xKey])) ?? 0) + xScale.bandwidth() / 2;
          } else {
            px = xScale(d[xKey] as number);
          }
          let py: number;
          let py0: number;
          if (stacked) {
            py = yScale(stacked[i].y1);
            py0 = yScale(stacked[i].y0);
          } else {
            const v =
              typeof d[s.dataKey] === 'number' ? (d[s.dataKey] as number) : 0;
            py = yScale(v);
            py0 = yScale(0);
          }
          points.push({px, py, py0, dataIndex: i});
        }
        break;
      }

      case 'dot': {
        // TODO: dodge layout goes here
        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          let px: number;
          if ('bandwidth' in xScale) {
            px = (xScale(String(d[xKey])) ?? 0) + xScale.bandwidth() / 2;
          } else {
            px = xScale(d[xKey] as number);
          }
          const v =
            typeof d[s.dataKey] === 'number' ? (d[s.dataKey] as number) : 0;
          points.push({px, py: yScale(v), py0: yScale(0), dataIndex: i});
        }
        break;
      }

      case 'band': {
        // Band has two sets of points (upper/lower) — resolve upper for hit-testing
        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          let px: number;
          if ('bandwidth' in xScale) {
            px = (xScale(String(d[xKey])) ?? 0) + xScale.bandwidth() / 2;
          } else {
            px = xScale(d[xKey] as number);
          }
          const v = typeof d[s.upper] === 'number' ? (d[s.upper] as number) : 0;
          points.push({px, py: yScale(v), py0: yScale(0), dataIndex: i});
        }
        break;
      }

      case 'candlestick': {
        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          let px: number;
          if ('bandwidth' in xScale) {
            px = (xScale(String(d[xKey])) ?? 0) + xScale.bandwidth() / 2;
          } else {
            px = xScale(d[xKey] as number);
          }
          const close =
            typeof d[s.close] === 'number' ? (d[s.close] as number) : 0;
          points.push({px, py: yScale(close), py0: yScale(0), dataIndex: i});
        }
        break;
      }
    }

    // Use dataKey or a generated key for series that don't have one
    const seriesKey =
      'dataKey' in s ? s.dataKey : `${s.type}-${s.keys.join('-')}`;
    resolved.set(seriesKey, points);
  }

  return {xScale, yScale, resolved, barGroups};
}
