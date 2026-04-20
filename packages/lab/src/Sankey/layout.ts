/**
 * @file layout.ts
 * @output Pure layout algorithm — computes node and link positions
 * @position Core logic; consumed by XDSSankeyChart during render
 *
 * Simplified Sankey layout: nodes placed in explicit columns,
 * vertical positions centered per column, link offsets cumulative.
 */

import type {
  SankeyNode,
  SankeyLink,
  SankeyNodeLayout,
  SankeyLinkLayout,
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
  columns?: string[][];
}

function autoColumns(nodes: SankeyNode[], links: SankeyLink[]): string[][] {
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
    const id = queue.shift()!;
    const col = colMap.get(id)!;
    for (const tgt of outEdges.get(id) || []) {
      const newCol = col + 1;
      colMap.set(tgt, Math.max(colMap.get(tgt) || 0, newCol));
      inDegree.set(tgt, (inDegree.get(tgt) || 0) - 1);
      if (inDegree.get(tgt) === 0) queue.push(tgt);
    }
  }

  const maxCol = Math.max(...Array.from(colMap.values()), 0);
  const columns: string[][] = Array.from({length: maxCol + 1}, () => []);
  nodes.forEach(n => {
    columns[colMap.get(n.id) || 0].push(n.id);
  });
  return columns;
}

export function computeLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
  options: LayoutOptions,
): {
  nodes: SankeyNodeLayout[];
  links: SankeyLinkLayout[];
  valueScale: number;
  maxValue: number;
} {
  const {width, height, nodeWidth = 3, nodeGap = 14} = options;
  const columns = options.columns || autoColumns(nodes, links);
  const colCount = columns.length;

  const nodeMap = new Map<string, SankeyNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Scale based on largest column
  let maxColValue = 0;
  columns.forEach(col => {
    const total = col.reduce((s, id) => s + (nodeMap.get(id)?.value || 0), 0);
    if (total > maxColValue) maxColValue = total;
  });

  const maxNodes = Math.max(...columns.map(c => c.length));
  const valueScale = (height - (maxNodes - 1) * nodeGap) / maxColValue;
  const colSpacing = colCount > 1 ? (width - nodeWidth) / (colCount - 1) : 0;

  const layoutNodes = new Map<string, SankeyNodeLayout>();
  let colorIdx = 0;

  columns.forEach((col, ci) => {
    const x = ci * colSpacing;
    const totalH = col.reduce(
      (s, id) => s + (nodeMap.get(id)?.value || 0) * valueScale,
      0,
    );
    const totalGap = (col.length - 1) * nodeGap;
    let y = (height - totalH - totalGap) / 2;

    col.forEach(id => {
      const node = nodeMap.get(id);
      if (!node) return;
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

  const layoutLinks: SankeyLinkLayout[] = links.map(link => {
    const src = layoutNodes.get(link.source)!;
    const tgt = layoutNodes.get(link.target)!;
    const lh = link.value * valueScale;
    const sourceY = src.y + src._sourceOffset;
    const targetY = tgt.y + tgt._targetOffset;
    src._sourceOffset += lh;
    tgt._targetOffset += lh;
    return {
      source: src,
      target: tgt,
      value: link.value,
      height: lh,
      sourceY,
      targetY,
    };
  });

  return {
    nodes: Array.from(layoutNodes.values()),
    links: layoutLinks,
    valueScale,
    maxValue: maxColValue,
  };
}
