/**
 * @file types.ts
 * @output Chart types, scale context, and margin convention
 * @position Foundation types consumed by all chart sub-components
 */

import type {ScaleLinear, ScaleBand, ScaleTime} from 'd3-scale';

/** Margin convention for chart SVG */
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Any d3 scale that maps a domain to a pixel range */
export type ChartScale =
  | ScaleLinear<number, number>
  | ScaleBand<string>
  | ScaleTime<number, number>;

/** Scale context provided by XDSChart to children */
export interface ChartContext {
  /** Inner width (SVG width minus margins) */
  width: number;
  /** Inner height (SVG height minus margins) */
  height: number;
  /** Margin offsets */
  margin: ChartMargin;
  /** The full dataset */
  data: Record<string, unknown>[];
  /** X scale — band for categorical, linear/time for continuous */
  xScale: ChartScale;
  /** Y scale — typically linear */
  yScale: ScaleLinear<number, number>;
}
