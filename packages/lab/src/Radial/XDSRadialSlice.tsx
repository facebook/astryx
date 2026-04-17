/**
 * @file XDSRadialSlice.tsx
 * @output Renders pie/donut slices from radial context
 */

import {useRadial} from './RadialContext';

export interface XDSRadialSliceProps {
  /**
   * Colors for each slice. Array of hex strings.
   * Use useXDSChartColors().categorical(n).
   */
  colors: string[];
  /** Corner radius on slice edges (default: 2) */
  cornerRadius?: number;
  /** Show percentage labels (default: true) */
  labels?: boolean;
  /** Minimum percentage to show a label (default: 5) */
  labelThreshold?: number;
}

/** SVG arc path from angles and radii */
function arcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const x1 = cx + Math.cos(startAngle) * outerR;
  const y1 = cy + Math.sin(startAngle) * outerR;
  const x2 = cx + Math.cos(endAngle) * outerR;
  const y2 = cy + Math.sin(endAngle) * outerR;
  const x3 = cx + Math.cos(endAngle) * innerR;
  const y3 = cy + Math.sin(endAngle) * innerR;
  const x4 = cx + Math.cos(startAngle) * innerR;
  const y4 = cy + Math.sin(startAngle) * innerR;

  const sweep = endAngle - startAngle;
  const largeArc = sweep > Math.PI ? 1 : 0;

  if (innerR === 0) {
    // Pie slice (triangle-ish)
    return [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');
  }

  // Donut slice (annular sector)
  return [
    `M ${x1} ${y1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

/**
 * Pie/donut slices. Reads slice geometry from radial context.
 *
 * @example
 * ```
 * <XDSRadialSlice colors={colors.categorical(5)} />
 * ```
 */
export function XDSRadialSlice({
  colors,
  cornerRadius = 0,
  labels = true,
  labelThreshold = 5,
}: XDSRadialSliceProps) {
  const {cx, cy, radius, innerRadius, slices} = useRadial();

  if (!slices || slices.length === 0) return null;

  return (
    <g>
      {slices.map((slice, i) => {
        const color = colors[i % colors.length];
        const d = arcPath(
          cx,
          cy,
          innerRadius,
          radius,
          slice.startAngle,
          slice.endAngle,
        );

        // Label position at midpoint of arc, between inner and outer radius
        const midAngle = (slice.startAngle + slice.endAngle) / 2;
        const labelR = innerRadius + (radius - innerRadius) * 0.6;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;
        const showLabel = labels && slice.percentage * 100 >= labelThreshold;

        return (
          <g key={slice.key}>
            <path
              d={d}
              fill={color}
              stroke="var(--color-background-surface)"
              strokeWidth={cornerRadius > 0 ? 0 : 1}
            />
            {showLabel && (
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-text-primary)"
                fontSize={12}
                fontWeight={500}>
                {Math.round(slice.percentage * 100)}%
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
