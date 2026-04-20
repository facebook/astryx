/**
 * @file XDSSankeyNode.tsx
 * @output Renders thin node indicators with subtle glow
 * @position Visual layer — minimal node presence, letting flows dominate
 *
 * Nodes are intentionally thin (3px default). The visual weight is in the
 * flowing ribbons, not the nodes. A subtle glow rect provides depth.
 */

import {useSankey} from './SankeyContext';

export interface XDSSankeyNodeProps {
  /** Whether to show the glow effect behind nodes (default: true) */
  glow?: boolean;
}

function oklch(color: [number, number, number], alpha: number): string {
  return `oklch(${color[0]} ${color[1]} ${color[2]} / ${alpha})`;
}

/**
 * Renders all node indicators in the Sankey chart.
 *
 * Each node is a thin vertical bar with an optional soft glow behind it.
 * The bar marks where flows converge/diverge; the color matches the node identity.
 */
export function XDSSankeyNode({glow = true}: XDSSankeyNodeProps) {
  const {nodes} = useSankey();

  return (
    <g>
      {nodes.map(node => (
        <g key={node.id}>
          {glow && (
            <rect
              x={node.x - 3}
              y={node.y - 1}
              width={node.width + 6}
              height={node.height + 2}
              rx={4}
              fill={oklch(node.color, 0.12)}
            />
          )}
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            rx={1.5}
            fill={oklch(node.color, 0.9)}
          />
        </g>
      ))}
    </g>
  );
}

XDSSankeyNode.displayName = 'XDSSankeyNode';
