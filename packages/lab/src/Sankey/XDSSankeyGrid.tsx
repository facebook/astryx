/**
 * @file XDSSankeyGrid.tsx
 * @output Dashed vertical lines at each column + optional column headers
 * @position Visual layer — structural guide behind the flow ribbons
 */

import {useSankey} from './SankeyContext';

export interface XDSSankeyGridProps {
  /** Dash pattern (default: "4 4") */
  dashArray?: string;
  /** Stroke color (default: theme border) */
  color?: string;
  /** Opacity (default: 0.3) */
  opacity?: number;
  /** Show column header labels if defined (default: true) */
  showHeaders?: boolean;
}

/**
 * Vertical grid lines at each column position, with optional column headers.
 *
 * Place before XDSSankeyLink so grid renders behind ribbons.
 */
export function XDSSankeyGrid({
  dashArray = '4 4',
  color,
  opacity = 0.3,
  showHeaders = true,
}: XDSSankeyGridProps) {
  const {columns, height, nodeWidth} = useSankey();

  return (
    <g>
      {columns.map((col, i) => (
        <g key={i}>
          <line
            x1={col.x + nodeWidth / 2}
            x2={col.x + nodeWidth / 2}
            y1={0}
            y2={height}
            stroke={color || 'var(--color-border, #d0d0d8)'}
            strokeOpacity={opacity}
            strokeDasharray={dashArray}
            strokeWidth={1}
          />
          {showHeaders && col.label && (
            <text
              x={col.x + nodeWidth / 2}
              y={height - 2}
              textAnchor="middle"
              style={{
                font: '500 10px/1 system-ui',
                fill: 'var(--color-text-secondary, #6e6e80)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
              {col.label}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

XDSSankeyGrid.displayName = 'XDSSankeyGrid';
