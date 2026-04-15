/**
 * @file XDSChartColors.ts
 * @input dataTokenDefaults from core theme tokens
 * @output XDSChartColors — palette accessor for categorical, sequential, and diverging colors
 * @position Lab utility; consumed by chart components and any data-visualization surface
 *
 * Provides a typed, discoverable API over the raw --color-data-* CSS custom properties.
 * Returns curated token values from the XDS data visualization palette.
 */

import {dataTokenDefaults} from '@xds/core/theme';

// =============================================================================
// Types
// =============================================================================

/** Hue names available in the sequential ramps */
export type SequentialHue =
  | 'blue'
  | 'shamrock'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow'
  | 'gray';

// =============================================================================
// Internals
// =============================================================================

/**
 * Resolve a token default to its light-mode hex value.
 * dataTokenDefaults stores values as 'light-dark(#hex, #hex)'.
 */
function resolve(token: string): string {
  const match = token.match(/#[0-9A-Fa-f]{6}/);
  return match ? match[0] : token;
}

/** The 10 curated categorical colors in token order */
const CATEGORICAL = [
  'blue',
  'orange',
  'purple',
  'green',
  'pink',
  'cyan',
  'red',
  'teal',
  'brown',
  'indigo',
].map(name =>
  resolve(
    dataTokenDefaults[
      `--color-data-categorical-${name}` as keyof typeof dataTokenDefaults
    ],
  ),
);

const SEQUENTIAL_HUES: SequentialHue[] = [
  'blue',
  'shamrock',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
  'gray',
];

/** Default diverging midpoint — gray-1 per design specs */
const GRAY_1 = resolve(dataTokenDefaults['--color-data-gray-1']);

/** 5-step ramp for a hue: darkest (5) → lightest (1) */
function ramp(hue: SequentialHue): string[] {
  return [5, 4, 3, 2, 1].map(step =>
    resolve(
      dataTokenDefaults[
        `--color-data-${hue}-${step}` as keyof typeof dataTokenDefaults
      ],
    ),
  );
}

/** Pick n evenly spaced items from a 5-stop ramp */
function pickFromRamp(stops: string[], n: number): string[] {
  if (n >= 5) return stops;
  if (n === 1) return [stops[2]]; // midpoint
  return Array.from(
    {length: n},
    (_, i) => stops[Math.round((i * 4) / (n - 1))],
  );
}

/**
 * Build a diverging palette from two hues and a midpoint.
 * Picks stops from each hue's ramp (darkest → lightest) with midpoint between.
 * Max meaningful size is 11 (5 negative + midpoint + 5 positive).
 */
function buildDiverging(
  negativeHue: SequentialHue,
  positiveHue: SequentialHue,
  n: number,
  midpoint: string = GRAY_1,
): string[] {
  if (n <= 0) return [];
  if (n === 1) return [midpoint];

  const neg = ramp(negativeHue);
  const pos = ramp(positiveHue);

  const half = Math.floor(n / 2);
  const hasCenter = n % 2 === 1;

  const negSide = pickFromRamp(neg, half);
  const posSide = pickFromRamp(pos, half).reverse(); // lightest → darkest

  if (hasCenter) {
    return [...negSide, midpoint, ...posSide];
  }
  return [...negSide, ...posSide];
}

// =============================================================================
// Public API
// =============================================================================

/**
 * XDS Chart Colors — typed palette accessor for data visualization.
 *
 * All methods return resolved hex strings usable in SVG fill/stroke,
 * CSS, canvas, or any rendering context.
 *
 * @example
 * ```
 * XDSChartColors.categorical(5)
 * XDSChartColors.sequential.blue(3)
 * XDSChartColors.diverging.positiveNegative(5)
 * XDSChartColors.diverging.coldHot(7)
 * XDSChartColors.diverging.custom('blue', 'orange', 7)
 * XDSChartColors.semantic.positive
 * ```
 */
export const XDSChartColors = {
  /**
   * Categorical palette — distinct colors for unrelated series.
   * Returns up to 10 curated colors from the XDS data token palette.
   */
  categorical(n: number): string[] {
    if (n <= 0) return [];
    return CATEGORICAL.slice(0, Math.min(n, CATEGORICAL.length));
  },

  /**
   * Sequential ramps — ordered colors within a single hue.
   * Returns up to 5 curated stops (darkest → lightest).
   */
  sequential: Object.fromEntries(
    SEQUENTIAL_HUES.map(hue => [
      hue,
      (n: number): string[] => {
        if (n <= 0) return [];
        return pickFromRamp(ramp(hue), n);
      },
    ]),
  ) as Record<SequentialHue, (n: number) => string[]>,

  /**
   * Diverging palettes — two sequential hues meeting at a neutral midpoint.
   *
   * Presets match design specs (gray-1 midpoint):
   * - `positiveNegative` — shamrock → gray-1 → red
   * - `coldHot` — blue → gray-1 → red
   *
   * Use `custom` for any hue combination or a custom midpoint.
   */
  diverging: {
    /** shamrock → gray-1 → red (gain/loss, positive/negative) */
    positiveNegative(n: number): string[] {
      return buildDiverging('shamrock', 'red', n);
    },

    /** blue → gray-1 → red (cold/hot, low/high) */
    coldHot(n: number): string[] {
      return buildDiverging('blue', 'red', n);
    },

    /**
     * Custom diverging palette from any two hues.
     * Default midpoint is gray-1; pass a hex string to override.
     */
    custom(
      negativeHue: SequentialHue,
      positiveHue: SequentialHue,
      n: number,
      midpoint?: string,
    ): string[] {
      return buildDiverging(negativeHue, positiveHue, n, midpoint);
    },
  },

  /** Semantic colors — fixed-meaning data values */
  semantic: {
    positive: resolve(
      dataTokenDefaults[
        '--color-data-categorical-green' as keyof typeof dataTokenDefaults
      ],
    ),
    negative: resolve(
      dataTokenDefaults[
        '--color-data-categorical-red' as keyof typeof dataTokenDefaults
      ],
    ),
    warning: resolve(
      dataTokenDefaults[
        '--color-data-categorical-orange' as keyof typeof dataTokenDefaults
      ],
    ),
    neutral: resolve(dataTokenDefaults['--color-data-neutral']),
  },

  /**
   * Add alpha (opacity) to any hex color. Returns an rgba() string.
   * Composable with any palette color for data-driven opacity.
   *
   * @example
   * ```
   * XDSChartColors.alpha('#0171E3', 0.5)       // 'rgba(1,113,227,0.5)'
   * XDSChartColors.alpha(XDSChartColors.categorical(1)[0], d.confidence)
   * ```
   */
  alpha(hex: string, opacity: number): string {
    const match = hex.match(
      /^#?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/,
    );
    if (!match) return hex;
    const r = parseInt(match[1], 16);
    const g = parseInt(match[2], 16);
    const b = parseInt(match[3], 16);
    return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, opacity))})`;
  },
} as const;
