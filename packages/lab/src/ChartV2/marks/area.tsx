/**
 * @file marks/area.tsx
 * @output Area series — fill under line with stacking + gradient support
 */

import {area as d3Area, curveLinear, curveMonotoneX, curveNatural, curveStep} from 'd3-shape';
import {line as d3Line} from 'd3-shape';
import type {SeriesDef, ResolvedPoint} from '../types';
import type {ScaleBand} from 'd3-scale';

const CURVES = {linear: curveLinear, monotone: curveMonotoneX, natural: curveNatural, step: curveStep} as const;

export interface AreaOptions {
  color?: string;
  opacity?: number;
  curve?: keyof typeof CURVES;
  stack?: string;
  gradient?: boolean;
  stroke?: boolean;
}

export function area(dataKey: string, options: AreaOptions = {}): SeriesDef {
  const color = options.color ?? 'var(--color-chart-1)';
  const opacity = options.opacity ?? 0.3;
  const curve = options.curve ?? 'monotone';
  const gradient = options.gradient ?? false;
  const stroke = options.stroke ?? true;

  return {
    type: 'area',
    key: dataKey,
    dataKeys: [dataKey],
    layout: {stack: options.stack, includeZero: true},

    resolve(ctx, stackOffsets) {
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
        let py: number, py0: number;
        if (stackOffsets) {
          py = yScale(stackOffsets[i].y1);
          py0 = yScale(stackOffsets[i].y0);
        } else {
          const v = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
          py = yScale(v);
          py0 = yScale(0);
        }
        points.push({px, py, py0, dataIndex: i});
      }
      return points;
    },

    render(resolved) {
      if (resolved.length === 0) return null;
      const curveFactory = CURVES[curve];

      const areaGen = d3Area<ResolvedPoint>()
        .x(d => d.px).y0(d => d.py0).y1(d => d.py).curve(curveFactory);
      const pathD = areaGen(resolved) ?? '';

      const lineGen = d3Line<ResolvedPoint>()
        .x(d => d.px).y(d => d.py).curve(curveFactory);
      const strokeD = lineGen(resolved) ?? '';

      const gradientId = `area-grad-${dataKey}`;

      return (
        <g>
          {gradient && (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={opacity} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
          <path d={pathD} fill={gradient ? `url(#${gradientId})` : color}
            fillOpacity={gradient ? 1 : opacity} stroke="none" />
          {stroke && <path d={strokeD} fill="none" stroke={color} strokeWidth={2} />}
        </g>
      );
    },
  };
}
