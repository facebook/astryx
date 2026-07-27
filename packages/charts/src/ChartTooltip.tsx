// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartTooltip.tsx
 * @output Grouped chart tooltip — shows all series values at the hovered x-position.
 *         Composable: drop into `<Chart tooltip>` or render directly inside a chart
 *         to take full control of props.
 * @position Reads from ChartContext — must render inside an <Chart>.
 *
 * @example
 * ```
 * // Default — declarative on Chart
 * <Chart tooltip />
 *
 * // Custom render function via Chart prop
 * <Chart tooltip={{render: (x, rows) => <MyCard x={x} rows={rows} />}} />
 *
 * // Composable — drop into the chart's children for full control
 * <Chart>
 *   <ChartTooltip hoverIndicator={false} placement="top" />
 * </Chart>
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
import {
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {Text} from '@astryxdesign/core';
import {VStack, HStack} from '@astryxdesign/core';
import {useChart} from './ChartContext';
import {ChartSwatch, swatchVariantForType} from './ChartSwatch';
import {
  deriveTooltipSeriesValues,
  shouldRenderHoverDot,
  type TooltipSeriesValue,
} from './tooltip';
import type {SeriesDef, ChartPointerEvent} from './types';
import {isBandScale, xPixel} from './utils';

export type ChartTooltipPlacement = 'auto' | 'right' | 'left' | 'top';

export interface ChartTooltipProps {
  /**
   * Series definitions — used to map the hovered datum to per-series rows.
   * When rendered via `<Chart tooltip />`, Chart injects this automatically.
   * When composing directly, pass the same `series` array you gave Chart.
   */
  series?: readonly SeriesDef[];
  /**
   * Custom render function. Receives the x-value and one row per visible series.
   * Returning `null` hides the card while still rendering the band highlight + dots.
   */
  render?: (xValue: unknown, seriesValues: TooltipSeriesValue[]) => ReactNode;
  /**
   * Whether to draw a hover indicator at the focused x-position.
   * Picks the right shape automatically:
   * - **band-highlight rect** when the chart includes bar series on a band scale
   * - **vertical crosshair line** for line / area / dot charts
   *
   * Default: `true`.
   */
  hoverIndicator?: boolean;
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
  placement?: ChartTooltipPlacement;
}

const styles = stylex.create({
  // Card chrome — static visual styles. Position (left/top/display) is updated
  // imperatively via ref to keep pointer-move cost free of React renders.
  card: {
    position: 'fixed',
    backgroundColor: colorVars['--color-background-popover'],
    border: `1px solid ${colorVars['--color-border']}`,
    borderRadius: radiusVars['--radius-container'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    boxShadow: shadowVars['--shadow-med'],
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    zIndex: 9999,
    display: 'none',
  },
  crosshair: {
    stroke: colorVars['--color-text-primary'],
    strokeWidth: 1,
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
    <VStack gap={1}>
      <Text type="body" weight="semibold">
        {String(xValue)}
      </Text>
      {rows.length === 1 ? (
        <Text type="supporting">{String(rows[0].value)}</Text>
      ) : (
        <VStack gap={1}>
          {rows.map((row, i) => (
            <HStack key={`${row.key}-${i}`} gap={2} vAlign="center">
              <ChartSwatch
                color={row.color}
                variant={swatchVariantForType(row.type)}
              />
              <Text type="supporting">{row.label}</Text>
              <Text type="supporting" weight="semibold">
                {String(row.value)}
              </Text>
            </HStack>
          ))}
        </VStack>
      )}
    </VStack>
  );
});

/**
 * Composable grouped tooltip for Chart.
 *
 * Subscribes to the chart's pointer event stream and only re-renders when the
 * hovered data index changes (not on every pointer move). Card position is
 * updated imperatively via a ref to keep pointer-move cost ~free.
 */
export function ChartTooltip({
  series = [],
  render,
  hoverIndicator = true,
  showHoverDots = true,
  placement = 'auto',
}: ChartTooltipProps) {
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
  } = useChart();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // Whether the card is currently suppressed (no content, or a custom `render`
  // opted out by returning null). positionCard reads this so a same-index
  // pointer move — which repositions the card without a React commit — can't
  // re-reveal a card the visibility effect below has hidden.
  const cardHiddenRef = useRef(false);

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
      if (!svg || !e.nearest || cardHiddenRef.current) {
        card.style.display = 'none';
        return;
      }
      const svgRect = svg.getBoundingClientRect();
      const screenX = svgRect.left + margin.left + e.nearest.px;
      const screenY = svgRect.top + margin.top;
      const cardWidth = card.offsetWidth;
      const cardHeight = card.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
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

      // Clamp to the viewport so the card never clips off-screen — it's
      // portaled and position:fixed, so this keeps it fully visible for every
      // placement (pinned placements and the near-edge `auto` flip alike).
      x = Math.max(gap, Math.min(x, viewportWidth - cardWidth - gap));
      y = Math.max(gap, Math.min(y, viewportHeight - cardHeight - gap));

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
        // Optimistically treat the new index as showable; the visibility effect
        // re-hides it after commit if there's no content (e.g. custom `render`
        // returned null). This keeps the card appearing on the first move.
        cardHiddenRef.current = false;
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
      const points = s._uid ? resolved.get(s._uid) : undefined;
      const point = points?.find(p => p.dataIndex === hoveredIndex);
      // A resolved point exists at every index, but its coordinates are NaN when
      // this series' value here is missing/non-finite (the mark itself filters
      // these at render time — mirror that so we never emit cx/cy="NaN").
      if (!point || !Number.isFinite(point.px) || !Number.isFinite(point.py)) {
        continue;
      }
      elements.push(
        <circle
          key={s._uid}
          cx={point.px}
          cy={point.py}
          r={4}
          fill="var(--color-background-surface)"
          stroke={
            s.color ?? s._resolvedColor ?? 'var(--color-border-emphasized)'
          }
          strokeWidth={2}
          pointerEvents="none"
        />,
      );
    }
    return elements;
  }, [showHoverDots, hoveredIndex, series, resolved]);

  // Hover indicator — band-highlight rect for bar charts, vertical crosshair
  // line for line/area charts. Same source-of-truth (hoveredIndex), distinct
  // visual idioms picked automatically based on the series mix.
  const hoverIndicatorElement = useMemo(() => {
    if (!hoverIndicator || hoveredIndex == null) {
      return null;
    }
    const hoveredDatum = data[hoveredIndex];
    const xv = hoveredDatum?.[xKey];
    if (hoveredDatum == null || xv == null) {
      return null;
    }
    const hasBars = series.some(s => s.type === 'bar');

    // Bar charts on a band scale → soft column highlight.
    if (hasBars && isBandScale(xScale)) {
      const x = xScale(String(xv)) ?? 0;
      const bw = xScale.bandwidth();
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
    }

    // Line / area / dot charts → vertical crosshair through the point
    // (band-center or linear position, resolved by the shared helper).
    const px = xPixel(hoveredDatum, xKey, xScale);
    // xPixel returns NaN for a non-finite x on a linear scale; skip rather than
    // emit x1/x2="NaN". (The band branch above is always finite via `?? 0`.)
    if (!Number.isFinite(px)) {
      return null;
    }
    return (
      <line
        x1={px}
        x2={px}
        y1={0}
        y2={height}
        {...stylex.props(styles.crosshair)}
        pointerEvents="none"
      />
    );
  }, [
    hoverIndicator,
    hoveredIndex,
    series,
    xScale,
    data,
    xKey,
    width,
    height,
    margin.top,
  ]);

  // Single source of truth for whether the card has anything to show. It's
  // hidden when there's no hover, when the hovered index is stale/out-of-range
  // (e.g. `data` shrank while hovering, so `datum` is undefined), or when a
  // custom `render` opts out by returning null — the documented contract, which
  // still shows the band highlight + dots. The decision is stored in a ref so
  // the imperative positionCard honors it on subsequent same-index moves
  // (otherwise it would re-reveal an empty bordered box). Runs after commit, so
  // `render` (which may return null, or throw) never executes on the SSR path.
  useEffect(() => {
    const hidden =
      hoveredIndex == null ||
      datum == null ||
      (render != null && render(xValue, seriesValues) == null);
    cardHiddenRef.current = hidden;
    if (hidden) {
      const card = cardRef.current;
      if (card) {
        card.style.display = 'none';
      }
    }
  }, [render, hoveredIndex, datum, xValue, seriesValues]);

  // ─── Render ────────────────────────────────────────────────────────────
  if (typeof document === 'undefined') {
    // SSR: no DOM portal target; band highlight + dots still render in SVG.
    return (
      <>
        {hoverIndicatorElement}
        {dots}
      </>
    );
  }

  // Mirrors the visibility effect's first two conditions: no card when there's
  // no hover or the hovered datum is stale/out-of-range (so `render` and the
  // default body are never called with an undefined x-value + empty rows).
  const cardContent =
    hoveredIndex == null || datum == null ? null : render ? (
      render(xValue, seriesValues)
    ) : (
      <DefaultTooltipContent xValue={xValue} rows={seriesValues} />
    );

  return (
    <>
      {hoverIndicatorElement}
      {dots}
      {createPortal(
        <div ref={cardRef} role="tooltip" {...stylex.props(styles.card)}>
          {cardContent}
        </div>,
        document.body,
      )}
    </>
  );
}
