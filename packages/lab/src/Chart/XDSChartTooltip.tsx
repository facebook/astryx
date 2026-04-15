/**
 * @file XDSChartTooltip.tsx
 * @output Hover tooltip that follows the nearest data point
 * @position Child of XDSChart; reads scales from context
 */

import {useState, useCallback, type ReactNode} from 'react';
import {useChart} from './ChartContext';
import type {ScaleBand} from 'd3-scale';

export interface XDSChartTooltipProps {
  /**
   * Custom render function for tooltip content.
   * Receives the hovered data point.
   * Default: renders all yKeys as "key: value" lines.
   */
  render?: (datum: Record<string, unknown>, index: number) => ReactNode;
}

function isBandScale(scale: unknown): scale is ScaleBand<string> {
  return typeof scale === 'function' && 'bandwidth' in scale;
}

/**
 * Tooltip overlay. Renders a floating card near the hovered data point.
 * Place as the last child inside XDSChart so it renders on top.
 *
 * @example
 * ```
 * <XDSChartTooltip />
 * <XDSChartTooltip render={(d) => <span>{d.month}: ${d.revenue}</span>} />
 * ```
 */
export function XDSChartTooltip({render}: XDSChartTooltipProps) {
  const {data, xScale, yScale, width, height} = useChart();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const cursor = point.matrixTransform(
        e.currentTarget.getScreenCTM()?.inverse(),
      );

      // Find nearest data index by x position
      if (isBandScale(xScale)) {
        const domain = xScale.domain();
        const step = xScale.step();
        const idx = Math.min(
          domain.length - 1,
          Math.max(0, Math.floor(cursor.x / step)),
        );
        setHoverIndex(idx);
      } else {
        // Linear — find closest point
        const linearScale = xScale as (v: number) => number;
        let closest = 0;
        let minDist = Infinity;
        data.forEach((d, i) => {
          const xVal = Object.values(d)[0] as number;
          const dist = Math.abs(linearScale(xVal) - cursor.x);
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        });
        setHoverIndex(closest);
      }
    },
    [data, xScale],
  );

  const handleMouseLeave = useCallback(() => setHoverIndex(null), []);

  const datum = hoverIndex !== null ? data[hoverIndex] : null;

  // Compute tooltip position
  let tooltipX = 0;
  let tooltipY = 0;
  if (datum && hoverIndex !== null) {
    if (isBandScale(xScale)) {
      tooltipX =
        (xScale(String(Object.values(datum)[0])) ?? 0) + xScale.bandwidth() / 2;
    } else {
      tooltipX = (xScale as (v: number) => number)(
        Object.values(datum)[0] as number,
      );
    }
    // Find the max y value across all numeric keys for positioning
    const yVals = Object.values(datum).filter(
      (v): v is number => typeof v === 'number',
    );
    tooltipY = yScale(Math.max(...yVals));
  }

  const defaultRender = (d: Record<string, unknown>) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        fontSize: 12,
      }}>
      {Object.entries(d).map(([k, v]) => (
        <div key={k}>
          <span style={{color: 'var(--color-text-secondary)'}}>{k}:</span>{' '}
          <span style={{fontWeight: 500}}>{String(v)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <g>
      {/* Invisible overlay to capture mouse events */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Vertical crosshair */}
      {hoverIndex !== null && (
        <line
          x1={tooltipX}
          x2={tooltipX}
          y1={0}
          y2={height}
          stroke="var(--color-border-emphasized)"
          strokeWidth={1}
          strokeDasharray="4 4"
          pointerEvents="none"
        />
      )}

      {/* Tooltip card via foreignObject */}
      {datum && hoverIndex !== null && (
        <foreignObject
          x={tooltipX + 8}
          y={Math.max(0, tooltipY - 40)}
          width={180}
          height={120}
          pointerEvents="none"
          style={{overflow: 'visible'}}>
          <div
            style={{
              background: 'var(--color-background-popover)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 12px',
              boxShadow: 'var(--shadow-med)',
              whiteSpace: 'nowrap',
              width: 'fit-content',
            }}>
            {render ? render(datum, hoverIndex) : defaultRender(datum)}
          </div>
        </foreignObject>
      )}
    </g>
  );
}
