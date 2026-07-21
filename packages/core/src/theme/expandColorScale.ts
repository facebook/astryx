// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file expandColorScale.ts
 * @input Color scale configuration { accent?, neutralStyle?, contrast? }
 * @output Token overrides for derivable color tokens
 * @position Theme utility; consumed by defineTheme.ts
 *
 * Generates color token overrides from a single accent color using the
 * HCT perceptual color model. Only produces tokens that meaningfully
 * derive from the accent — status colors, categorical hues, and fixed
 * tokens (on-dark/on-light) fall through to colorDefaults.
 *
 * `accent` is optional: a neutral-only config still gets the full neutral
 * ramp (seeded from the default accent's hue) while the accent tokens
 * themselves fall through to colorDefaults, same as the tokens above.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/defineTheme.ts
 */

import {hexToHct, tonalPalette, hexWithAlpha} from './hct';

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
 * // With customization
 * { accent: '#B7410E', neutralStyle: 'warm', contrast: 'high' }
 *
 * // Neutral-only — keeps the default accent, themes the neutrals
 * { neutralStyle: 'warm' }
 * ```
 */
export interface ColorScaleConfig {
  /**
   * Seed accent color as hex (#RRGGBB). Everything derives from this.
   *
   * Optional. When omitted, the neutral palettes are seeded from the
   * default accent's hue and the accent tokens (--color-accent,
   * --color-accent-muted, --color-on-accent) are not generated — they
   * fall through to colorDefaults.
   */
  accent?: string;

  /**
   * Neutral tone warmth. Controls how much of the seed's hue bleeds
   * into neutral/background colors.
   * @default 'cool'
   */
  neutralStyle?: 'warm' | 'cool' | 'neutral';

  /**
   * Contrast level. Affects tone assignments for text and UI elements.
   * @default 'standard'
   */
  contrast?: 'standard' | 'high';
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

/**
 * Hue source for accent-less configs — the light half of
 * colorDefaults['--color-accent'] (a test guards the two against drift).
 * Only its hue reaches the output: the accent tokens stay ungenerated, so
 * they keep their colorDefaults values rather than this seed's derivation.
 */
const DEFAULT_ACCENT_SEED = '#0064E0';

// =============================================================================
// Computation
// =============================================================================

function ld(light: string, dark: string): string {
  return `light-dark(${light}, ${dark})`;
}

function accentWithAlpha(alpha: number): string {
  return `color-mix(in srgb, var(--color-accent) ${alpha * 100}%, transparent)`;
}

/**
 * Expand a color scale config into Astryx color token overrides.
 *
 * Only generates tokens that meaningfully derive from the accent color.
 * Tokens that are convention-bound (status colors, categorical hues,
 * --color-on-dark/on-light) are NOT generated — they fall through
 * to colorDefaults.
 *
 * Without an `accent`, the accent tokens join that fall-through set: the
 * neutrals are seeded from the default accent's hue, and --color-accent,
 * --color-accent-muted and --color-on-accent keep their colorDefaults values.
 *
 * @example
 * ```
 * const tokens = expandColorScale({ accent: '#0064E0' });
 * // tokens['--color-accent'] === 'light-dark(#..., #...)'
 *
 * const neutralOnly = expandColorScale({ neutralStyle: 'warm' });
 * // neutralOnly['--color-accent'] === undefined
 * ```
 */
export function expandColorScale(config: ColorScaleConfig): ColorScaleTokens {
  const {accent, neutralStyle = 'cool', contrast = 'standard'} = config;

  const seed = hexToHct(accent ?? DEFAULT_ACCENT_SEED);
  const seedHue = seed.hue;

  const primaryChroma = Math.max(seed.chroma, 48);
  const neutralChroma = NEUTRAL_CHROMA[neutralStyle] ?? 5;
  const neutralVariantChroma = NEUTRAL_VARIANT_CHROMA[neutralStyle] ?? 8;

  const P = tonalPalette(seedHue, primaryChroma);
  const N = tonalPalette(seedHue, neutralChroma);
  const NV = tonalPalette(seedHue, neutralVariantChroma);

  const isHigh = contrast === 'high';

  const textPrimaryLightTone = isHigh ? 0 : 10;
  const textPrimaryDarkTone = isHigh ? 99 : 90;
  const textSecondaryLightTone = isHigh ? 20 : 30;
  const textSecondaryDarkTone = isHigh ? 80 : 70;

  return {
    // Core semantic — only with a seed accent. Without one these fall through
    // to colorDefaults, whose --color-accent is NOT what the default seed
    // derives: defaulting the seed instead of omitting the tokens would
    // recolor every neutral-only theme. Nullish and not truthy, matching the
    // seed above, so a supplied-but-malformed accent keeps its old behavior.
    ...(accent != null
      ? {
          '--color-accent': ld(P[40], P[80]),
          // Derived accent tokens reference --color-accent instead of baking its
          // resolved hex, so a scoped override of the base token re-accents the
          // whole subtree at runtime. --color-on-accent stays baked: it is a
          // contrast computation against the accent, which CSS cannot express.
          '--color-accent-muted': ld(
            accentWithAlpha(0.2),
            accentWithAlpha(0.25),
          ),
          '--color-on-accent': ld(P[100], P[20]),
        }
      : null),
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
    '--color-text-accent': 'var(--color-accent)',

    // Icon
    '--color-icon-accent': 'var(--color-accent)',
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
    // Channel-on-body surface (ProgressBar/Slider tracks, Switch off-state).
    // Defaults to the same NV[70]/NV[30] ramp stop as --color-skeleton.
    '--color-track': ld(NV[70], NV[30]),
    '--color-shadow': ld(hexWithAlpha(N[0], 0.1), hexWithAlpha(N[0], 0.3)),
    '--color-tint-hover': ld('black', 'white'),
  };
}
