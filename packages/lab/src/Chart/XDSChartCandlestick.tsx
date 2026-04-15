/**
 * @file XDSChartCandlestick.tsx
 * @output Renders candlestick/box-whisker marks for OHLC or statistical data
 * @position Child of XDSChart; reads scales from context
 *
 * Two variants:
 * - `'default'` — filled body with whiskers (traditional candlestick/box plot)
 * - `'bar'` — OHLC bar — vertical line with open/close ticks
 */

import {useChart} from './ChartContext';
import type {ScaleBand} from 'd3-scale';

export interface XDSChartCandlestickProps {
  /** Data key for the high/max value (top of whisker) */
  high: string;
  /** Data key for the low/min value (bottom of whisker) */
  low: string;
  /** Data key for the open/Q1 value (bottom of body) */
  open: string;
  /** Data key for the close/Q3 value (top of body) */
  close: string;
  /**
   * Visual variant:
   * - `'default'` — filled body with whiskers
   * - `'bar'` — OHLC bar — vertical range line, left tick at open, right tick at close
   */
  variant?: 'default' | 'bar';
  /** Color when close >= open (bullish / positive) */
  upColor?: string;
  /** Color when close < open (bearish / negative) */
  downColor?: string;
  /** Fixed color — overrides up/down logic. Use for box plots. */
  color?: string;
  /** Body width as fraction of band width (default: 0.6) */
  bodyWidth?: number;
  /** Stroke width for whiskers and bar lines */
  strokeWidth?: number;
  /** Corner radius on body (default variant only) */
  radius?: number;
  /** Dot radius (unused in bar variant, kept for future variants) */
  dotRadius?: number;
}

function isBandScale(scale: unknown): scale is ScaleBand<string> {
  return typeof scale === 'function' && 'bandwidth' in scale;
}

/**
 * Candlestick / box-whisker marks with optional Tufte variant.
 *
 * @example
 * ```
 * // Financial OHLC
 * <XDSChartCandlestick
 *   high="high" low="low" open="open" close="close"
 *   upColor={useXDSChartColors().semantic.positive}
 *   downColor={useXDSChartColors().semantic.negative}
 * />
 *
 * // Tufte range-bar
 * <XDSChartCandlestick
 *   variant="bar"
 *   high="max" low="min" open="q1" close="median"
 *   color={useXDSChartColors().categorical(1)[0]}
 * />
 * ```
 */
export function XDSChartCandlestick({
  high,
  low,
  open,
  close,
  variant = 'default',
  upColor = '#0B991F',
  downColor = '#F5394F',
  color,
  bodyWidth = 0.6,
  strokeWidth = 1.5,
  radius = 2,
  dotRadius = 3,
}: XDSChartCandlestickProps) {
  const {data, xScale, yScale} = useChart();

  if (!isBandScale(xScale)) return null;
  const bw = xScale.bandwidth();

  return (
    <g>
      {data.map((d, i) => {
        const xVal = xScale(String(Object.values(d)[0]));
        if (xVal == null) return null;

        const hVal = typeof d[high] === 'number' ? (d[high] as number) : 0;
        const lVal = typeof d[low] === 'number' ? (d[low] as number) : 0;
        const oVal = typeof d[open] === 'number' ? (d[open] as number) : 0;
        const cVal = typeof d[close] === 'number' ? (d[close] as number) : 0;

        const isUp = cVal >= oVal;
        const fill = color ?? (isUp ? upColor : downColor);
        const centerX = xVal + bw / 2;

        const yHigh = yScale(hVal);
        const yLow = yScale(lVal);
        const yOpen = yScale(oVal);
        const yClose = yScale(cVal);
        const bodyTop = Math.min(yOpen, yClose);
        const bodyBot = Math.max(yOpen, yClose);

        if (variant === 'bar') {
          // OHLC bar: vertical line (high→low), left tick at open, right tick at close
          const tickLen = bw * bodyWidth * 0.4;
          return (
            <g key={i}>
              {/* Vertical range line: high to low */}
              <line
                x1={centerX}
                x2={centerX}
                y1={yHigh}
                y2={yLow}
                stroke={fill}
                strokeWidth={strokeWidth}
              />
              {/* Open tick — extends left */}
              <line
                x1={centerX - tickLen}
                x2={centerX}
                y1={yOpen}
                y2={yOpen}
                stroke={fill}
                strokeWidth={strokeWidth}
              />
              {/* Close tick — extends right */}
              <line
                x1={centerX}
                x2={centerX + tickLen}
                y1={yClose}
                y2={yClose}
                stroke={fill}
                strokeWidth={strokeWidth}
              />
            </g>
          );
        }

        // Default variant: filled body with whiskers
        const bodyW = bw * bodyWidth;
        const bodyX = centerX - bodyW / 2;
        const bodyH = Math.max(1, bodyBot - bodyTop);

        return (
          <g key={i}>
            <line
              x1={centerX}
              x2={centerX}
              y1={yHigh}
              y2={bodyTop}
              stroke={fill}
              strokeWidth={strokeWidth}
            />
            <line
              x1={centerX}
              x2={centerX}
              y1={bodyBot}
              y2={yLow}
              stroke={fill}
              strokeWidth={strokeWidth}
            />
            <rect
              x={bodyX}
              y={bodyTop}
              width={bodyW}
              height={bodyH}
              fill={fill}
              rx={radius}
              ry={radius}
            />
          </g>
        );
      })}
    </g>
  );
}
