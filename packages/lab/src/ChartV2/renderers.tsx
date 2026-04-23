/**
 * @file renderers.tsx
 * @output Mark renderers — each series type knows how to draw itself
 * @position Called by XDSChart root during render; each renderer returns SVG elements
 *
 * Each renderer receives the layout result and produces SVG.
 * New mark types = new renderers. Chart root never changes.
 */

import type {ReactNode} from 'react';
import {
  area as d3Area,
  line as d3Line,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
} from 'd3-shape';
import type {
  SeriesConfig,
  BarConfig,
  LineConfig,
  DotConfig,
  AreaConfig,
  BandConfig,
  CandlestickConfig,
  CurveType,
} from './series';
import type {LayoutResult} from './layout';

const CURVES = {
  linear: curveLinear,
  monotone: curveMonotoneX,
  natural: curveNatural,
  step: curveStep,
} as const;

/** Dispatch rendering for all series */
export function renderSeries(
  series: SeriesConfig[],
  layout: LayoutResult,
  data: Record<string, unknown>[],
  xKey: string,
): ReactNode {
  return series.map((s, i) => {
    const key = 'dataKey' in s ? s.dataKey : `${s.type}-${i}`;
    switch (s.type) {
      case 'bar':
        return (
          <BarRenderer
            key={key}
            config={s}
            layout={layout}
            data={data}
            xKey={xKey}
          />
        );
      case 'line':
        return (
          <LineRenderer
            key={key}
            config={s}
            layout={layout}
            data={data}
            xKey={xKey}
          />
        );
      case 'dot':
        return (
          <DotRenderer
            key={key}
            config={s}
            layout={layout}
            data={data}
            xKey={xKey}
          />
        );
      case 'area':
        return (
          <AreaRenderer
            key={key}
            config={s}
            layout={layout}
            data={data}
            xKey={xKey}
          />
        );
      case 'band':
        return (
          <BandRenderer
            key={key}
            config={s}
            layout={layout}
            data={data}
            xKey={xKey}
          />
        );
      case 'candlestick':
        return (
          <CandlestickRenderer
            key={key}
            config={s}
            layout={layout}
            data={data}
            xKey={xKey}
          />
        );
      default:
        return null;
    }
  });
}

// ─── Bar Renderer ──────────────────────────────────────────────────────────

function BarRenderer({
  config,
  layout,
  data,
  xKey,
}: {
  config: BarConfig;
  layout: LayoutResult;
  data: Record<string, unknown>[];
  xKey: string;
}) {
  const {xScale, yScale, barGroups} = layout;
  if (!('bandwidth' in xScale)) return null;

  const bw = xScale.bandwidth();
  const groupInfo = config.group ? barGroups.get(config.group) : undefined;
  const barWidth = groupInfo ? groupInfo.barWidth : bw;
  const barIndex = groupInfo ? groupInfo.keys.indexOf(config.dataKey) : 0;

  const resolved = layout.resolved.get(config.dataKey);

  return (
    <g opacity={config.opacity}>
      {data.map((d, i) => {
        const xBase = xScale(String(d[xKey])) ?? 0;
        const x = xBase + barIndex * barWidth;

        const point = resolved?.[i];
        if (!point) return null;

        const barY = Math.min(point.py, point.py0);
        const barHeight = Math.abs(point.py0 - point.py);

        const fill =
          typeof config.color === 'function'
            ? config.color(d, i)
            : config.color;

        return (
          <rect
            key={i}
            x={x}
            y={barY}
            width={barWidth}
            height={Math.max(0, barHeight)}
            fill={fill}
            rx={config.radius}
            ry={config.radius}
          />
        );
      })}
    </g>
  );
}

// ─── Line Renderer ─────────────────────────────────────────────────────────

function LineRenderer({
  config,
  layout,
  data,
  xKey,
}: {
  config: LineConfig;
  layout: LayoutResult;
  data: Record<string, unknown>[];
  xKey: string;
}) {
  const resolved = layout.resolved.get(config.dataKey);
  if (!resolved || resolved.length === 0) return null;

  const curveFactory = CURVES[config.curve];
  const pathGen = d3Line<{px: number; py: number}>()
    .x(d => d.px)
    .y(d => d.py)
    .curve(curveFactory);

  const pathD = pathGen(resolved) ?? '';

  return (
    <g>
      <path
        d={pathD}
        fill="none"
        stroke={config.color}
        strokeWidth={config.strokeWidth}
      />
      {config.dots &&
        resolved.map((p, i) => (
          <circle key={i} cx={p.px} cy={p.py} r={3} fill={config.color} />
        ))}
    </g>
  );
}

// ─── Dot Renderer ──────────────────────────────────────────────────────────

function DotRenderer({
  config,
  layout,
  data,
}: {
  config: DotConfig;
  layout: LayoutResult;
  data: Record<string, unknown>[];
  xKey: string;
}) {
  const resolved = layout.resolved.get(config.dataKey);
  if (!resolved) return null;

  return (
    <g>
      {resolved.map((p, i) => {
        const fill =
          typeof config.color === 'function'
            ? config.color(data[p.dataIndex], p.dataIndex)
            : config.color;
        return (
          <circle
            key={i}
            cx={p.px}
            cy={p.py}
            r={config.radius}
            fill={fill}
            opacity={config.opacity}
          />
        );
      })}
    </g>
  );
}

// ─── Area Renderer ─────────────────────────────────────────────────────────

function AreaRenderer({
  config,
  layout,
}: {
  config: AreaConfig;
  layout: LayoutResult;
  data: Record<string, unknown>[];
  xKey: string;
}) {
  const resolved = layout.resolved.get(config.dataKey);
  if (!resolved || resolved.length === 0) return null;

  const curveFactory = CURVES[config.curve];

  // Area path: uses py0 (stacked baseline) and py (top)
  const areaGen = d3Area<{px: number; py: number; py0: number}>()
    .x(d => d.px)
    .y0(d => d.py0)
    .y1(d => d.py)
    .curve(curveFactory);

  const pathD = areaGen(resolved) ?? '';

  // Stroke: only the top line (not the closed area path)
  const lineGen = d3Line<{px: number; py: number}>()
    .x(d => d.px)
    .y(d => d.py)
    .curve(curveFactory);

  const strokeD = lineGen(resolved) ?? '';
  const gradientId = `area-grad-${config.dataKey}`;

  return (
    <g>
      {config.gradient && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={config.color}
              stopOpacity={config.opacity}
            />
            <stop offset="100%" stopColor={config.color} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      <path
        d={pathD}
        fill={config.gradient ? `url(#${gradientId})` : config.color}
        fillOpacity={config.gradient ? 1 : config.opacity}
        stroke="none"
      />
      {config.stroke && (
        <path d={strokeD} fill="none" stroke={config.color} strokeWidth={2} />
      )}
    </g>
  );
}

// ─── Band Renderer ─────────────────────────────────────────────────────────

function BandRenderer({
  config,
  layout,
  data,
  xKey,
}: {
  config: BandConfig;
  layout: LayoutResult;
  data: Record<string, unknown>[];
  xKey: string;
}) {
  const {xScale, yScale} = layout;

  const areaGen = d3Area<Record<string, unknown>>()
    .x(d => {
      if ('bandwidth' in xScale)
        return (xScale(String(d[xKey])) ?? 0) + xScale.bandwidth() / 2;
      return xScale(d[xKey] as number);
    })
    .y0(d =>
      yScale(
        typeof d[config.lower] === 'number' ? (d[config.lower] as number) : 0,
      ),
    )
    .y1(d =>
      yScale(
        typeof d[config.upper] === 'number' ? (d[config.upper] as number) : 0,
      ),
    )
    .curve(curveMonotoneX);

  const pathD = areaGen(data) ?? '';

  return (
    <path
      d={pathD}
      fill={config.color}
      fillOpacity={config.opacity}
      stroke="none"
    />
  );
}

// ─── Candlestick Renderer ──────────────────────────────────────────────────

function CandlestickRenderer({
  config,
  layout,
  data,
  xKey,
}: {
  config: CandlestickConfig;
  layout: LayoutResult;
  data: Record<string, unknown>[];
  xKey: string;
}) {
  const {xScale, yScale} = layout;
  if (!('bandwidth' in xScale)) return null;

  const bw = xScale.bandwidth();
  const bodyWidth = bw * 0.6;

  return (
    <g>
      {data.map((d, i) => {
        const x = (xScale(String(d[xKey])) ?? 0) + bw / 2;
        const open =
          typeof d[config.open] === 'number' ? (d[config.open] as number) : 0;
        const close =
          typeof d[config.close] === 'number' ? (d[config.close] as number) : 0;
        const high =
          typeof d[config.high] === 'number' ? (d[config.high] as number) : 0;
        const low =
          typeof d[config.low] === 'number' ? (d[config.low] as number) : 0;
        const isUp = close >= open;
        const color = isUp ? config.upColor : config.downColor;

        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={x}
              x2={x}
              y1={yScale(high)}
              y2={yScale(low)}
              stroke={color}
              strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={x - bodyWidth / 2}
              y={yScale(Math.max(open, close))}
              width={bodyWidth}
              height={Math.max(1, Math.abs(yScale(open) - yScale(close)))}
              fill={color}
            />
          </g>
        );
      })}
    </g>
  );
}
