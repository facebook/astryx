/**
 * @file XDSSankeyLabel.tsx
 * @output Renders node labels — horizontal above thin bars, rotated on wider bars
 * @position Visual layer — adapts layout based on node bar width
 *
 * Two rendering modes based on nodeWidth:
 * - Thin bars (< 16px): labels above the node bar horizontally
 * - Wide bars (≥ 16px): rotated -90° labels centered on the bar
 *
 * Text color for labels on node bars uses --color-on-dark / --color-on-light
 * based on the node's oklch lightness, matching XDSMediaTheme conventions.
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
   * - `'auto'` — only when nodeWidth ≥ 16 (default)
   * - `false` — no background
   */
  background?: boolean | 'auto';
}

function defaultFormat(value: number): string {
  if (value >= 10000) return Math.round(value / 1000) + 'k';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
  return value.toLocaleString();
}

/**
 * Pick the right on-surface text token based on the node's oklch lightness.
 * L < 0.6 → dark fill → --color-on-dark (white text).
 * L >= 0.6 → light fill → --color-on-light (dark text).
 */
function onSurfaceColor(color: [number, number, number]): string {
  return color[0] < 0.6
    ? 'var(--color-on-dark, #fff)'
    : 'var(--color-on-light, #000)';
}

/**
 * Renders labels for all nodes.
 *
 * Adapts rendering based on node bar width:
 * - **Thin** (< 16px): value + label above the bar, percentage below
 * - **Wide** (≥ 16px): rotated label centered on the bar with
 *   theme-aware text color. Value sits above, percentage below.
 */
export function XDSSankeyLabel({
  showPercent = true,
  formatValue = defaultFormat,
  background = 'auto',
}: XDSSankeyLabelProps) {
  const {nodes, maxValue, height, nodeWidth} = useSankey();
  const isWide = nodeWidth >= 16;
  const showBg = background === true || (background === 'auto' && isWide);

  return (
    <g>
      {nodes.map(node => {
        const pct = (node.value / maxValue) * 100;
        const pctStr = pct >= 10 ? Math.round(pct) + '%' : pct.toFixed(1) + '%';

        if (isWide) {
          return (
            <WideLabel
              key={node.id}
              node={node}
              nodeWidth={nodeWidth}
              pctStr={pctStr}
              showPercent={showPercent}
              showBg={showBg}
              formatValue={formatValue}
              height={height}
            />
          );
        }

        // Thin mode: horizontal labels above
        const labelY = Math.max(24, node.y - 5);
        const valueY = Math.max(12, labelY - 12);
        const pctY = Math.min(height - 2, node.y + node.height + 12);

        const bgX = node.x - 4;
        const bgY = valueY - 11;
        const bgW = Math.max(node.label.length * 6, 40) + 8;
        const bgH = 26;

        return (
          <g key={node.id}>
            {showBg && (
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

/** Rotated label rendering for wide node bars */
function WideLabel({
  node,
  nodeWidth,
  pctStr,
  showPercent,
  showBg,
  formatValue,
  height,
}: {
  node: import('./types').SankeyNodeLayout;
  nodeWidth: number;
  pctStr: string;
  showPercent: boolean;
  showBg: boolean;
  formatValue: (v: number) => string;
  height: number;
}) {
  const cx = node.x + nodeWidth / 2;
  const cy = node.y + node.height / 2;
  const text = `${node.label} = ${formatValue(node.value)}`;
  const pillW = text.length * 6.5 + 12;
  const pillH = 16;
  const showRotated = node.height >= 20;

  // Text color: if background pill, use primary (pill provides contrast).
  // Otherwise, pick on-dark/on-light based on node bar lightness.
  const textOnBar = showBg
    ? 'var(--color-text-primary, #1c1c1e)'
    : onSurfaceColor(node.color);

  if (!showRotated) {
    return (
      <g>
        <text
          x={cx}
          y={node.y - 6}
          textAnchor="middle"
          style={{
            font: '500 9px/1 system-ui',
            fill: 'var(--color-text-primary, #1c1c1e)',
          }}>
          {formatValue(node.value)}
        </text>
      </g>
    );
  }

  return (
    <g>
      <g transform={`translate(${cx}, ${cy}) rotate(-90)`}>
        {showBg && (
          <rect
            x={-pillW / 2}
            y={-pillH / 2}
            width={pillW}
            height={pillH}
            rx={3}
            fill="var(--color-background-surface, #fff)"
            fillOpacity={0.9}
          />
        )}
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            font: '600 10px/1 system-ui',
            fill: textOnBar,
            letterSpacing: '-0.01em',
          }}>
          {text}
        </text>
      </g>
      {showPercent && node.column > 0 && (
        <text
          x={cx}
          y={Math.min(height - 2, node.y + node.height + 12)}
          textAnchor="middle"
          style={{
            font: '500 9px/1 system-ui',
            fill: 'var(--color-text-tertiary, #8e8ea0)',
          }}>
          {pctStr}
        </text>
      )}
    </g>
  );
}

XDSSankeyLabel.displayName = 'XDSSankeyLabel';
