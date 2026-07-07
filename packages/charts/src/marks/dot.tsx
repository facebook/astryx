// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/dot.tsx
 * @output Dot/scatter series — self-contained resolve + render
 */

import type {SeriesDef, ResolvedPoint, ColorAccessor} from '../types';
import type {ScaleBand} from 'd3-scale';
import {pointFill} from '../markColor';

export type {ColorAccessor};

export interface DotOptions {
  color?: ColorAccessor;
  radius?: number;
  opacity?: number;
  dodge?: boolean;
  label?: string;
}

export function dot(dataKey: string, options: DotOptions = {}): SeriesDef {
  const color = options.color;
  const radius = options.radius ?? 4;
  const opacity = options.opacity ?? 0.8;
  const dodge = options.dodge ?? false;

  const seriesDef: SeriesDef = {
    type: 'dot',
    key: dataKey,
    dataKeys: [dataKey],
    color: typeof color === 'string' ? color : undefined,
    label: options.label ?? dataKey,
    layout: {},

    resolve(ctx) {
      const {data, xKey, xScale, yScale} = ctx;
      const points: ResolvedPoint[] = [];
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        let px: number;
        if ('bandwidth' in xScale) {
          px =
            ((xScale as ScaleBand<string>)(String(d[xKey])) ?? 0) +
            (xScale as ScaleBand<string>).bandwidth() / 2;
        } else {
          px = xScale(d[xKey] as number);
        }
        const v = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
        points.push({px, py: yScale(v), py0: yScale(0), dataIndex: i});
      }

      if (dodge) {
        // Spread points that land on the same x (e.g. dots over band categories)
        // horizontally so they don't overlap, centered on the original x.
        const groups = new Map<number, ResolvedPoint[]>();
        for (const p of points) {
          const key = Math.round(p.px);
          const group = groups.get(key) ?? [];
          group.push(p);
          groups.set(key, group);
        }
        const spacing = radius * 2 + 1;
        for (const group of groups.values()) {
          if (group.length < 2) {
            continue;
          }
          const mid = (group.length - 1) / 2;
          group.forEach((p, idx) => {
            p.px += (idx - mid) * spacing;
          });
        }
      }

      return points;
    },

    render(resolved, ctx) {
      const {data} = ctx;
      return (
        <g>
          {resolved.map(p => {
            const fill = pointFill(
              seriesDef,
              color,
              data[p.dataIndex],
              p.dataIndex,
            );
            return (
              <circle
                key={p.dataIndex}
                cx={p.px}
                cy={p.py}
                r={radius}
                fill={fill}
                opacity={opacity}
              />
            );
          })}
        </g>
      );
    },
  };

  return seriesDef;
}
