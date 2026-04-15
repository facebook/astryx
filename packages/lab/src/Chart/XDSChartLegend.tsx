/**
 * @file XDSChartLegend.tsx
 * @output Renders a legend with color swatches and labels
 * @position Child of XDSChart or standalone
 */

export interface XDSChartLegendItem {
  label: string;
  color: string;
}

export interface XDSChartLegendProps {
  items: XDSChartLegendItem[];
  /** Position relative to chart (default: bottom) */
  position?: 'top' | 'bottom';
}

/**
 * Chart legend. Renders a row of color swatches with labels.
 *
 * @example
 * ```
 * <XDSChartLegend items={[
 *   { label: 'Revenue', color: XDSChartColors.categorical(2)[0] },
 *   { label: 'Expenses', color: XDSChartColors.categorical(2)[1] },
 * ]} />
 * ```
 */
export function XDSChartLegend({items}: XDSChartLegendProps) {
  return (
    <foreignObject
      x={0}
      y={-4}
      width="100%"
      height={24}
      style={{overflow: 'visible'}}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          fontSize: 12,
          color: 'var(--color-text-secondary)',
        }}>
        {items.map(item => (
          <div
            key={item.label}
            style={{display: 'flex', alignItems: 'center', gap: 4}}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: item.color,
                flexShrink: 0,
              }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </foreignObject>
  );
}
