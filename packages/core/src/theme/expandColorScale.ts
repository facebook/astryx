/**
 * @file expandColorScale.ts
 * @input Color scale configuration { accent, bodyColor?, neutralStyle?, contrast?, darkMode?, chromaBoost?, equalize? }
 * @output Token overrides for derivable color tokens
 * @position Theme utility; consumed by defineTheme.ts
 *
 * Generates color token overrides from a single accent color using the
 * HCT perceptual color model. Only produces tokens that meaningfully
 * derive from the accent — status colors, categorical hues, and fixed
 * tokens (on-dark/on-light) fall through to colorDefaults.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/defineTheme.ts
 */

import {hexToHct, hctToHex, tonalPalette, hexWithAlpha, maxChromaAtTone} from './hct';
import type {ChromaBoostOptions} from './hct';

// =============================================================================
// Types
// =============================================================================

/**
 * Color scale configuration.
 *
 * @example
 * ```
 * // Minimal — just a seed color
 * { accent: '#0064E0' }
 *
 * // With all options
 * {
 *   accent: '#B7410E',
 *   bodyColor: '#FFF6ED',
 *   neutralStyle: 'warm',
 *   contrast: 'high',
 *   darkMode: 'preserve',
 *   chromaBoost: { belowTone: 50, factor: 1.5, cap: 2.0 },
 *   equalize: true,
 * }
 * ```
 */
export interface XDSColorScaleConfig {
  /** Seed accent color as hex (#RRGGBB). Everything derives from this. */
  accent: string;

  /**
   * Body background color as hex. When provided, the neutral palette
   * derives its hue and chroma from this color instead of the accent.
   * Useful for cream, warm, or tinted body backgrounds.
   */
  bodyColor?: string;

  /**
   * Neutral tone warmth. Controls how much of the seed's hue bleeds
   * into neutral/background colors. Ignored when `bodyColor` is set.
   * @default 'cool'
   */
  neutralStyle?: 'warm' | 'cool' | 'neutral';

  /**
   * Contrast level. Affects tone assignments for text and UI elements.
   * @default 'standard'
   */
  contrast?: 'standard' | 'high';

  /**
   * Dark mode strategy for categorical/status colors.
   * - 'adaptive' (default): shift tones for dark backgrounds (T90→T30 bg, T30→T80 text)
   * - 'preserve': use identical hex values in both light and dark
   * - 'invert': swap light/dark assignments
   * @default 'adaptive'
   */
  darkMode?: 'adaptive' | 'preserve' | 'invert';

  /**
   * Chroma boost for dark tones. When provided, tonal palette
   * generation increases chroma at dark tones to keep them vibrant.
   */
  chromaBoost?: ChromaBoostOptions;

  /**
   * Perceptual equalization. When true, categorical background colors
   * are adjusted so all hues appear equally saturated at the same tone.
   * @default false
   */
  equalize?: boolean;
}

export type ColorScaleTokens = Record<string, string>;

// =============================================================================
// Neutral chroma by style
// =============================================================================

const NEUTRAL_CHROMA: Record<string, number> = {
  warm: 7,
  cool: 5,
  neutral: 3,
};

const NEUTRAL_VARIANT_CHROMA: Record<string, number> = {
  warm: 10,
  cool: 8,
  neutral: 6,
};

// =============================================================================
// Categorical hue definitions
// =============================================================================

const CATEGORICAL_HUES = [
  {name: 'green', hue: 142, chroma: 35},
  {name: 'red', hue: 25, chroma: 30},
  {name: 'yellow', hue: 85, chroma: 40},
  {name: 'blue', hue: 250, chroma: 28},
  {name: 'pink', hue: 350, chroma: 30},
  {name: 'purple', hue: 300, chroma: 25},
  {name: 'cyan', hue: 185, chroma: 22},
  {name: 'orange', hue: 60, chroma: 35},
  {name: 'teal', hue: 165, chroma: 20},
  {name: 'gray', hue: 0, chroma: 0},
];

// =============================================================================
// Perceptual equalization
// =============================================================================

/**
 * Compute a chroma value for each hue that produces the same perceived
 * colorfulness at a given tone. Uses the max in-gamut chroma as an
 * upper bound and normalizes to the smallest achievable colorfulness.
 */
function equalizeChromasAtTone(
  hues: {hue: number; chroma: number}[],
  tone: number,
): number[] {
  const maxChromas = hues.map(h =>
    h.chroma === 0 ? 0 : maxChromaAtTone(h.hue, tone),
  );
  const achievable = hues.map((h, i) => Math.min(h.chroma, maxChromas[i]));
  const minNonZero = achievable.filter(c => c > 0).reduce((a, b) => Math.min(a, b), Infinity);
  if (!isFinite(minNonZero)) return achievable;
  return achievable.map(c => (c === 0 ? 0 : minNonZero));
}

// =============================================================================
// Computation
// =============================================================================

function ld(light: string, dark: string): string {
  return `light-dark(${light}, ${dark})`;
}

/**
 * Expand a color scale config into XDS color token overrides.
 *
 * Only generates tokens that meaningfully derive from the accent color.
 * Tokens that are convention-bound (status colors, categorical hues,
 * --color-on-dark/on-light) are NOT generated — they fall through
 * to colorDefaults.
 *
 * @example
 * ```
 * const tokens = expandColorScale({ accent: '#0064E0' });
 * // tokens['--color-accent'] === 'light-dark(#..., #...)'
 * ```
 */
export function expandColorScale(
  config: XDSColorScaleConfig,
): ColorScaleTokens {
  const {
    accent,
    bodyColor,
    neutralStyle = 'cool',
    contrast = 'standard',
    darkMode = 'adaptive',
    chromaBoost,
    equalize = false,
  } = config;

  const seed = hexToHct(accent);
  const seedHue = seed.hue;

  const primaryChroma = Math.max(seed.chroma, 48);

  // Neutral palette: derive from bodyColor if provided, otherwise from accent
  let neutralHue: number;
  let neutralChroma: number;
  let neutralVariantChroma: number;

  if (bodyColor) {
    const body = hexToHct(bodyColor);
    neutralHue = body.hue;
    neutralChroma = Math.max(body.chroma, 3);
    neutralVariantChroma = Math.min(neutralChroma * 1.5, 12);
  } else {
    neutralHue = seedHue;
    neutralChroma = NEUTRAL_CHROMA[neutralStyle] ?? 5;
    neutralVariantChroma = NEUTRAL_VARIANT_CHROMA[neutralStyle] ?? 8;
  }

  const P = tonalPalette(seedHue, primaryChroma, chromaBoost);
  const N = tonalPalette(neutralHue, neutralChroma, chromaBoost);
  const NV = tonalPalette(neutralHue, neutralVariantChroma, chromaBoost);

  const isHigh = contrast === 'high';

  const textPrimaryLightTone = isHigh ? 0 : 10;
  const textPrimaryDarkTone = isHigh ? 99 : 90;
  const textSecondaryLightTone = isHigh ? 20 : 30;
  const textSecondaryDarkTone = isHigh ? 80 : 70;

  // Light-dark helper that respects darkMode strategy
  const catLd = (lightHex: string, darkHex: string): string => {
    switch (darkMode) {
      case 'preserve':
        return ld(lightHex, lightHex);
      case 'invert':
        return ld(darkHex, lightHex);
      default:
        return ld(lightHex, darkHex);
    }
  };

  const tokens: ColorScaleTokens = {
    // Core semantic
    '--color-accent': ld(P[40], P[80]),
    '--color-accent-muted': ld(
      hexWithAlpha(P[40], 0.2),
      hexWithAlpha(P[80], 0.25),
    ),
    '--color-on-accent': ld(P[100], P[20]),
    '--color-neutral': ld(hexWithAlpha(N[10], 0.1), hexWithAlpha(N[90], 0.2)),
    '--color-background-surface': ld(N[99], N[10]),
    '--color-background-body': ld(N[95], N[5]),
    '--color-overlay': ld(hexWithAlpha(N[10], 0.4), hexWithAlpha(N[10], 0.6)),
    '--color-overlay-hover': ld(
      hexWithAlpha(N[10], 0.05),
      hexWithAlpha(N[100], 0.05),
    ),
    '--color-overlay-pressed': ld(
      hexWithAlpha(N[10], 0.1),
      hexWithAlpha(N[100], 0.1),
    ),
    '--color-background-muted': ld(
      hexWithAlpha(N[10], 0.05),
      hexWithAlpha(N[10], 0.5),
    ),

    // Text
    '--color-text-primary': ld(N[textPrimaryLightTone], N[textPrimaryDarkTone]),
    '--color-text-secondary': ld(
      NV[textSecondaryLightTone],
      NV[textSecondaryDarkTone],
    ),
    '--color-text-disabled': ld(NV[60], NV[40]),
    '--color-text-accent': ld(P[30], P[80]),

    // Icon
    '--color-icon-accent': ld(P[40], P[80]),
    '--color-icon-primary': ld(N[textPrimaryLightTone], N[textPrimaryDarkTone]),
    '--color-icon-secondary': ld(
      NV[textSecondaryLightTone],
      NV[textSecondaryDarkTone],
    ),
    '--color-icon-disabled': ld(NV[60], NV[40]),

    // Surface variants
    '--color-background-card': ld(N[99], N[10]),
    '--color-background-popover': ld(N[99], N[20]),
    '--color-background-inverted': ld(N[10], N[99]),

    // Border
    '--color-border': ld(hexWithAlpha(N[10], 0.1), hexWithAlpha(N[95], 0.1)),
    '--color-border-emphasized': ld(NV[70], NV[30]),

    // Effects
    '--color-skeleton': ld(NV[70], NV[30]),
    '--color-shadow': ld(hexWithAlpha(N[0], 0.1), hexWithAlpha(N[0], 0.3)),
    '--color-tint-hover': ld('black', 'white'),
  };

  // Generate categorical colors with optional equalization
  const catHues = CATEGORICAL_HUES.filter(h => h.name !== 'gray');
  let chromas = catHues.map(h => h.chroma);

  if (equalize) {
    chromas = equalizeChromasAtTone(catHues, 90);
  }

  for (let i = 0; i < catHues.length; i++) {
    const {name, hue} = catHues[i];
    const c = chromas[i];
    const palette = tonalPalette(hue, c, chromaBoost);

    tokens[`--color-background-${name}`] = catLd(palette[90], palette[30]);
    tokens[`--color-border-${name}`] = catLd(palette[80], palette[40]);
    tokens[`--color-icon-${name}`] = catLd(palette[30], palette[80]);
    tokens[`--color-text-${name}`] = catLd(palette[30], palette[80]);
  }

  // Gray uses neutral palette
  tokens['--color-background-gray'] = catLd(N[90], N[30]);
  tokens['--color-border-gray'] = catLd(N[80], N[40]);
  tokens['--color-icon-gray'] = catLd(N[30], N[80]);
  tokens['--color-text-gray'] = catLd(N[30], N[80]);

  return tokens;
}
