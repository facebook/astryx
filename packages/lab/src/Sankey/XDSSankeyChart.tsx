/**
 * @file XDSSankeyChart.tsx
 * @output Root Sankey container — computes layout and provides context
 * @position Parent component; all Sankey marks are children
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
  /** Chart contents */
  children: ReactNode;
}

/**
 * Root component for Sankey/flow diagrams.
 *
 * Computes layout from nodes + links, exposes positions via context.
 * Width is responsive (fills container).
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
  children,
}: XDSSankeyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    if (width === 0) return null;
    return computeLayout(nodes, links, {
      width,
      height,
      nodeWidth,
      nodeGap,
      columns,
    });
  }, [nodes, links, width, height, nodeWidth, nodeGap, columns]);

  const ctx = useMemo(() => {
    if (!layout) return null;
    return {
      nodes: layout.nodes,
      links: layout.links,
      width,
      height,
      valueScale: layout.valueScale,
      maxValue: layout.maxValue,
    };
  }, [layout, width, height]);

  return (
    <div ref={containerRef} style={{width: '100%'}}>
      {ctx && (
        <svg
          width={width}
          height={height}
          style={{overflow: 'visible', display: 'block'}}>
          <SankeyProvider value={ctx}>{children}</SankeyProvider>
        </svg>
      )}
    </div>
  );
}

XDSSankeyChart.displayName = 'XDSSankeyChart';
