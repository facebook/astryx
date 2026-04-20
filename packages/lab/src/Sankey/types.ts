/**
 * @file types.ts
 * @output Sankey chart types — nodes, links, layout, and context
 * @position Foundation types consumed by all Sankey sub-components
 */

/** A node in the Sankey diagram */
export interface SankeyNode {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Total value flowing through this node */
  value: number;
  /** Color in oklch format [lightness, chroma, hue] */
  color?: [number, number, number];
}

/** A link (flow) between two nodes */
export interface SankeyLink {
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Flow value */
  value: number;
}

/** Computed layout position for a node */
export interface SankeyNodeLayout {
  id: string;
  label: string;
  value: number;
  color: [number, number, number];
  x: number;
  y: number;
  width: number;
  height: number;
  column: number;
  _sourceOffset: number;
  _targetOffset: number;
}

/** Computed layout position for a link */
export interface SankeyLinkLayout {
  source: SankeyNodeLayout;
  target: SankeyNodeLayout;
  value: number;
  height: number;
  sourceY: number;
  targetY: number;
}

/** Context provided by XDSSankeyChart to children */
export interface SankeyContext {
  nodes: SankeyNodeLayout[];
  links: SankeyLinkLayout[];
  width: number;
  height: number;
  valueScale: number;
  maxValue: number;
}
