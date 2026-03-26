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
 * // tokens['--radius-none'] === '0px'
 * // tokens['--radius-inner'] === '4px'
 * // tokens['--radius-element'] === '8px'
 * // tokens['--radius-container'] === '12px'
 * // tokens['--radius-page'] === '16px'
 * // tokens['--radius-full'] === '9999px'
 * ```
 */
export function expandRadiusScale(
  config: XDSRadiusScaleConfig,
): RadiusScaleTokens {
  const {base, multiplier} = config;
  return {
    '--radius-none': '0px',
    '--radius-inner': `${Math.round(base * 1 * multiplier)}px`,
    '--radius-element': `${Math.round(base * 2 * multiplier)}px`,
    '--radius-container': `${Math.round(base * 3 * multiplier)}px`,
    '--radius-page': `${Math.round(base * 4 * multiplier)}px`,
    '--radius-full': '9999px',
  };
}
