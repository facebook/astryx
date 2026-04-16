/**
 * @file getXDSChartColors.ts
 * @output Pure function to resolve chart colors from a theme — no React required
 * @position Foundation utility; consumed by useXDSChartColors and non-React contexts
 *
 * Takes a token resolver function (or a defined theme + mode) and returns
 * the full chart colors API. The useXDSChartColors hook wraps this.
 */

import type {XDSDefinedTheme} from '@xds/core/theme';

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

/** The chart colors API returned by both getXDSChartColors and useXDSChartColors */
export interface XDSChartColorsAPI {
  categorical(n: number): string[];
  sequential: Record<SequentialHue, (n: number) => string[]>;
  diverging: {
    positiveNegative(n: number): string[];
    coldHot(n: number): string[];
    custom(
      neg: SequentialHue,
      pos: SequentialHue,
      n: number,
      midpoint?: string,
    ): string[];
  };
  semantic: {
    positive: string;
    negative: string;
    warning: string;
    neutral: string;
  };
  alpha(hex: string, opacity: number): string;
}

/** A function that resolves a token name to its current value */
export type TokenResolver = (name: string) => string;

// =============================================================================
// Internals
// =============================================================================

const CATEGORICAL_TOKENS = [
  '--color-data-categorical-blue',
  '--color-data-categorical-orange',
  '--color-data-categorical-purple',
  '--color-data-categorical-green',
  '--color-data-categorical-pink',
  '--color-data-categorical-cyan',
  '--color-data-categorical-red',
  '--color-data-categorical-teal',
  '--color-data-categorical-brown',
  '--color-data-categorical-indigo',
] as const;

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

function pickFromRamp(stops: string[], n: number): string[] {
  if (n <= 0) return [];
  if (n >= 5) return stops;
  if (n === 1) return [stops[2]];
  return Array.from(
    {length: n},
    (_, i) => stops[Math.round((i * 4) / (n - 1))],
  );
}

function hexAlpha(hex: string, opacity: number): string {
  const match = hex.match(
    /^#?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/,
  );
  if (!match) return hex;
  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, opacity))})`;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Build chart colors from a token resolver function.
 * This is the lowest-level API — pass any function that maps token names to values.
 */
export function getXDSChartColorsFromResolver(
  resolve: TokenResolver,
): XDSChartColorsAPI {
  const categorical = CATEGORICAL_TOKENS.map(t => resolve(t));

  const ramp = (hue: SequentialHue): string[] =>
    [5, 4, 3, 2, 1].map(step => resolve(`--color-data-${hue}-${step}`));

  const gray1 = resolve('--color-data-gray-1');

  function buildDiverging(
    negHue: SequentialHue,
    posHue: SequentialHue,
    n: number,
    midpoint: string = gray1,
  ): string[] {
    if (n <= 0) return [];
    if (n === 1) return [midpoint];
    const neg = ramp(negHue);
    const pos = ramp(posHue);
    const half = Math.floor(n / 2);
    const hasCenter = n % 2 === 1;
    const negSide = pickFromRamp(neg, half);
    const posSide = pickFromRamp(pos, half).reverse();
    if (hasCenter) return [...negSide, midpoint, ...posSide];
    return [...negSide, ...posSide];
  }

  return {
    categorical(n: number): string[] {
      if (n <= 0) return [];
      return categorical.slice(0, Math.min(n, categorical.length));
    },

    sequential: Object.fromEntries(
      SEQUENTIAL_HUES.map(hue => [
        hue,
        (n: number): string[] => {
          if (n <= 0) return [];
          return pickFromRamp(ramp(hue), n);
        },
      ]),
    ) as Record<SequentialHue, (n: number) => string[]>,

    diverging: {
      positiveNegative: (n: number) => buildDiverging('shamrock', 'red', n),
      coldHot: (n: number) => buildDiverging('blue', 'red', n),
      custom: (
        neg: SequentialHue,
        pos: SequentialHue,
        n: number,
        mid?: string,
      ) => buildDiverging(neg, pos, n, mid),
    },

    semantic: {
      positive: resolve('--color-data-categorical-green'),
      negative: resolve('--color-data-categorical-red'),
      warning: resolve('--color-data-categorical-orange'),
      neutral: resolve('--color-data-neutral'),
    },

    alpha: hexAlpha,
  };
}

/**
 * Build chart colors from a defined theme and color mode.
 *
 * Use this in non-React contexts — WebGL setup, SSR, tests, Node scripts.
 *
 * @example
 * ```
 * import { defaultTheme } from '@xds/theme-default';
 * const colors = getXDSChartColors(defaultTheme, 'light');
 * colors.categorical(5)
 * ```
 */
export function getXDSChartColors(
  theme: XDSDefinedTheme,
  mode: 'light' | 'dark' = 'light',
): XDSChartColorsAPI {
  // Build a resolver from the theme's token map
  const resolve: TokenResolver = (name: string) => {
    // Check theme token overrides first, then fall back to defaults
    const raw = theme.tokens?.[name] ?? '';
    if (!raw) return '';
    // Resolve light-dark() for the given mode
    if (raw.startsWith('light-dark(') && raw.endsWith(')')) {
      const inner = raw.slice(11, -1);
      const commaIdx = inner.indexOf(',');
      if (commaIdx !== -1) {
        const light = inner.slice(0, commaIdx).trim();
        const dark = inner.slice(commaIdx + 1).trim();
        return mode === 'light' ? light : dark;
      }
    }
    return raw;
  };

  return getXDSChartColorsFromResolver(resolve);
}
