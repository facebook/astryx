// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layout.ts
 * @output Pure layout algorithm — computes node and link positions
 * @position Core logic; consumed by SankeyChart during render
 *
 * Accepts columns as either string[][] (simple) or SankeyColumnDef[]
 * (with labels). Reserves margin for labels and column headers.
 */

import type {
  SankeyNodeDatum,
  SankeyLinkDatum,
  SankeyColumn,
  SankeyColumnDef,
  SankeyNodeLayout,
  SankeyLinkLayout,
  SankeyColumnLayout,
} from './types';

const DEFAULT_PALETTE: Array<[number, number, number]> = [
  [0.65, 0.2, 270],
  [0.6, 0.17, 235],
  [0.62, 0.16, 190],
  [0.64, 0.18, 155],
  [0.58, 0.15, 40],
  [0.55, 0.14, 350],
  [0.54, 0.15, 20],
  [0.56, 0.13, 300],
];

export interface LayoutOptions {
  width: number;
  height: number;
  nodeWidth?: number;
  nodeGap?: number;
  labelMargin?: number;
  columns?: SankeyColumn[];
}

/** Normalize column input to the rich format */
function normalizeColumns(cols: SankeyColumn[]): SankeyColumnDef[] {
  return cols.map(c => (Array.isArray(c) ? {ids: c} : c));
}

function autoColumns(
  nodes: SankeyNodeDatum[],
  links: SankeyLinkDatum[],
): SankeyColumnDef[] {
  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();
  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    outEdges.set(n.id, []);
  });
  links.forEach(l => {
    inDegree.set(l.target, (inDegree.get(l.target) || 0) + 1);
    outEdges.get(l.source)?.push(l.target);
  });

  const colMap = new Map<string, number>();
  const queue: string[] = [];
  nodes.forEach(n => {
    if (inDegree.get(n.id) === 0) {
      queue.push(n.id);
      colMap.set(n.id, 0);
    }
  });

  while (queue.length) {
    const id = queue.shift();
    if (id == null) {
      break;
    }
    const col = colMap.get(id) ?? 0;
    for (const tgt of outEdges.get(id) || []) {
      const newCol = col + 1;
      colMap.set(tgt, Math.max(colMap.get(tgt) || 0, newCol));
      inDegree.set(tgt, (inDegree.get(tgt) || 0) - 1);
      if (inDegree.get(tgt) === 0) {
        queue.push(tgt);
      }
    }
  }

  const maxCol = Math.max(...Array.from(colMap.values()), 0);
  const columns: SankeyColumnDef[] = Array.from({length: maxCol + 1}, () => ({
    ids: [] as string[],
  }));
  nodes.forEach(n => {
    columns[colMap.get(n.id) || 0].ids.push(n.id);
  });
  return columns;
}

export interface LayoutResult {
  nodes: SankeyNodeLayout[];
  links: SankeyLinkLayout[];
  columns: SankeyColumnLayout[];
  valueScale: number;
  maxValue: number;
}

export function computeLayout(
  nodes: SankeyNodeDatum[],
  links: SankeyLinkDatum[],
  options: LayoutOptions,
): LayoutResult {
  const {
    width,
    height,
    nodeWidth = 20,
    nodeGap = 14,
    labelMargin = 28,
  } = options;

  const colDefs = options.columns
    ? normalizeColumns(options.columns)
    : autoColumns(nodes, links);
  const colCount = colDefs.length;
  const hasHeaders = colDefs.some(c => c.label);
  const headerMargin = hasHeaders ? 20 : 0;

  const nodeMap = new Map<string, SankeyNodeDatum>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Usable height after reserving space for labels and headers
  const usableHeight = height - labelMargin - 16 - headerMargin;

  // Scale based on largest column
  let maxColValue = 0;
  colDefs.forEach(col => {
    const total = col.ids.reduce(
      (s, id) => s + (nodeMap.get(id)?.value || 0),
      0,
    );
    if (total > maxColValue) {
      maxColValue = total;
    }
  });

  const maxNodes = Math.max(...colDefs.map(c => c.ids.length));
  const valueScale = (usableHeight - (maxNodes - 1) * nodeGap) / maxColValue;
  const colSpacing = colCount > 1 ? (width - nodeWidth) / (colCount - 1) : 0;

  const columnLayouts: SankeyColumnLayout[] = [];
  const layoutNodes = new Map<string, SankeyNodeLayout>();
  let colorIdx = 0;

  colDefs.forEach((col, ci) => {
    const x = ci * colSpacing;
    columnLayouts.push({x, label: col.label, ids: col.ids});

    const totalH = col.ids.reduce(
      (s, id) => s + (nodeMap.get(id)?.value || 0) * valueScale,
      0,
    );
    const totalGap = (col.ids.length - 1) * nodeGap;
    let y = labelMargin + (usableHeight - totalH - totalGap) / 2;

    col.ids.forEach(id => {
      const node = nodeMap.get(id);
      if (!node) {
        return;
      }
      const h = node.value * valueScale;
      const color =
        node.color || DEFAULT_PALETTE[colorIdx % DEFAULT_PALETTE.length];
      colorIdx++;

      layoutNodes.set(id, {
        id,
        label: node.label,
        value: node.value,
        color,
        x,
        y,
        width: nodeWidth,
        height: h,
        column: ci,
        _sourceOffset: 0,
        _targetOffset: 0,
      });
      y += h + nodeGap;
    });
  });

  const layoutLinks: SankeyLinkLayout[] = links.flatMap(link => {
    const src = layoutNodes.get(link.source);
    const tgt = layoutNodes.get(link.target);
    if (!src || !tgt) {
      return [];
    }
    const lh = link.value * valueScale;
    const sourceY = src.y + src._sourceOffset;
    const targetY = tgt.y + tgt._targetOffset;
    src._sourceOffset += lh;
    tgt._targetOffset += lh;
    return [
      {
        source: src,
        target: tgt,
        value: link.value,
        height: lh,
        sourceY,
        targetY,
      },
    ];
  });

  return {
    nodes: Array.from(layoutNodes.values()),
    links: layoutLinks,
    columns: columnLayouts,
    valueScale,
    maxValue: maxColValue,
  };
}
