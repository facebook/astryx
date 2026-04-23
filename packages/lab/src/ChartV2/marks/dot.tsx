/**
 * @file marks/dot.tsx
 * @output Dot/scatter series — self-contained resolve + render
 */

import type {SeriesDef, ResolvedPoint} from '../types';
import type {ScaleBand} from 'd3-scale';

export type ColorAccessor = string | ((datum: Record<string, unknown>, index: number) => string);

export interface DotOptions {
  color?: ColorAccessor;
  radius?: number;
  opacity?: number;
  dodge?: boolean;
}

export function dot(dataKey: string, options: DotOptions = {}): SeriesDef {
  const color = options.color ?? 'var(--color-chart-1)';
  const radius = options.radius ?? 4;
  const opacity = options.opacity ?? 0.8;

  return {
    type: 'dot',
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
      // TODO: dodge layout runs here — has access to radius + all points
      return points;
    },

    render(resolved, ctx) {
      const {data} = ctx;
      return (
        <g>
          {resolved.map((p, i) => {
            const fill = typeof color === 'function' ? color(data[p.dataIndex], p.dataIndex) : color;
            return <circle key={i} cx={p.px} cy={p.py} r={radius} fill={fill} opacity={opacity} />;
          })}
        </g>
      );
    },
  };
}
