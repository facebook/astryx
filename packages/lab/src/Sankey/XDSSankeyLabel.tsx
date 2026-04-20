/**
 * @file XDSSankeyLabel.tsx
 * @output Renders labels above each node — value + name + optional percentage
 * @position Visual layer — labels positioned outside the flow area
 *
 * Labels go above nodes so they never overlap the colored ribbons.
 * Shows formatted value, uppercase label, and optional percentage.
 */

import {useSankey} from './SankeyContext';

export interface XDSSankeyLabelProps {
  /** Show percentage below the node (default: true) */
  showPercent?: boolean;
  /** Format function for the value (default: compact notation) */
  formatValue?: (value: number) => string;
}

function oklch(color: [number, number, number], alpha: number): string {
  return `oklch(${color[0]} ${color[1]} ${color[2]} / ${alpha})`;
}

function defaultFormat(value: number): string {
  if (value >= 10000) return Math.round(value / 1000) + 'k';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
  return value.toLocaleString();
}

/**
 * Renders labels for all nodes in the Sankey chart.
 *
 * Positioned above each node bar:
 * - Large bold value (top)
 * - Uppercase label (below value)
 * - Optional percentage below the node bar
 */
export function XDSSankeyLabel({
  showPercent = true,
  formatValue = defaultFormat,
}: XDSSankeyLabelProps) {
  const {nodes, maxValue} = useSankey();

  return (
    <g>
      {nodes.map(node => {
        const pct = (node.value / maxValue) * 100;
        const pctStr = pct >= 10 ? Math.round(pct) + '%' : pct.toFixed(1) + '%';

        return (
          <g key={node.id}>
            <text
              x={node.x}
              y={node.y - 20}
              style={{
                font: '700 16px/1 system-ui',
                fill: 'var(--xds-sankey-label-value, #ececf0)',
                letterSpacing: '-0.01em',
              }}>
              {formatValue(node.value)}
            </text>
            <text
              x={node.x}
              y={node.y - 6}
              style={{
                font: '600 10px/1 system-ui',
                fill: oklch(node.color, 0.5),
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
              {node.label}
            </text>
            {showPercent && node.column > 0 && (
              <text
                x={node.x}
                y={node.y + node.height + 14}
                style={{
                  font: '600 10.5px/1 system-ui',
                  fill: oklch(node.color, 0.6),
                }}>
                {pctStr}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

XDSSankeyLabel.displayName = 'XDSSankeyLabel';
