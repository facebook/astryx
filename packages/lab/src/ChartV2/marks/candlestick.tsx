/**
 * @file marks/candlestick.tsx
 * @output Candlestick (OHLC) series
 */

import type {SeriesDef, ResolvedPoint} from '../types';
import type {ScaleBand} from 'd3-scale';

export interface CandlestickOptions {
  open: string; high: string; low: string; close: string;
  upColor?: string; downColor?: string;
}

export function candlestick(options: CandlestickOptions): SeriesDef {
  const upColor = options.upColor ?? 'var(--color-positive)';
  const downColor = options.downColor ?? 'var(--color-negative)';

  return {
    type: 'candlestick',
    key: `ohlc-${options.close}`,
    dataKeys: [options.open, options.high, options.low, options.close],
    layout: {},

    resolve(ctx) {
      const {data, xKey, xScale, yScale} = ctx;
      const points: ResolvedPoint[] = [];
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        let px: number;
        if ('bandwidth' in xScale) {
          px = ((xScale as ScaleBand<string>)(String(d[xKey])) ?? 0) + (xScale as ScaleBand<string>).bandwidth() / 2;
        } else {
          px = xScale(d[xKey] as number);
        }
        const close = typeof d[options.close] === 'number' ? (d[options.close] as number) : 0;
        points.push({px, py: yScale(close), py0: yScale(0), dataIndex: i});
      }
      return points;
    },

    render(resolved, ctx) {
      const {data, xKey, xScale, yScale} = ctx;
      if (!('bandwidth' in xScale)) return null;
      const bw = (xScale as ScaleBand<string>).bandwidth();
      const bodyWidth = bw * 0.6;

      return (
        <g>
          {resolved.map((p, i) => {
            const d = data[p.dataIndex];
            const o = typeof d[options.open] === 'number' ? (d[options.open] as number) : 0;
            const c = typeof d[options.close] === 'number' ? (d[options.close] as number) : 0;
            const h = typeof d[options.high] === 'number' ? (d[options.high] as number) : 0;
            const l = typeof d[options.low] === 'number' ? (d[options.low] as number) : 0;
            const isUp = c >= o;
            const col = isUp ? upColor : downColor;
            return (
              <g key={i}>
                <line x1={p.px} x2={p.px} y1={yScale(h)} y2={yScale(l)} stroke={col} strokeWidth={1} />
                <rect x={p.px - bodyWidth / 2} y={yScale(Math.max(o, c))}
                  width={bodyWidth} height={Math.max(1, Math.abs(yScale(o) - yScale(c)))} fill={col} />
              </g>
            );
          })}
        </g>
      );
    },
  };
}
