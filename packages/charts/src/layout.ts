// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layout.ts
 * @output Computes scales, stacking, grouping, then delegates to each series.resolve()
 * @position Called by Chart root — the single layout pass
 *
 * The layout engine does NOT know about specific mark types.
 * It handles cross-series coordination (scales, stacking, grouping)
 * then calls each series' own resolve() method.
 */

import {scaleLinear, scaleBand} from 'd3-scale';
import {stack as d3Stack, stackOrderNone, stackOffsetNone} from 'd3-shape';
import type {
  SeriesDef,
  ChartScale,
  ResolvedPoint,
  SeriesContext,
  YBaseline,
} from './types';

/**
 * Fraction of the data range added as padding above/below for continuous-only
 * charts (no bar/area zero baseline), so endpoints and curve overshoot don't
 * glue to the plot edges.
 */
const CONTINUOUS_HEADROOM = 0.08;

export interface LayoutInput {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesDef[];
  width: number;
  height: number;
  /** How the y-domain is derived when `yDomain` is not provided. Default 'auto'. */
  yBaseline?: YBaseline;
  /** Explicit y-domain [min, max]. Authoritative — no baseline/headroom/nice(). */
  yDomain?: [number, number];
  /**
   * Explicit x-domain [min, max] for numeric/linear x. Authoritative and honored
   * even when `data` is empty (stable streaming window). Ignored for band scales.
   */
  xDomain?: [number, number];
}

export interface LayoutResult {
  xScale: ChartScale;
  yScale: ReturnType<typeof scaleLinear<number, number>>;
  resolved: Map<string, ResolvedPoint[]>;
}

export function computeLayout({
  data,
  xKey,
  series,
  width,
  height,
  yBaseline,
  yDomain,
  xDomain,
}: LayoutInput): LayoutResult {
  // ─── 1. X scale ──────────────────────────────────────────────────────
  const xValues = data.map(d => d[xKey]);
  const isNumericX =
    xValues.length > 0 && xValues.every(v => typeof v === 'number');

  let xScale: ChartScale;
  if (xDomain) {
    // Explicit domain is authoritative (no .nice()) — enables a stable
    // streaming window and a valid scale even when `data` is empty.
    xScale = scaleLinear().domain(xDomain).range([0, width]);
  } else if (isNumericX) {
    const nums = xValues as number[];
    xScale = scaleLinear()
      .domain([Math.min(...nums), Math.max(...nums)])
      .range([0, width])
      .nice();
  } else {
    xScale = scaleBand<string>()
      .domain(xValues.map(String))
      .range([0, width])
      .padding(0.2);
  }

  // ─── 2. Y domain from all series dataKeys ────────────────────────────
  const allKeys = new Set<string>();
  let includeZero = false;
  for (const s of series) {
    for (const k of s.dataKeys) {
      allKeys.add(k);
    }
    if (s.layout.includeZero) {
      includeZero = true;
    }
  }

  // Collect which keys are stacked together so we can compute stacked extents
  const stackGroupKeys = new Map<string, string[]>();
  for (const s of series) {
    if (s.layout.stack) {
      const group = stackGroupKeys.get(s.layout.stack) ?? [];
      group.push(s.dataKeys[0]);
      stackGroupKeys.set(s.layout.stack, group);
    }
  }

  let yMin = Infinity,
    yMax = -Infinity;

  // For stacked series, compute the sum at each data point
  const stackedKeys = new Set<string>();
  for (const [, keys] of stackGroupKeys) {
    for (const k of keys) {
      stackedKeys.add(k);
    }
    for (const d of data) {
      let sum = 0;
      for (const k of keys) {
        const v = d[k];
        if (typeof v === 'number') {
          sum += v;
        }
      }
      if (sum > yMax) {
        yMax = sum;
      }
      if (sum < yMin) {
        yMin = sum;
      }
    }
  }

  // For non-stacked series, use individual values
  for (const d of data) {
    for (const k of allKeys) {
      if (stackedKeys.has(k)) {
        continue;
      } // already handled above
      const v = d[k];
      if (typeof v === 'number') {
        if (v < yMin) {
          yMin = v;
        }
        if (v > yMax) {
          yMax = v;
        }
      }
    }
  }

  // ─── Resolve the final y-domain ──────────────────────────────────────
  let yDomainFinal: [number, number];
  let applyNice = true;

  if (yDomain) {
    // Caller owns the exact domain (e.g. zoom/streaming). No baseline,
    // headroom, or .nice() — rounding here would cause visual ratcheting.
    yDomainFinal = yDomain;
    applyNice = false;
  } else {
    // Degenerate: no finite values (empty data / all non-numeric).
    if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
      yMin = 0;
      yMax = 1;
    }
    // Degenerate: zero range (single point / all-equal) — expand so the mark
    // is visible and ticks are sane.
    if (yMin === yMax) {
      const pad = Math.abs(yMin) * 0.5 || 1;
      yMin -= pad;
      yMax += pad;
    }

    const mode: YBaseline = yBaseline ?? 'auto';
    if (mode === 'zero') {
      const abs = Math.max(Math.abs(yMin), Math.abs(yMax));
      yMin = -abs;
      yMax = abs;
    } else if (mode === 'data') {
      // Tight fit — no zero forcing, no headroom.
    } else {
      // 'auto': bar/area marks pin an honest zero baseline; continuous-only
      // charts get headroom so endpoints/overshoot don't glue to the edges.
      if (includeZero) {
        if (yMin > 0) {
          yMin = 0;
        }
        if (yMax < 0) {
          yMax = 0;
        }
      } else {
        const pad = (yMax - yMin || 1) * CONTINUOUS_HEADROOM;
        yMin -= pad;
        yMax += pad;
      }
    }
    yDomainFinal = [yMin, yMax];
  }

  const yScaleBase = scaleLinear().domain(yDomainFinal).range([height, 0]);
  const yScale = applyNice ? yScaleBase.nice() : yScaleBase;

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

  // ─── 4. Bar grouping ─────────────────────────────────────────────────
  // Bars can be grouped (side-by-side) whether or not they are stacked.
  // For grouped stacks, each unique stack group name within the same bar
  // group gets its own sub-band. For ungrouped non-stacked bars with a
  // group key, each series gets its own sub-band.
  const barGroups = new Map<string, string[]>();
  for (const s of series) {
    if (s.type === 'bar' && s.layout.group) {
      const group = barGroups.get(s.layout.group) ?? [];
      // For grouped stacks: use the stack name as the group slot identifier
      // so all series in the same stack share one slot.
      const slotKey = s.layout.stack ?? s.key;
      if (!group.includes(slotKey)) {
        group.push(slotKey);
      }
      barGroups.set(s.layout.group, group);
    }
  }

  // ─── 5. Resolve each series ──────────────────────────────────────────
  const ctx: SeriesContext = {data, xKey, xScale, yScale, width, height};
  const resolved = new Map<string, ResolvedPoint[]>();

  // Determine which series is the topmost in each stack group
  const stackTopKeys = new Set<string>();
  for (const [, keys] of stackGroups) {
    // Last key in the stack group is rendered on top
    if (keys.length > 0) {
      stackTopKeys.add(keys[keys.length - 1]);
    }
  }

  for (let seriesIndex = 0; seriesIndex < series.length; seriesIndex++) {
    const s = series[seriesIndex];
    // Assign a collision-free identity from array position. Two series sharing
    // a dataKey (and thus `key`) still get distinct uids, so neither the
    // resolved map nor React keys silently drop one of them.
    s._uid = `${seriesIndex}:${s.key}`;
    const stackOffsets = stackedData.get(s.dataKeys[0]);

    // Mark whether this series is the topmost in its stack
    if (s.layout.stack) {
      s._isTopOfStack = stackTopKeys.has(s.dataKeys[0]);
    } else {
      s._isTopOfStack = true;
    }

    let groupInfo: {index: number; count: number} | undefined;
    if (s.layout.group) {
      const groupKeys = barGroups.get(s.layout.group);
      if (groupKeys) {
        // For grouped stacks, the slot key is the stack name
        const slotKey = s.layout.stack ?? s.key;
        groupInfo = {
          index: groupKeys.indexOf(slotKey),
          count: groupKeys.length,
        };
      }
    }

    const points = s.resolve(ctx, stackOffsets, groupInfo);
    resolved.set(s._uid, points);
  }

  return {xScale, yScale, resolved};
}
