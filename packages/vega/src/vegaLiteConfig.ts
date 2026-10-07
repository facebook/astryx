// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vegaLiteConfig.ts
 * @input Concrete Astryx token resolver supplied by the caller
 * @output Serializable Vega-Lite Config object for Astryx-themed charts
 * @position Renderer config utility; consumed by VegaChart and exported standalone
 *
 * The builder owns structural Vega-Lite configuration. Colors come from the
 * caller's resolved Astryx data tokens and remain plain serializable values.
 */

import type {Config as VegaLiteConfig} from 'vega-lite';

// ---------------------------------------------------------------------------
// Constants (ported from XDSDataVizVegaLiteConstants)
// ---------------------------------------------------------------------------

/** Default stroke width for line marks */
export const DEFAULT_STROKE_WIDTH = 2;

/** Default point size for point marks */
export const DEFAULT_POINT_SIZE = 64;

/** Default legend orientation */
export const DEFAULT_LEGEND_ORIENT = 'right' as const;

/** Offset between legend and chart area */
export const LEGEND_OFFSET = 16;

/** Offset between title and chart area */
export const TITLE_OFFSET = 16;

// ---------------------------------------------------------------------------
// Token resolution helper
// ---------------------------------------------------------------------------

/**
 * A token resolver function — matches the `token` function returned by
 * `useTheme()`. It accepts a CSS custom-property name and returns its concrete
 * value for the caller's effective color mode.
 */
type TokenResolver = (name: string) => string;

// ---------------------------------------------------------------------------
// Config builder
// ---------------------------------------------------------------------------

/**
 * Build a Vega-Lite `Config` object themed with Astryx tokens.
 *
 * Call this inside a component with `useTheme()`, or pass a resolver over an
 * explicit resolved token map for server rendering and export:
 *
 * ```
 * const {token} = useTheme();
 * const config = buildVegaLiteConfig(token);
 * ```
 *
 * The returned config sets axis styles, legend layout, line/point mark
 * defaults, title typography, and view chrome — everything except color
 * scales (which are set via `range` using the Astryx data-viz tokens).
 */
export function buildVegaLiteConfig(
  resolveToken: TokenResolver,
): VegaLiteConfig {
  const token: TokenResolver = name => {
    const value = resolveToken(name);
    if (value.includes('var(')) {
      throw new Error(
        `Vega-Lite config requires a concrete value for ${name}; received ${value}.`,
      );
    }
    return value;
  };

  return {
    axis: {
      domainColor: token('--color-icon-primary'),
      domainWidth: 0.5,
      gridColor: token('--color-background-muted'),
      labelColor: token('--color-text-secondary'),
      labelFont: token('--font-family-body'),
      labelFontSize: 12,
      labelLineHeight: 16,
      labelPadding: 8,
      tickCount: 5,
      ticks: false,
      title: null,
    },

    axisX: {
      grid: false,
    },

    axisXQuantitative: {
      domain: true,
    },

    axisY: {
      domain: false,
    },

    axisYQuantitative: {
      grid: true,
      gridWidth: 0.5,
    },

    background: token('--color-background-card'),

    legend: {
      labelColor: token('--color-text-secondary'),
      labelFont: token('--font-family-body'),
      labelFontSize: 12,
      labelPadding: 8,
      offset: LEGEND_OFFSET,
      orient: DEFAULT_LEGEND_ORIENT,
      rowPadding: 12,
      title: null,
      titleColor: token('--color-text-secondary'),
      titleFont: token('--font-family-heading'),
      titleFontSize: 16,
    },

    line: {
      strokeCap: 'round',
      strokeJoin: 'round',
      strokeWidth: DEFAULT_STROKE_WIDTH,
    },

    padding: 16,

    point: {
      shape: 'circle',
      size: DEFAULT_POINT_SIZE,
      fill: token('--color-background-card'),
    },

    range: {
      category: [
        token('--color-data-categorical-blue'),
        token('--color-data-categorical-orange'),
        token('--color-data-categorical-purple'),
        token('--color-data-categorical-green'),
        token('--color-data-categorical-pink'),
        token('--color-data-categorical-cyan'),
        token('--color-data-categorical-red'),
        token('--color-data-categorical-teal'),
        token('--color-data-categorical-brown'),
        token('--color-data-categorical-indigo'),
      ],
      diverging: [
        token('--color-data-blue-5'),
        token('--color-data-blue-4'),
        token('--color-data-blue-3'),
        token('--color-data-blue-2'),
        token('--color-data-blue-1'),
        token('--color-data-gray-1'),
        token('--color-data-red-1'),
        token('--color-data-red-2'),
        token('--color-data-red-3'),
        token('--color-data-red-4'),
        token('--color-data-red-5'),
      ],
      heatmap: [
        token('--color-data-blue-1'),
        token('--color-data-blue-2'),
        token('--color-data-blue-3'),
        token('--color-data-blue-4'),
        token('--color-data-blue-5'),
      ],
      ordinal: [
        token('--color-data-blue-5'),
        token('--color-data-blue-4'),
        token('--color-data-blue-3'),
        token('--color-data-blue-2'),
        token('--color-data-blue-1'),
      ],
      ramp: [
        token('--color-data-blue-1'),
        token('--color-data-blue-2'),
        token('--color-data-blue-3'),
        token('--color-data-blue-4'),
        token('--color-data-blue-5'),
      ],
    },

    scale: {
      bandPaddingInner: 0.1,
    },

    text: {
      color: token('--color-text-primary'),
    },

    title: {
      anchor: 'start',
      color: token('--color-text-primary'),
      subtitleFontWeight: 'normal',
      subtitleColor: token('--color-text-secondary'),
      offset: TITLE_OFFSET,
    },

    view: {
      stroke: null,
    },
  } satisfies VegaLiteConfig;
}
