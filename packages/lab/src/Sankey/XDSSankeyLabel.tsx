/**
 * @file XDSSankeyLabel.tsx
 * @output Renders labels above each node with optional background for contrast
 * @position Visual layer — positioned above nodes with guaranteed readability
 *
 * Labels sit above each node bar. An optional background pill ensures
 * text never competes with ribbon colors for contrast.
 */

import {useSankey} from './SankeyContext';

export interface XDSSankeyLabelProps {
  /** Show percentage below the node (default: true) */
  showPercent?: boolean;
  /** Format function for the value (default: compact notation) */
  formatValue?: (value: number) => string;
  /**
   * Show a background behind labels for contrast over ribbons.
   * - `true` — surface-colored pill behind all labels
   * - `false` — no background (default)
   */
  background?: boolean;
}

function defaultFormat(value: number): string {
  if (value >= 10000) return Math.round(value / 1000) + 'k';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
  return value.toLocaleString();
}

/**
 * Renders labels for all nodes in the Sankey chart.
 *
 * Positioned above each node bar within the reserved label margin.
 * When `background` is enabled, a subtle pill renders behind each
 * label group so text stays readable over ribbon colors.
 */
export function XDSSankeyLabel({
  showPercent = true,
  formatValue = defaultFormat,
  background = false,
}: XDSSankeyLabelProps) {
  const {nodes, maxValue, height} = useSankey();

  return (
    <g>
      {nodes.map(node => {
        const pct = (node.value / maxValue) * 100;
        const pctStr = pct >= 10 ? Math.round(pct) + '%' : pct.toFixed(1) + '%';

        // Label sits above the node bar, clamped within chart
        const labelY = Math.max(24, node.y - 5);
        const valueY = Math.max(12, labelY - 12);
        const pctY = Math.min(height - 2, node.y + node.height + 12);

        // Background pill dimensions (approximate text bounds)
        const bgX = node.x - 4;
        const bgY = valueY - 11;
        const bgW = Math.max(node.label.length * 6, 40) + 8;
        const bgH = 26;

        return (
          <g key={node.id}>
            {background && (
              <rect
                x={bgX}
                y={bgY}
                width={bgW}
                height={bgH}
                rx={4}
                fill="var(--color-background-surface, #fff)"
                fillOpacity={0.85}
              />
            )}
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
