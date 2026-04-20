/**
 * @file XDSSankeyNode.tsx
 * @output Renders node indicators with optional glow
 * @position Visual layer — minimal node presence, letting flows dominate
 *
 * Supports per-node colors (from data) or a uniform override.
 */

import {useSankey} from './SankeyContext';

export interface XDSSankeyNodeProps {
  /** Whether to show the glow effect behind nodes (default: true) */
  glow?: boolean;
  /**
   * Override all node colors with a single CSS color.
   * When omitted, uses each node's individual color from data.
   */
  color?: string;
}

function oklch(c: [number, number, number], alpha: number): string {
  return `oklch(${c[0]} ${c[1]} ${c[2]} / ${alpha})`;
}

/**
 * Renders all node indicators in the Sankey chart.
 *
 * Each node is a thin vertical bar with an optional soft glow.
 * Use the `color` prop to override all nodes to a single color,
 * or omit it to use per-node colors from the data.
 */
export function XDSSankeyNode({glow = true, color}: XDSSankeyNodeProps) {
  const {nodes} = useSankey();

  return (
    <g>
      {nodes.map(node => {
        const fill = color || oklch(node.color, 0.9);
        const glowFill = color ? color : oklch(node.color, 0.12);

        return (
          <g key={node.id}>
            {glow && (
              <rect
                x={node.x - 3}
                y={node.y - 1}
                width={node.width + 6}
                height={node.height + 2}
                rx={4}
                fill={glowFill}
                opacity={color ? 0.12 : 1}
              />
            )}
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rx={1.5}
              fill={fill}
            />
          </g>
        );
      })}
    </g>
  );
}

XDSSankeyNode.displayName = 'XDSSankeyNode';
