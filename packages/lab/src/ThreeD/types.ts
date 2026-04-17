/**
 * @file types.ts
 * @output 3D chart types and context
 * @position Foundation types consumed by all 3D sub-components
 *
 * Uses a simple perspective projection — no WebGL dependency for the
 * coordinate system. Marks can render as projected SVG or WebGL.
 */

/** 3D point in data space */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/** 2D projected point with depth for sorting */
export interface ProjectedPoint {
  px: number;
  py: number;
  depth: number;
}

/** Camera configuration */
export interface Camera {
  /** Rotation around the vertical axis in degrees (default: 30) */
  azimuth: number;
  /** Rotation above the horizontal plane in degrees (default: 20) */
  elevation: number;
  /** Distance from origin — affects perspective strength (default: 5) */
  distance: number;
}

/** 3D context provided by XDS3DChart to children */
export interface ThreeDContext {
  /** Inner width in pixels */
  width: number;
  /** Inner height in pixels */
  height: number;
  /** The full dataset */
  data: Record<string, unknown>[];
  /** Data key for x dimension */
  xKey: string;
  /** Data key for y dimension (vertical) */
  yKey: string;
  /** Data key for z dimension (depth) */
  zKey: string;
  /** Project a 3D data point to 2D screen coordinates */
  project: (x: number, y: number, z: number) => ProjectedPoint;
  /** Domain for x axis [min, max] */
  xDomain: [number, number];
  /** Domain for y axis [min, max] */
  yDomain: [number, number];
  /** Domain for z axis [min, max] */
  zDomain: [number, number];
  /** Camera settings */
  camera: Camera;
}
