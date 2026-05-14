/**
 * @file marks/bar.tsx
 * @output Bar series — self-contained resolve + render
 * @position Standalone mark; chart root calls resolve() then render()
 */

import type {SeriesDef, SeriesContext, ResolvedPoint} from '../types';
import type {ScaleBand} from 'd3-scale';

export type ColorAccessor =
  | string
  | ((datum: Record<string, unknown>, index: number) => string);

export interface BarOptions {
  color?: ColorAccessor;
  opacity?: number;
  radius?: number;
  stack?: string;
  group?: string;
}

/**
 * Build an SVG path for a rectangle with only the top corners rounded.
 * When `r` is 0, produces a simple rect path with no curves.
 */
function roundedTopRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  // Clamp radius to half the smaller dimension
  const cr = Math.min(r, w / 2, h / 2);
  if (cr <= 0) {
    return `M${x},${y + h}V${y}H${x + w}V${y + h}Z`;
  }
  return (
    `M${x},${y + h}` +
    `V${y + cr}Q${x},${y} ${x + cr},${y}` +
    `H${x + w - cr}Q${x + w},${y} ${x + w},${y + cr}` +
    `V${y + h}Z`
  );
}

/**
 * Build an SVG path for a rectangle with only the bottom corners rounded.
 */
function roundedBottomRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  const cr = Math.min(r, w / 2, h / 2);
  if (cr <= 0) {
    return `M${x},${y}V${y + h}H${x + w}V${y}Z`;
  }
  return (
    `M${x},${y}` +
    `V${y + h - cr}Q${x},${y + h} ${x + cr},${y + h}` +
    `H${x + w - cr}Q${x + w},${y + h} ${x + w},${y + h - cr}` +
    `V${y}Z`
  );
}

export function bar(dataKey: string, options: BarOptions = {}): SeriesDef {
  const color = options.color ?? 'var(--color-chart-1)';
  const opacity = options.opacity ?? 1;
  const radius = options.radius ?? 4;

  let barWidth = 0;
  let barOffset = 0;

  const seriesDef: SeriesDef = {
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

      if (groupInfo) {
        const gutter = bw * 0.05;
        const totalGutters = gutter * (groupInfo.count - 1);
        barWidth = (bw - totalGutters) / groupInfo.count;
        barOffset = groupInfo.index * (barWidth + gutter);
      } else {
        barWidth = bw;
        barOffset = 0;
      }

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
      const isTop = seriesDef._isTopOfStack !== false;
      const r = isTop ? radius : 0;

      return (
        <g opacity={opacity}>
          {resolved.map((p, i) => {
            const d = data[p.dataIndex];
            const fill =
              typeof color === 'function' ? color(d, p.dataIndex) : color;
            const x = p.px - barWidth / 2;
            const y = Math.min(p.py, p.py0);
            const h = Math.max(0, Math.abs(p.py0 - p.py));
            const growsUp = p.py <= p.py0;

            const d_attr = growsUp
              ? roundedTopRect(x, y, barWidth, h, r)
              : roundedBottomRect(x, y, barWidth, h, r);

            return <path key={i} d={d_attr} fill={fill} />;
          })}
        </g>
      );
    },
  };

  return seriesDef;
}
