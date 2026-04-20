/**
 * @file XDSSankeyLabel.tsx
 * @output Renders node labels — adapts placement based on node size
 * @position Visual layer — adjusts layout for readability at every scale
 *
 * Three rendering strategies based on available space:
 * - Tall nodes: rotated -90° text directly on the bar (no background)
 * - Short nodes: horizontal label beside the bar with surface pill
 * - Thin bars (< 16px): horizontal labels above the bar
 *
 * Text color uses --color-on-dark/--color-on-light from XDSMediaTheme
 * when rendering directly on colored bars.
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
 * On-surface text color based on oklch lightness.
 * L < 0.6 → dark fill → white text. L >= 0.6 → light fill → dark text.
 */
function onSurfaceColor(color: [number, number, number]): string {
  return color[0] < 0.6
    ? 'var(--color-on-dark, #fff)'
    : 'var(--color-on-light, #000)';
}

export function XDSSankeyLabel({
  showPercent = true,
  formatValue = defaultFormat,
}: XDSSankeyLabelProps) {
  const {nodes, maxValue, height, nodeWidth} = useSankey();
  const isWide = nodeWidth >= 16;

  return (
    <g>
      {nodes.map(node => {
        const pct = (node.value / maxValue) * 100;
        const pctStr = pct >= 10 ? Math.round(pct) + '%' : pct.toFixed(1) + '%';
        const formatted = formatValue(node.value);
        const text = `${node.label} = ${formatted}`;

        if (!isWide) {
          return (
            <ThinLabel
              key={node.id}
              node={node}
              formatted={formatted}
              pctStr={pctStr}
              showPercent={showPercent}
              height={height}
            />
          );
        }

        // Estimate if rotated text fits inside the node height
        // ~6.5px per character at 10px font, rotated means text width = node height
        const textWidth = text.length * 6.5;
        const fitsRotated = node.height >= textWidth + 8;

        if (fitsRotated) {
          return (
            <RotatedLabel
              key={node.id}
              node={node}
              nodeWidth={nodeWidth}
              text={text}
              pctStr={pctStr}
              showPercent={showPercent}
              height={height}
            />
          );
        }

        // Small node: place label beside the bar with surface pill
        return (
          <BesideLabel
            key={node.id}
            node={node}
            nodeWidth={nodeWidth}
            text={text}
            pctStr={pctStr}
            showPercent={showPercent}
            height={height}
          />
        );
      })}
    </g>
  );
}

/** Thin bars: horizontal labels above */
function ThinLabel({
  node,
  formatted,
  pctStr,
  showPercent,
  height,
}: {
  node: import('./types').SankeyNodeLayout;
  formatted: string;
  pctStr: string;
  showPercent: boolean;
  height: number;
}) {
  const labelY = Math.max(24, node.y - 5);
  const valueY = Math.max(12, labelY - 12);
  const pctY = Math.min(height - 2, node.y + node.height + 12);

  return (
    <g>
      <text
        x={node.x}
        y={valueY}
        style={{
          font: '600 13px/1 system-ui',
          fill: 'var(--color-text-primary, #1c1c1e)',
          letterSpacing: '-0.01em',
        }}>
        {formatted}
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
}

/** Tall wide bars: rotated text directly on the bar, no background */
function RotatedLabel({
  node,
  nodeWidth,
  text,
  pctStr,
  showPercent,
  height,
}: {
  node: import('./types').SankeyNodeLayout;
  nodeWidth: number;
  text: string;
  pctStr: string;
  showPercent: boolean;
  height: number;
}) {
  const cx = node.x + nodeWidth / 2;
  const cy = node.y + node.height / 2;

  return (
    <g>
      <g transform={`translate(${cx}, ${cy}) rotate(-90)`}>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            font: '600 10px/1 system-ui',
            fill: onSurfaceColor(node.color),
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

/** Short wide bars: label beside the node in the flow area with surface pill */
function BesideLabel({
  node,
  nodeWidth,
  text,
  pctStr,
  showPercent,
  height,
}: {
  node: import('./types').SankeyNodeLayout;
  nodeWidth: number;
  text: string;
  pctStr: string;
  showPercent: boolean;
  height: number;
}) {
  const cx = node.x + nodeWidth / 2;
  const cy = node.y + node.height / 2;

  // Place to the right of the node bar
  const labelX = node.x + nodeWidth + 6;
  const pillW = text.length * 6 + 10;
  const pillH = 16;

  return (
    <g>
      {/* Surface pill for contrast in the flow area */}
      <rect
        x={labelX - 4}
        y={cy - pillH / 2}
        width={pillW}
        height={pillH}
        rx={3}
        fill="var(--color-background-surface, #fff)"
        fillOpacity={0.9}
      />
      <text
        x={labelX}
        y={cy}
        dominantBaseline="central"
        style={{
          font: '600 10px/1 system-ui',
          fill: 'var(--color-text-primary, #1c1c1e)',
          letterSpacing: '-0.01em',
        }}>
        {text}
      </text>
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
