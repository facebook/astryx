/**
 * @file types.ts
 * @output Core types for the v2 chart architecture
 * @position Foundation — consumed by layout, renderers, and interactions
 */

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
  /** Pixel y baseline (bottom of mark) — differs from py only when stacked */
  py0: number;
  /** Index into the data array */
  dataIndex: number;
}

/** Resolved positions for all series — the single source of truth */
export type ResolvedPositions = Map<string, ResolvedPoint[]>;

/** Pointer event normalized to plot-area coordinates */
export interface ChartPointerEvent {
  /** Pixel x relative to plot area */
  x: number;
  /** Pixel y relative to plot area */
  y: number;
  /** Nearest resolved point (if within snap radius) */
  nearest: (ResolvedPoint & {seriesKey: string}) | null;
  /** Active (pointer down) */
  active: boolean;
}

/** Context provided by XDSChart to interaction children */
export interface ChartV2Context {
  /** Inner width (after margins) */
  width: number;
  /** Inner height (after margins) */
  height: number;
  margin: ChartMargin;
  /** The full dataset */
  data: Record<string, unknown>[];
  /** X-axis data key */
  xKey: string;
  /** X scale */
  xScale: ChartScale;
  /** Y scale */
  yScale: ScaleLinear<number, number>;
  /** Resolved positions for all series */
  resolved: ResolvedPositions;
  /** Subscribe to pointer events */
  onPointer: (handler: (e: ChartPointerEvent) => void) => () => void;
  /** SVG ref for coordinate transforms */
  svgRef: React.RefObject<SVGSVGElement | null>;
}
