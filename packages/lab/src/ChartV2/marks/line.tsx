/**
 * @file marks/line.tsx
 * @output Line series — self-contained resolve + render
 */

import {line as d3Line, curveLinear, curveMonotoneX, curveNatural, curveStep} from 'd3-shape';
import type {SeriesDef, SeriesContext, ResolvedPoint} from '../types';
import type {ScaleBand} from 'd3-scale';

const CURVES = {linear: curveLinear, monotone: curveMonotoneX, natural: curveNatural, step: curveStep} as const;
export type CurveType = keyof typeof CURVES;

export interface LineOptions {
  color?: string;
  curve?: CurveType;
  strokeWidth?: number;
  dots?: boolean;
}

export function line(dataKey: string, options: LineOptions = {}): SeriesDef {
  const color = options.color ?? 'var(--color-chart-1)';
  const curve = options.curve ?? 'monotone';
  const strokeWidth = options.strokeWidth ?? 2;
  const dots = options.dots ?? false;

  return {
    type: 'line',
    key: dataKey,
    dataKeys: [dataKey],
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
        const v = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
        points.push({px, py: yScale(v), py0: yScale(0), dataIndex: i});
      }
      return points;
    },

    render(resolved) {
      if (resolved.length === 0) return null;
      const curveFactory = CURVES[curve];
      const pathGen = d3Line<ResolvedPoint>()
        .x(d => d.px)
        .y(d => d.py)
        .curve(curveFactory);

      const pathD = pathGen(resolved) ?? '';
      return (
        <g>
          <path d={pathD} fill="none" stroke={color} strokeWidth={strokeWidth} />
          {dots && resolved.map((p, i) => (
            <circle key={i} cx={p.px} cy={p.py} r={3} fill={color} />
          ))}
        </g>
      );
    },
  };
}
