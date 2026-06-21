// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tooltip.ts
 * @output Tooltip types + series-value derivation
 * @position Used by Chart to bridge series + hovered datum → tooltip rows.
 *           Mirrors the legend.ts split: data shaping lives here, presentation
 *           lives in ChartTooltip.tsx.
 */

import {isUtilityMarkType, type SeriesDef} from './types';

/**
 * One row of tooltip data — represents a single series' value at the
 * hovered x-position. Stable shape so custom `render` functions can rely on it.
 */
export interface TooltipSeriesValue {
  /** Series key (matches SeriesDef.key) */
  key: string;
  /** Display label — falls back to key when not set on the series */
  label: string;
  /** Series color token */
  color: string;
  /** Mark type — drives swatch variant in the default render */
  type: string;
  /** Raw value at the hovered x for this series */
  value: unknown;
}

/**
 * Build the ordered list of tooltip rows for a given hovered datum.
 * Skips utility marks and any series the layout couldn't resolve.
 *
 * Pure / synchronous — safe to memoize on the caller.
 */
export function deriveTooltipSeriesValues(
  series: readonly SeriesDef[],
  datum: Record<string, unknown> | undefined,
  resolvedKeys: ReadonlySet<string>,
): TooltipSeriesValue[] {
  if (!datum) {
    return [];
  }
  const out: TooltipSeriesValue[] = [];
  for (const s of series) {
    if (isUtilityMarkType(s.type)) {
      continue;
    }
    if (!resolvedKeys.has(s.key)) {
      continue;
    }
    out.push({
      key: s.key,
      label: s.label ?? s.key,
      color: s.color ?? 'var(--color-text-primary)',
      type: s.type,
      value: datum[s.dataKeys[0]],
    });
  }
  return out;
}

/**
 * Whether a series should render a hover dot at the focused index.
 * Bars get a band-highlight rect instead, and utility marks have no
 * data point to highlight.
 */
export function shouldRenderHoverDot(seriesType: string): boolean {
  return seriesType !== 'bar' && !isUtilityMarkType(seriesType);
}
