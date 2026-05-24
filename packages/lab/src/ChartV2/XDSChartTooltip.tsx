// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSChartTooltip.tsx
 * @output Grouped chart tooltip — shows all series values at the hovered x-position.
 *         Composable: drop into `<XDSChart tooltip>` or render directly inside a chart
 *         to take full control of props.
 * @position Reads from ChartV2Context — must render inside an <XDSChart>.
 *
 * @example
 * ```
 * // Default — declarative on XDSChart
 * <XDSChart tooltip />
 *
 * // Custom render function via XDSChart prop
 * <XDSChart tooltip={{render: (x, rows) => <MyCard x={x} rows={rows} />}} />
 *
 * // Composable — drop into the chart's children for full control
 * <XDSChart>
 *   <XDSChartTooltip highlightBand={false} placement="top" />
 * </XDSChart>
 * ```
 */

'use client';

import {
  memo,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import {createPortal} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core';
import {XDSVStack, XDSHStack} from '@xds/core';
import {radiusVars, spacingVars} from '@xds/core/theme/tokens.stylex';
import {useChartV2} from './ChartV2Context';
import {XDSChartSwatch, swatchVariantForType} from './XDSChartSwatch';
import {
  deriveTooltipSeriesValues,
  shouldRenderHoverDot,
  type TooltipSeriesValue,
} from './tooltip';
import type {SeriesDef, ChartPointerEvent} from './types';
import type {ScaleBand} from 'd3-scale';

export type XDSChartTooltipPlacement = 'auto' | 'right' | 'left' | 'top';

export interface XDSChartTooltipProps {
  /**
   * Series definitions — used to map the hovered datum to per-series rows.
   * When rendered via `<XDSChart tooltip />`, XDSChart injects this automatically.
   * When composing directly, pass the same `series` array you gave XDSChart.
   */
  series?: readonly SeriesDef[];
  /**
   * Custom render function. Receives the x-value and one row per visible series.
   * Returning `null` hides the card while still rendering the band highlight + dots.
   */
  render?: (xValue: unknown, seriesValues: TooltipSeriesValue[]) => ReactNode;
  /**
   * Whether to draw the soft column highlight behind the hovered band.
   * Only takes effect on band-scale x-axes. Default: `true`.
   */
  highlightBand?: boolean;
  /**
   * Whether to draw a hover dot at each series' point (skipped for bars).
   * Default: `true`.
   */
  showHoverDots?: boolean;
  /**
   * Card placement relative to the hovered point:
   * - `'auto'` (default): right of the point, flips to left if it would overflow
   * - `'right'` / `'left'` / `'top'`: pinned position
   */
  placement?: XDSChartTooltipPlacement;
}

const styles = stylex.create({
  // Card chrome — static visual styles. Position (left/top/display) is updated
  // imperatively via ref to keep pointer-move cost free of React renders.
  card: {
    position: 'fixed',
    background: 'var(--color-background-popover)',
    border: '1px solid var(--color-border)',
    borderRadius: radiusVars['--radius-container'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    boxShadow: 'var(--shadow-med)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    zIndex: 9999,
    display: 'none',
  },
});

/** Default tooltip body — used when `render` is not provided. */
const DefaultTooltipContent = memo(function DefaultTooltipContent({
  xValue,
  rows,
}: {
  xValue: unknown;
  rows: TooltipSeriesValue[];
}) {
  return (
    <XDSVStack gap={1}>
      <XDSText type="body" weight="semibold">
        {String(xValue)}
      </XDSText>
      {rows.length === 1 ? (
        <XDSText type="supporting">{String(rows[0].value)}</XDSText>
      ) : (
        <XDSVStack gap={1}>
          {rows.map(row => (
            <XDSHStack key={row.key} gap={2} vAlign="center">
              <XDSChartSwatch
                color={row.color}
                variant={swatchVariantForType(row.type)}
              />
              <XDSText type="supporting">{row.label}</XDSText>
              <XDSText type="supporting" weight="semibold">
                {String(row.value)}
              </XDSText>
            </XDSHStack>
          ))}
        </XDSVStack>
      )}
    </XDSVStack>
  );
});

/**
 * Composable grouped tooltip for XDSChart.
 *
 * Subscribes to the chart's pointer event stream and only re-renders when the
 * hovered data index changes (not on every pointer move). Card position is
 * updated imperatively via a ref to keep pointer-move cost ~free.
 */
export function XDSChartTooltip({
  series = [],
  render,
  highlightBand = true,
  showHoverDots = true,
  placement = 'auto',
}: XDSChartTooltipProps) {
  const {
    data,
    xKey,
    resolved,
    onPointer,
    svgRef,
    margin,
    xScale,
    width,
    height,
  } = useChartV2();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Stable Set of resolved series keys — used by deriveTooltipSeriesValues.
  // Recomputed only when the resolved map identity changes (per layout pass).
  const resolvedKeys = useMemo(() => new Set(resolved.keys()), [resolved]);

  // ─── Card positioning ──────────────────────────────────────────────────
  // Imperative — the card is portaled, and we don't want pointer-move to
  // trigger React renders.
  const positionCard = useCallback(
    (e: ChartPointerEvent) => {
      const card = cardRef.current;
      const svg = svgRef.current;
      if (!card) {
        return;
      }
      if (!svg || !e.nearest) {
        card.style.display = 'none';
        return;
      }
      const svgRect = svg.getBoundingClientRect();
      const screenX = svgRect.left + margin.left + e.nearest.px;
      const screenY = svgRect.top + margin.top;
      const cardWidth = card.offsetWidth;
      const cardHeight = card.offsetHeight;
      const viewportWidth = window.innerWidth;
      const gap = 8;

      let x: number;
      let y = screenY;
      switch (placement) {
        case 'left':
          x = screenX - cardWidth - gap;
          break;
        case 'right':
          x = screenX + gap;
          break;
        case 'top':
          x = screenX - cardWidth / 2;
          y = screenY - cardHeight - gap;
          break;
        case 'auto':
        default: {
          const rightX = screenX + gap;
          x =
            rightX + cardWidth > viewportWidth
              ? screenX - cardWidth - gap
              : rightX;
        }
      }

      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      card.style.display = 'block';
    },
    [svgRef, margin, placement],
  );

  // ─── Subscribe to pointer events ───────────────────────────────────────
  useEffect(() => {
    let currentIndex: number | null = null;
    const unsub = onPointer((e: ChartPointerEvent) => {
      const newIndex = e.nearest?.dataIndex ?? null;
      if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        setHoveredIndex(newIndex);
      }
      positionCard(e);
    });
    return unsub;
  }, [onPointer, positionCard]);

  // ─── Derived data ──────────────────────────────────────────────────────
  const datum = hoveredIndex != null ? data[hoveredIndex] : undefined;
  const xValue = datum?.[xKey];

  const seriesValues = useMemo(
    () => deriveTooltipSeriesValues(series, datum, resolvedKeys),
    [series, datum, resolvedKeys],
  );

  // Hover dots — read from the resolved map at the hovered index.
  const dots = useMemo(() => {
    if (!showHoverDots || hoveredIndex == null) {
      return null;
    }
    const elements: ReactNode[] = [];
    for (const s of series) {
      if (!shouldRenderHoverDot(s.type)) {
        continue;
      }
      const points = resolved.get(s.key);
      const point = points?.find(p => p.dataIndex === hoveredIndex);
      if (!point) {
        continue;
      }
      elements.push(
        <circle
          key={s.key}
          cx={point.px}
          cy={point.py}
          r={4}
          fill="var(--color-background-surface)"
          stroke={s.color ?? 'var(--color-border-emphasized)'}
          strokeWidth={2}
          pointerEvents="none"
        />,
      );
    }
    return elements;
  }, [showHoverDots, hoveredIndex, series, resolved]);

  // Band highlight — only on band scales (categorical x-axis).
  const bandHighlight = useMemo(() => {
    if (!highlightBand || hoveredIndex == null) {
      return null;
    }
    if (!('bandwidth' in xScale)) {
      return null;
    }
    const xv = data[hoveredIndex]?.[xKey];
    if (xv == null) {
      return null;
    }
    const bandScale = xScale as ScaleBand<string>;
    const x = bandScale(String(xv)) ?? 0;
    const bw = bandScale.bandwidth();
    const pad = 8;
    const rectX = Math.max(0, x - pad);
    const rectRight = Math.min(width, x + bw + pad);
    const rectWidth = rectRight - rectX;
    const topPad = Math.min(pad, margin.top);
    return (
      <rect
        x={rectX}
        y={-topPad}
        width={rectWidth}
        height={height + topPad}
        fill="currentColor"
        opacity={0.06}
        rx={4}
        pointerEvents="none"
      />
    );
  }, [
    highlightBand,
    hoveredIndex,
    xScale,
    data,
    xKey,
    width,
    height,
    margin.top,
  ]);

  // ─── Render ────────────────────────────────────────────────────────────
  if (typeof document === 'undefined') {
    // SSR: no DOM portal target; band highlight + dots still render in SVG.
    return (
      <>
        {bandHighlight}
        {dots}
      </>
    );
  }

  const cardContent =
    hoveredIndex == null ? null : render ? (
      render(xValue, seriesValues)
    ) : (
      <DefaultTooltipContent xValue={xValue} rows={seriesValues} />
    );

  return (
    <>
      {bandHighlight}
      {dots}
      {createPortal(
        <div ref={cardRef} {...stylex.props(styles.card)}>
          {cardContent}
        </div>,
        document.body,
      )}
    </>
  );
}
