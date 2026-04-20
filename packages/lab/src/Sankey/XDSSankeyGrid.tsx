/**
 * @file XDSSankeyGrid.tsx
 * @output Dashed vertical lines at each column position
 * @position Visual layer — structural guide behind the flow ribbons
 *
 * Renders a subtle dashed line at each column's node bar position,
 * giving vertical structure to the flow layout.
 */

import {useSankey} from './SankeyContext';

export interface XDSSankeyGridProps {
  /** Dash pattern (default: "4 4") */
  dashArray?: string;
  /** Stroke color (default: theme border) */
  color?: string;
  /** Opacity (default: 0.3) */
  opacity?: number;
}

/**
 * Vertical grid lines at each column position.
 *
 * Place before XDSSankeyLink so grid renders behind ribbons.
 */
export function XDSSankeyGrid({
  dashArray = '4 4',
  color,
  opacity = 0.3,
}: XDSSankeyGridProps) {
  const {columnXs, height, nodeWidth} = useSankey();

  return (
    <g>
      {columnXs.map((x, i) => (
        <line
          key={i}
          x1={x + nodeWidth / 2}
          x2={x + nodeWidth / 2}
          y1={0}
          y2={height}
          stroke={color || 'var(--color-border, #d0d0d8)'}
          strokeOpacity={opacity}
          strokeDasharray={dashArray}
          strokeWidth={1}
        />
      ))}
    </g>
  );
}

XDSSankeyGrid.displayName = 'XDSSankeyGrid';
