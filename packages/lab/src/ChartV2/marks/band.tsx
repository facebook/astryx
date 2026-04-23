/**
 * @file marks/band.tsx
 * @output Band (confidence interval) series
 */

import {area as d3Area, curveMonotoneX} from 'd3-shape';
import type {SeriesDef, ResolvedPoint} from '../types';
import type {ScaleBand} from 'd3-scale';

export interface BandOptions {
  upper: string;
  lower: string;
  color?: string;
  opacity?: number;
}

export function band(options: BandOptions): SeriesDef {
  const color = options.color ?? 'var(--color-chart-1)';
  const opacity = options.opacity ?? 0.15;

  return {
    type: 'band',
    key: `band-${options.upper}-${options.lower}`,
    dataKeys: [options.upper, options.lower],
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
        const upper = typeof d[options.upper] === 'number' ? (d[options.upper] as number) : 0;
        const lower = typeof d[options.lower] === 'number' ? (d[options.lower] as number) : 0;
        points.push({px, py: yScale(upper), py0: yScale(lower), dataIndex: i});
      }
      return points;
    },

    render(resolved) {
      if (resolved.length === 0) return null;
      const areaGen = d3Area<ResolvedPoint>()
        .x(d => d.px).y0(d => d.py0).y1(d => d.py).curve(curveMonotoneX);
      const pathD = areaGen(resolved) ?? '';
      return <path d={pathD} fill={color} fillOpacity={opacity} stroke="none" />;
    },
  };
}
