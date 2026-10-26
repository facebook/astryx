// Copyright (c) Meta Platforms, Inc. and affiliates.

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

/** Resolved data coordinates from pixel position */
export interface DataPoint {
  /** X value in data space (number for linear, string for band) */
  x: number | string | null;
  /** Y value in data space */
  y: number;
  /** Pixel x within the plot area */
  px: number;
  /** Pixel y within the plot area */
  py: number;
}

/** Scale context provided by Chart to children */
export interface ChartContext {
  /** Inner width (SVG width minus margins) */
  width: number;
  /** Inner height (SVG height minus margins) */
  height: number;
  /** Margin offsets */
  margin: ChartMargin;
  /** The data key used for x-axis values */
  xKey: string;
  /** The full dataset */
  data: Record<string, unknown>[];
  /** X scale — band for categorical, linear/time for continuous */
  xScale: ChartScale;
  /** Y scale — typically linear */
  yScale: ScaleLinear<number, number>;
  /** Ref to the SVG element — used for coordinate transforms */
  svgRef: React.RefObject<SVGSVGElement | null>;
  /**
   * Convert a pointer event to data coordinates.
   * Handles SVG coordinate transform (margin offset) automatically.
   */
  pointerToData: (e: React.PointerEvent) => DataPoint;
  /**
   * Convert pixel coordinates (relative to plot area) to data values.
   */
  pixelToData: (px: number, py: number) => DataPoint;
}
