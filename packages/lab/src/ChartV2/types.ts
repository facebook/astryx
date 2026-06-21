// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @output Core types for the v2 chart architecture
 * @position Foundation — consumed by layout, renderers, and interactions
 */

import type {ReactNode} from 'react';
import type {ScaleLinear, ScaleBand} from 'd3-scale';

export type ChartScale = ScaleLinear<number, number> | ScaleBand<string>;

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Resolved pixel position for a single data point in a series */
export interface ResolvedPoint {
  /** Pixel x in plot area coordinates */
  px: number;
  /** Pixel y in plot area coordinates (top of mark) */
  py: number;
  /** Pixel y baseline (bottom of mark) — differs from py when stacked */
  py0: number;
  /** Index into the data array */
  dataIndex: number;
}

/** Context passed to resolve() and render() on each series */
export interface SeriesContext {
  data: Record<string, unknown>[];
  xKey: string;
  xScale: ChartScale;
  yScale: ScaleLinear<number, number>;
  /** Width of the plot area */
  width: number;
  /** Height of the plot area */
  height: number;
}

/**
 * The standardized shape every mark helper returns.
 * Each mark type is self-contained: it knows how to resolve positions
 * and how to render itself. The chart root just iterates and calls.
 */
export interface SeriesDef {
  /** Mark type identifier */
  readonly type: string;
  /** Unique key for this series (typically the dataKey) */
  readonly key: string;
  /** Data keys this series reads from — used to compute y domain */
  readonly dataKeys: string[];
  /** Whether this series is the topmost in its stack (set during layout) */
  _isTopOfStack?: boolean;
  /** Static color for legend display. Undefined if color is dynamic (accessor function). */
  readonly color?: string;
  /** Human-readable label for legend. Falls back to key if not provided. */
  readonly label?: string;
  /** Layout hints the chart root uses for cross-series coordination */
  readonly layout: {
    /** Stack group — series with same stack accumulate */
    stack?: string;
    /** Bar group — series with same group subdivide bandwidth */
    group?: string;
    /** Whether this series contributes to y-domain zero inclusion */
    includeZero?: boolean;
  };
  /**
   * Resolve pixel positions for each data point.
   * Called by the chart root during the layout pass.
   * Receives pre-computed stack offsets if stacked.
   */
  resolve(
    ctx: SeriesContext,
    stackOffsets?: {y0: number; y1: number}[],
    groupInfo?: {index: number; count: number},
  ): ResolvedPoint[];
  /**
   * Render the mark given resolved positions.
   * Called by the chart root during the render pass.
   * Returns SVG elements (or manages its own canvas for WebGL).
   */
  render(resolved: ResolvedPoint[], ctx: SeriesContext): ReactNode;
}

/** Resolved positions for all series */
export type ResolvedPositions = Map<string, ResolvedPoint[]>;

/** Pointer event normalized to plot-area coordinates */
export interface ChartPointerEvent {
  x: number;
  y: number;
  nearest: (ResolvedPoint & {seriesKey: string}) | null;
  active: boolean;
}

/** Context provided by Chart to interaction children */
export interface ChartV2Context {
  width: number;
  height: number;
  margin: ChartMargin;
  data: Record<string, unknown>[];
  xKey: string;
  xScale: ChartScale;
  yScale: ScaleLinear<number, number>;
  resolved: Map<string, ResolvedPoint[]>;
  onPointer: (handler: (e: ChartPointerEvent) => void) => () => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

/**
 * Series mark types that are utility / annotation marks rather than primary
 * data. They're skipped from chrome surfaces (legend, tooltip rows) since
 * they don't represent values the user is comparing.
 */
export const UTILITY_MARK_TYPES: ReadonlySet<string> = new Set([
  'referenceLine',
  'errorBar',
  'band',
]);

/** True if the series type is a utility / annotation mark. */
export function isUtilityMarkType(type: string): boolean {
  return UTILITY_MARK_TYPES.has(type);
}
