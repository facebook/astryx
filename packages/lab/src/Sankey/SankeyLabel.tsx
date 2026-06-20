// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SankeyLabel.tsx
 * @output Renders node labels — rotated on bar or beside it based on fit
 * @position Visual layer — adapts placement for readability at every scale
 *
 * Two strategies based on available space:
 * - Tall nodes: rotated -90° text directly on the bar (no background)
 * - Short nodes: horizontal label beside the bar with surface pill
 *
 * Last-column labels anchor to the left to avoid clipping at the chart edge.
 * Text on bars uses --color-on-dark/--color-on-light from MediaTheme.
 */

import {useSankey} from './SankeyContext';
import type {SankeyNodeLayout} from './types';

export interface SankeyLabelProps {
  /** Show percentage below the node (default: true) */
  showPercent?: boolean;
  /** Format function for the value (default: compact notation) */
  formatValue?: (value: number) => string;
}

function defaultFormat(value: number): string {
  if (value >= 10000) {
    return Math.round(value / 1000) + 'k';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return value.toLocaleString();
}

/**
 * On-surface text color. When a CSS color override is active, parse its
 * perceived lightness. For oklch tuples, use the L channel directly.
 */
function onSurfaceColor(
  color: [number, number, number],
  cssOverride?: string,
): string {
  if (cssOverride) {
    // Quick heuristic: if the override looks dark, use on-dark
    // Check for common dark patterns (#1, #0, rgb(0-80,...), black, etc.)
    const c = cssOverride.toLowerCase().trim();
    const isDark =
      c === 'black' ||
      /^#[0-3]/.test(c) ||
      /^#.[0-3]/.test(c) ||
      /^rgb\(\s*[0-7]\d?\s*,/.test(c);
    return isDark
      ? 'var(--color-on-dark, #fff)'
      : 'var(--color-on-light, #000)';
  }
  return color[0] < 0.6
    ? 'var(--color-on-dark, #fff)'
    : 'var(--color-on-light, #000)';
}

export function SankeyLabel({
  showPercent = true,
  formatValue = defaultFormat,
}: SankeyLabelProps) {
  const {nodes, columns, maxValue, height, nodeWidth, nodeColor} = useSankey();
  const lastColumn = columns.length - 1;

  return (
    <g>
      {nodes.map(node => {
        const pct = (node.value / maxValue) * 100;
        const pctStr = pct >= 10 ? Math.round(pct) + '%' : pct.toFixed(1) + '%';
        const formatted = formatValue(node.value);
        const text = `${node.label} = ${formatted}`;

        const textWidth = text.length * 6.5;
        const fitsRotated = node.height >= textWidth + 8;

        if (fitsRotated) {
          return (
            <RotatedLabel
              key={node.id}
              node={node}
              nodeWidth={nodeWidth}
              nodeColor={nodeColor}
              text={text}
              pctStr={pctStr}
              showPercent={showPercent}
              height={height}
            />
          );
        }

        return (
          <BesideLabel
            key={node.id}
            node={node}
            nodeWidth={nodeWidth}
            text={text}
            pctStr={pctStr}
            showPercent={showPercent}
            height={height}
            isLastColumn={node.column === lastColumn}
          />
        );
      })}
    </g>
  );
}

/** Tall bars: rotated text directly on the bar, no background */
function RotatedLabel({
  node,
  nodeWidth,
  nodeColor,
  text,
  pctStr,
  showPercent,
  height,
}: {
  node: SankeyNodeLayout;
  nodeWidth: number;
  nodeColor?: string;
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
            fill: onSurfaceColor(node.color, nodeColor),
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

/**
 * Short bars: label beside the node with surface pill.
 * Last column labels go to the left to avoid clipping.
 */
function BesideLabel({
  node,
  nodeWidth,
  text,
  pctStr,
  showPercent,
  height,
  isLastColumn,
}: {
  node: SankeyNodeLayout;
  nodeWidth: number;
  text: string;
  pctStr: string;
  showPercent: boolean;
  height: number;
  isLastColumn: boolean;
}) {
  const cx = node.x + nodeWidth / 2;
  const cy = node.y + node.height / 2;
  const pillW = text.length * 6 + 10;
  const pillH = 16;

  const labelX = isLastColumn ? node.x - 6 : node.x + nodeWidth + 6;
  const pillX = isLastColumn ? labelX - pillW + 4 : labelX - 4;
  const textAnchor = isLastColumn ? 'end' : 'start';

  return (
    <g>
      <rect
        x={pillX}
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
        textAnchor={textAnchor}
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

SankeyLabel.displayName = 'SankeyLabel';
