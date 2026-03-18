/**
 * @file expandMotionScale.ts
 * @input Motion scale configuration { fast, medium, ratio, easing? }
 * @output Token overrides for duration and easing primitives
 * @position Theme utility; consumed by defineTheme.ts
 *
 * Computes duration min/max variants from base values and a scaling ratio:
 *   min = base × ratio
 *   max = base / ratio
 *
 * This gives theme authors a simple 3-value interface (fast, medium, ratio)
 * that expands into a coherent 6-token duration scale. A "snappy" theme
 * lowers the base; a "cinematic" theme raises it — and the proportional
 * relationships between variants are preserved automatically.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/expandMotionScale.test.ts
 * - /packages/core/src/theme/defineTheme.ts
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Motion scale configuration.
 *
 * @example
 * ```
 * // Default XDS motion scale
 * { fast: 175, medium: 410, ratio: 0.75 }
 *
 * // Snappy theme (reduced motion budget)
 * { fast: 100, medium: 250, ratio: 0.75 }
 *
 * // Cinematic theme (dramatic animations)
 * { fast: 200, medium: 500, ratio: 0.7 }
 *
 * // With custom easing
 * { fast: 175, medium: 410, ratio: 0.75, easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)' }
 * ```
 */
export interface XDSMotionScaleConfig {
  /** Base duration for micro-interactions in ms (hover, toggle, checkbox). */
  fast: number;
  /** Base duration for entrance/exit animations in ms (dialog, drawer, panel). */
  medium: number;
  /**
   * Scaling ratio for min/max variants.
   * min = base × ratio, max = base / ratio.
   * Typical range: 0.65–0.85. Default: 0.75.
   */
  ratio: number;
  /** Optional easing curve override for --easing-standard. */
  easing?: string;
}

/** Token overrides produced by expandMotionScale. */
export type MotionScaleTokens = Record<string, string>;

// =============================================================================
// Implementation
// =============================================================================

/**
 * Round a duration in ms to the nearest 5ms for clean token values.
 */
function roundMs(ms: number): number {
  return Math.round(ms / 5) * 5;
}

/**
 * Expand a motion scale configuration into duration and easing token overrides.
 *
 * Duration computation:
 *   fast-min  = fast × ratio    (smallest micro-interaction)
 *   fast      = fast             (standard micro-interaction)
 *   fast-max  = fast / ratio    (slightly longer micro-interaction)
 *   medium-min = medium × ratio (quick entrance/exit)
 *   medium     = medium          (standard entrance/exit)
 *   medium-max = medium / ratio (dramatic entrance)
 *
 * @param config — Motion scale configuration
 * @returns Token overrides to merge into the theme token map
 */
export function expandMotionScale(
  config: XDSMotionScaleConfig,
): MotionScaleTokens {
  const {fast, medium, ratio, easing} = config;

  const tokens: MotionScaleTokens = {
    // Duration primitives
    '--duration-fast-min': `${roundMs(fast * ratio)}ms`,
    '--duration-fast': `${roundMs(fast)}ms`,
    '--duration-fast-max': `${roundMs(fast / ratio)}ms`,
    '--duration-medium-min': `${roundMs(medium * ratio)}ms`,
    '--duration-medium': `${roundMs(medium)}ms`,
    '--duration-medium-max': `${roundMs(medium / ratio)}ms`,
  };

  // Easing override (optional — default comes from easingDefaults)
  if (easing) {
    tokens['--easing-standard'] = easing;
  }

  return tokens;
}
