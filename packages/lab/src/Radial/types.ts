// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @output Radial chart types and context
 * @position Foundation types consumed by all radial sub-components
 */

/** Radial chart mode */
export type RadialMode = 'spider' | 'pie';

/** Radial context provided by RadialChart to children */
export interface RadialContext {
  /** Center x pixel position */
  cx: number;
  /** Center y pixel position */
  cy: number;
  /** Outer radius in pixels */
  radius: number;
  /** Inner radius in pixels (>0 for donut) */
  innerRadius: number;
  /** The full dataset */
  data: Record<string, unknown>[];
  /** Chart mode */
  mode: RadialMode;

  // Spider-specific
  /** Axis keys for spider charts */
  axes?: string[];
  /** Angle for each axis in radians */
  angleByAxis?: Map<string, number>;
  /** Radius scale: maps a normalized value (0-1) to pixel distance from center */
  radiusScale?: (t: number) => number;
  /** Domain [min, max] per axis for spider normalization */
  axisDomains?: Map<string, [number, number]>;

  // Pie-specific
  /** Computed slices with start/end angles */
  slices?: Array<{
    key: string;
    value: number;
    startAngle: number;
    endAngle: number;
    percentage: number;
  }>;
}
