/**
 * @file marks/bar.ts
 * @output Bar series — self-contained resolve + render
 * @position Standalone mark; chart root calls resolve() then render()
 */

import type {SeriesDef, SeriesContext, ResolvedPoint} from '../types';
import type {ScaleBand} from 'd3-scale';

export type ColorAccessor = string | ((datum: Record<string, unknown>, index: number) => string);

export interface BarOptions {
  color?: ColorAccessor;
  opacity?: number;
  radius?: number;
  stack?: string;
  group?: string;
}

export function bar(dataKey: string, options: BarOptions = {}): SeriesDef {
  const color = options.color ?? 'var(--color-chart-1)';
  const opacity = options.opacity ?? 1;
  const radius = options.radius ?? 4;

  // Shared between resolve and render via closure
  let barWidth = 0;
  let barOffset = 0;

  return {
    type: 'bar',
    key: dataKey,
    dataKeys: [dataKey],
    layout: {
      stack: options.stack,
      group: options.group,
      includeZero: true,
    },

    resolve(ctx, stackOffsets, groupInfo) {
      const {data, xKey, xScale, yScale} = ctx;
      if (!('bandwidth' in xScale)) return [];

      const bandScale = xScale as ScaleBand<string>;
      const bw = bandScale.bandwidth();
      barWidth = groupInfo ? bw / groupInfo.count : bw;
      barOffset = groupInfo ? groupInfo.index * barWidth : 0;

      const points: ResolvedPoint[] = [];
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const xBase = bandScale(String(d[xKey])) ?? 0;
        const px = xBase + barOffset + barWidth / 2;

        let py: number;
        let py0: number;
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

    render(resolved, ctx) {
      const {data} = ctx;
      return (
        <g opacity={opacity}>
          {resolved.map((p, i) => {
            const d = data[p.dataIndex];
            const fill = typeof color === 'function' ? color(d, p.dataIndex) : color;
            const barY = Math.min(p.py, p.py0);
            const barHeight = Math.abs(p.py0 - p.py);

            return (
              <rect
                key={i}
                x={p.px - barWidth / 2}
                y={barY}
                width={barWidth}
                height={Math.max(0, barHeight)}
                fill={fill}
                rx={radius}
                ry={radius}
              />
            );
          })}
        </g>
      );
    },
  };
}
