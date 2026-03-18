/**
 * @file expandRadiusScale.ts
 * @input Radius scale configuration { base, multiplier }
 * @output Token overrides for radius tokens
 * @position Theme utility; consumed by defineTheme.ts
 *
 * Computes border-radius values from a base unit and multiplier.
 * radius-0 and radius-rounded are always fixed (never affected by multiplier).
 * radius-1 through radius-4 = base * step * multiplier.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/expandRadiusScale.test.ts
 * - /packages/core/src/theme/defineTheme.ts
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Radius scale configuration.
 *
 * @example
 * ```
 * // Default XDS radius scale
 * { base: 4, multiplier: 1 }
 *
 * // Sharp/brutalist — all radii become 0
 * { base: 4, multiplier: 0 }
 *
 * // Extra rounded
 * { base: 4, multiplier: 1.5 }
 * ```
 */
export interface XDSRadiusScaleConfig {
  /** Base radius unit in px. Default: 4 */
  base: number;
  /** Multiplier applied to all scalable tokens. Default: 1. Range: 0-2 */
  multiplier: number;
}

/**
 * Generated radius token overrides.
 * Keys are CSS custom property names, values are CSS strings.
 */
export type RadiusScaleTokens = Record<string, string>;

// =============================================================================
// Computation
// =============================================================================

/**
 * Expand a radius scale config into token overrides.
 *
 * radius-0 and radius-rounded are always fixed (never affected by multiplier).
 * radius-1 through radius-4 = base * step * multiplier
 *
 * @example
 * ```
 * const tokens = expandRadiusScale({ base: 4, multiplier: 1 });
 * // tokens['--radius-0'] === '0px'
 * // tokens['--radius-1'] === '4px'
 * // tokens['--radius-2'] === '8px'
 * // tokens['--radius-3'] === '12px'
 * // tokens['--radius-4'] === '16px'
 * // tokens['--radius-rounded'] === '9999px'
 * ```
 */
export function expandRadiusScale(
  config: XDSRadiusScaleConfig,
): RadiusScaleTokens {
  const {base, multiplier} = config;
  return {
    '--radius-0': '0px',
    '--radius-1': `${Math.round(base * 1 * multiplier)}px`,
    '--radius-2': `${Math.round(base * 2 * multiplier)}px`,
    '--radius-3': `${Math.round(base * 3 * multiplier)}px`,
    '--radius-4': `${Math.round(base * 4 * multiplier)}px`,
    '--radius-rounded': '9999px',
  };
}
