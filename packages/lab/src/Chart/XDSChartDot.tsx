/**
 * @file XDSChartDot.tsx
 * @output Renders scatter dots for a data key
 * @position Child of XDSChart; reads scales from context
 */

import {useChart} from './ChartContext';
import {useBrush} from './BrushContext';
import {xPixel} from './utils';

export interface XDSChartDotProps {
  /** Which data key for the y values */
  dataKey: string;
  /** Dot fill color */
  color: string;
  /** Dot radius */
  radius?: number;
}

/**
 * Scatter dot marks.
 *
 * @example
 * ```
 * <XDSChartDot dataKey="outliers" color={useXDSChartColors().categorical(3)[2]} />
 * ```
 */
export function XDSChartDot({dataKey, color, radius = 4}: XDSChartDotProps) {
  const {data, xKey, xScale, yScale} = useChart();
  const {range} = useBrush();

  return (
    <g>
      {data.map((d, i) => {
        const x = xPixel(d, xKey, xScale);
        const yVal =
          typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;

        // Dim points outside the brush range
        let opacity = 1;
        if (range) {
          const xv = d[xKey];
          const inX =
            typeof xv === 'number' && xv >= range.x[0] && xv <= range.x[1];
          const inY = !range.y || (yVal >= range.y[0] && yVal <= range.y[1]);
          opacity = inX && inY ? 1 : 0.15;
        }

        return (
          <circle
            key={i}
            cx={x}
            cy={yScale(yVal)}
            r={radius}
            fill={color}
            opacity={opacity}
          />
        );
      })}
    </g>
  );
}
