/**
 * @file XDSSankeyLabel.tsx
 * @output Renders labels in the gap between node bar and ribbons
 * @position Visual layer — positioned in white space for guaranteed contrast
 *
 * Labels sit to the right of each node bar, in the clear area before
 * ribbons curve away. Uses primary text color for readability across themes.
 */

import {useSankey} from './SankeyContext';

export interface XDSSankeyLabelProps {
  /** Show percentage below the node (default: true) */
  showPercent?: boolean;
  /** Format function for the value (default: compact notation) */
  formatValue?: (value: number) => string;
}

function defaultFormat(value: number): string {
  if (value >= 10000) return Math.round(value / 1000) + 'k';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
  return value.toLocaleString();
}

/**
 * Renders labels for all nodes in the Sankey chart.
 *
 * Positioned above each node bar with enough space to stay
 * within chart bounds. Uses semantic text colors for theme compat.
 *
 * - Value (bold, 13px)
 * - Label (uppercase, 9px)
 * - Optional percentage below the node bar
 */
export function XDSSankeyLabel({
  showPercent = true,
  formatValue = defaultFormat,
}: XDSSankeyLabelProps) {
  const {nodes, maxValue, height} = useSankey();

  return (
    <g>
      {nodes.map(node => {
        const pct = (node.value / maxValue) * 100;
        const pctStr = pct >= 10 ? Math.round(pct) + '%' : pct.toFixed(1) + '%';

        // Clamp label y so it doesn't render above the SVG
        const labelY = Math.max(24, node.y - 5);
        const valueY = Math.max(12, labelY - 12);

        // Clamp percentage so it doesn't go below chart
        const pctY = Math.min(height - 2, node.y + node.height + 12);

        return (
          <g key={node.id}>
            <text
              x={node.x}
              y={valueY}
              style={{
                font: '600 13px/1 system-ui',
                fill: 'var(--color-text-primary, #1c1c1e)',
                letterSpacing: '-0.01em',
              }}>
              {formatValue(node.value)}
            </text>
            <text
              x={node.x}
              y={labelY}
              style={{
                font: '500 9px/1 system-ui',
                fill: 'var(--color-text-secondary, #6e6e80)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
              {node.label}
            </text>
            {showPercent && node.column > 0 && (
              <text
                x={node.x}
                y={pctY}
                style={{
                  font: '500 9px/1 system-ui',
                  fill: 'var(--color-text-tertiary, #8e8ea0)',
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
