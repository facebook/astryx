/**
 * @file XDSChartBar.tsx
 * @output Renders bars (vertical or horizontal) for a data key
 * @position Child of XDSChart; reads scales from context
 */

import {useChart} from './ChartContext';
import {useXDSChartStack} from './useXDSChartStack';
import {useBarGroup} from './BarRegistry';
import {isBandScale} from './utils';

export interface XDSChartBarProps {
  /** Which data key to visualize */
  dataKey: string;
  /** Bar fill color (hex string, CSS var, etc.) */
  color: string;
  /** Corner radius on bar tops */
  radius?: number;
  /** Stack group — bars with same stack render on top of each other */
  stack?: string;
  /** Opacity (default: 1) */
  opacity?: number;
}

/**
 * Bar marks. Supports vertical/horizontal orientation, stacking, and automatic grouping.
 *
 * - Stacking: set `stack` prop to a group ID; bars accumulate on each other.
 * - Grouping: when multiple unstacked bars exist, they auto-subdivide the band width.
 * - Horizontal: when XDSChart has `orientation="horizontal"`, bars render horizontally.
 *
 * @example
 * ```
 * <XDSChartBar dataKey="revenue" color="#3b82f6" />
 * <XDSChartBar dataKey="costs" color="#ef4444" stack="totals" />
 * ```
 */
export function XDSChartBar({
  dataKey,
  color,
  radius = 4,
  stack: stackGroup,
  opacity = 1,
}: XDSChartBarProps) {
  const {data, xKey, xScale, yScale, orientation} = useChart();
  const {y0, y1, isStacked} = useXDSChartStack(stackGroup, dataKey);
  const group = useBarGroup(dataKey, isStacked);

  if (orientation === 'horizontal') {
    // Horizontal bars: yScale is band (categories), xScale is linear (values)
    if (!isBandScale(yScale as never)) return null;
    const bandScale = yScale as unknown as import('d3-scale').ScaleBand<string>;
    const valueScale = xScale as unknown as import('d3-scale').ScaleLinear<number, number>;

    const zeroX = valueScale(0);
    const bandwidth = bandScale.bandwidth();

    // Grouping for horizontal bars
    const barWidth = group ? bandwidth / group.count : bandwidth;
    const barOffset = group ? group.index * barWidth : 0;

    return (
      <g opacity={opacity}>
        {data.map((d, i) => {
          const yVal = bandScale(String(d[xKey]));
          if (yVal == null) return null;

          const val = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
          const xPos = valueScale(val);
          const barX = Math.min(xPos, zeroX);
          const barW = Math.abs(xPos - zeroX);

          return (
            <rect
              key={i}
              x={barX}
              y={yVal + barOffset}
              width={Math.max(0, barW)}
              height={barWidth}
              fill={color}
              rx={radius}
              ry={radius}
            />
          );
        })}
      </g>
    );
  }

  // Vertical bars (default)
  if (!isBandScale(xScale)) return null;

  const bandwidth = xScale.bandwidth();

  // Grouping: subdivide band width among ungrouped bars
  const barWidth = group ? bandwidth / group.count : bandwidth;
  const barOffset = group ? group.index * barWidth : 0;

  return (
    <g opacity={opacity}>
      {data.map((d, i) => {
        const xVal = xScale(String(d[xKey]));
        if (xVal == null) return null;

        let barY: number;
        let barHeight: number;

        if (isStacked) {
          const top = y1(i);
          const bottom = y0(i);
          barY = Math.min(top, bottom);
          barHeight = Math.abs(bottom - top);
        } else {
          const yVal = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
          const yPos = yScale(yVal);
          const zeroY = yScale(0);
          barY = Math.min(yPos, zeroY);
          barHeight = Math.abs(yPos - zeroY);
        }

        return (
          <rect
            key={i}
            x={xVal + barOffset}
            y={barY}
            width={barWidth}
            height={Math.max(0, barHeight)}
            fill={color}
            rx={radius}
            ry={radius}
          />
        );
      })}
    </g>
  );
}
