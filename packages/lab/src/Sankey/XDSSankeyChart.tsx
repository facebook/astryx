/**
 * @file XDSSankeyChart.tsx
 * @output Root Sankey container — computes layout and provides context
 * @position Parent component; all Sankey marks are children
 *
 * When columns × minColumnWidth exceeds the container, the chart
 * scrolls horizontally rather than squishing columns together.
 */

import {
  type ReactNode,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import {SankeyProvider} from './SankeyContext';
import {computeLayout} from './layout';
import type {SankeyNode, SankeyLink} from './types';

export interface XDSSankeyChartProps {
  /** Node definitions */
  nodes: SankeyNode[];
  /** Link definitions */
  links: SankeyLink[];
  /** Explicit column assignment — array of arrays of node IDs */
  columns?: string[][];
  /** Chart height in px (default: 320) */
  height?: number;
  /** Node bar width in px (default: 3) */
  nodeWidth?: number;
  /** Vertical gap between sibling nodes (default: 14) */
  nodeGap?: number;
  /**
   * Minimum width per column in px (default: 160).
   * When total min width exceeds the container, horizontal scrolling activates.
   */
  minColumnWidth?: number;
  /** Chart contents */
  children: ReactNode;
}

/**
 * Root component for Sankey/flow diagrams.
 *
 * Computes layout from nodes + links, exposes positions via context.
 * Width is responsive (fills container) but enforces minColumnWidth
 * to prevent squished layouts — scrolls horizontally when needed.
 *
 * @example
 * ```tsx
 * <XDSSankeyChart nodes={nodes} links={links} columns={columns}>
 *   <XDSSankeyLink />
 *   <XDSSankeyNode />
 *   <XDSSankeyLabel />
 * </XDSSankeyChart>
 * ```
 */
export function XDSSankeyChart({
  nodes,
  links,
  columns,
  height = 320,
  nodeWidth = 3,
  nodeGap = 14,
  minColumnWidth = 160,
  children,
}: XDSSankeyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const resolvedColumns = useMemo(() => {
    if (columns) return columns;
    // Compute once for column count — layout.ts will also compute but
    // we need the count here for min-width calculation
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
        colMap.set(tgt, Math.max(colMap.get(tgt) || 0, col + 1));
        inDegree.set(tgt, (inDegree.get(tgt) || 0) - 1);
        if (inDegree.get(tgt) === 0) queue.push(tgt);
      }
    }
    const maxCol = Math.max(...Array.from(colMap.values()), 0);
    const cols: string[][] = Array.from({length: maxCol + 1}, () => []);
    nodes.forEach(n => {
      cols[colMap.get(n.id) || 0].push(n.id);
    });
    return cols;
  }, [nodes, links, columns]);

  const colCount = resolvedColumns.length;
  const minWidth = colCount * minColumnWidth;
  const chartWidth = Math.max(containerWidth, minWidth);
  const needsScroll = containerWidth > 0 && chartWidth > containerWidth;

  const layout = useMemo(() => {
    if (containerWidth === 0) return null;
    return computeLayout(nodes, links, {
      width: chartWidth,
      height,
      nodeWidth,
      nodeGap,
      columns: resolvedColumns,
    });
  }, [
    nodes,
    links,
    chartWidth,
    height,
    nodeWidth,
    nodeGap,
    resolvedColumns,
    containerWidth,
  ]);

  const ctx = useMemo(() => {
    if (!layout) return null;
    return {
      nodes: layout.nodes,
      links: layout.links,
      columnXs: layout.columnXs,
      width: chartWidth,
      height,
      valueScale: layout.valueScale,
      maxValue: layout.maxValue,
      nodeWidth,
    };
  }, [layout, chartWidth, height, nodeWidth]);

  return (
    <div ref={containerRef} style={{width: '100%'}}>
      {ctx && (
        <div
          style={
            needsScroll ? {overflowX: 'auto', overflowY: 'hidden'} : undefined
          }>
          <svg
            width={chartWidth}
            height={height}
            style={{overflow: 'visible', display: 'block'}}>
            <SankeyProvider value={ctx}>{children}</SankeyProvider>
          </svg>
        </div>
      )}
    </div>
  );
}

XDSSankeyChart.displayName = 'XDSSankeyChart';
