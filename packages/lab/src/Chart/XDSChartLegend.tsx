/**
 * @file XDSChartLegend.tsx
 * @output Renders a legend — discrete swatches or continuous gradient bar
 * @position Child of XDSChart or standalone
 *
 * Two modes:
 * - Discrete: pass `items` — renders color swatches with labels
 * - Gradient: pass `gradient` + `domain` — renders a continuous color bar with tick labels
 *
 * The `gradient` prop accepts the output of useXDSChartColors().sequential/diverging directly.
 */

export interface XDSChartLegendItem {
  label: string;
  color: string;
}

export interface XDSChartLegendProps {
  /** Discrete legend items — color swatches with labels */
  items?: XDSChartLegendItem[];
  /**
   * Continuous gradient — array of hex colors from low to high.
   * Pass the output of useXDSChartColors().sequential.blue(5) or diverging directly.
   */
  gradient?: string[];
  /** Numeric domain for the gradient [min, max]. Required when gradient is set. */
  domain?: [number, number];
  /** Label for the gradient legend */
  label?: string;
  /** Number of tick labels on the gradient bar (default: 3) */
  ticks?: number;
  /** Custom tick formatter */
  tickFormat?: (value: number) => string;
}

/** Build a CSS linear-gradient from an array of color stops */
function toGradientCSS(colors: string[]): string {
  if (colors.length === 0) return 'transparent';
  if (colors.length === 1) return colors[0];
  const stops = colors.map(
    (c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`,
  );
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

/**
 * Chart legend — discrete swatches or continuous gradient.
 *
 * @example
 * ```
 * // Discrete
 * <XDSChartLegend items={[
 *   {label: 'Revenue', color: colors[0]},
 *   {label: 'Expenses', color: colors[1]},
 * ]} />
 *
 * // Continuous — pipe useXDSChartColors() directly
 * <XDSChartLegend
 *   gradient={useXDSChartColors().sequential.blue(5)}
 *   domain={[0, 100]}
 *   label="Temperature"
 * />
 *
 * // Diverging
 * <XDSChartLegend
 *   gradient={useXDSChartColors().diverging.coldHot(7)}
 *   domain={[-50, 50]}
 *   label="Change %"
 * />
 * ```
 */
export function XDSChartLegend({
  items,
  gradient,
  domain,
  label,
  ticks = 3,
  tickFormat = String,
}: XDSChartLegendProps) {
  // Gradient mode
  if (gradient && gradient.length > 0 && domain) {
    const [min, max] = domain;
    const tickValues = Array.from(
      {length: ticks},
      (_, i) => min + (i / (ticks - 1)) * (max - min),
    );

    return (
      <foreignObject
        x={0}
        y={-4}
        width="100%"
        height={48}
        style={{overflow: 'visible'}}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: 'var(--color-text-secondary)',
          }}>
          {label && (
            <span style={{fontWeight: 500, color: 'var(--color-text-primary)'}}>
              {label}
            </span>
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: 200,
            }}>
            <div
              style={{
                height: 10,
                borderRadius: 4,
                background: toGradientCSS(gradient),
              }}
            />
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              {tickValues.map(v => (
                <span key={v} style={{fontSize: 10}}>
                  {tickFormat(v)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </foreignObject>
    );
  }

  // Discrete mode
  if (!items || items.length === 0) return null;

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
