// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @output Sankey chart types — nodes, links, layout, and context
 * @position Foundation types consumed by all Sankey sub-components
 */

/** A node in the Sankey diagram */
export interface SankeyNodeDatum {
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
export interface SankeyLinkDatum {
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Flow value */
  value: number;
}

/**
 * Column definition.
 * Simple form: string[] (just node IDs).
 * Rich form: object with IDs, optional label, and type.
 */
export interface SankeyColumnDef {
  /** Node IDs in this column */
  ids: string[];
  /** Column header label (rendered below the column) */
  label?: string;
}

/** Columns can be simple string arrays or rich definitions */
export type SankeyColumn = string[] | SankeyColumnDef;

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

/** Resolved column info exposed to children */
export interface SankeyColumnLayout {
  /** X position of this column */
  x: number;
  /** Column header label (if provided) */
  label?: string;
  /** Node IDs in this column */
  ids: string[];
}

/** Context provided by SankeyChart to children */
export interface SankeyContext {
  nodes: SankeyNodeLayout[];
  links: SankeyLinkLayout[];
  columns: SankeyColumnLayout[];
  width: number;
  height: number;
  valueScale: number;
  maxValue: number;
  nodeWidth: number;
  /** Global node color override (CSS string) — when set, all nodes use this color */
  nodeColor?: string;
}
