/**
 * @file expandSpacingScale.ts
 * @input Spacing scale configuration { base }
 * @output Token overrides for spacing tokens
 * @position Theme utility; consumed by defineTheme.ts
 *
 * Computes spacing values from a base unit.
 * --spacing-0 is always 0px (fixed).
 * All other stops = base * step.
 *
 * Semantic scale:
 *   --spacing-0    → 0px (fixed)
 *   --spacing-0-5  → base × 0.5
 *   --spacing-1    → base × 1
 *   --spacing-1-5  → base × 1.5
 *   --spacing-2    → base × 2
 *   --spacing-3    → base × 3
 *   --spacing-4    → base × 4
 *   --spacing-5    → base × 5
 *   --spacing-6    → base × 6
 *   --spacing-7    → base × 7
 *   --spacing-8    → base × 8
 *   --spacing-9    → base × 9
 *   --spacing-10   → base × 10
 *   --spacing-11   → base × 11
 *   --spacing-12   → base × 12
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/expandSpacingScale.test.ts
 * - /packages/core/src/theme/defineTheme.ts
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Spacing scale configuration.
 *
 * @example
 * ```
 * // Default XDS spacing scale
 * { base: 4 }
 *
 * // Comfortable / spacious
 * { base: 6 }
 *
 * // Compact
 * { base: 3 }
 * ```
 */
export interface XDSSpacingScaleConfig {
  /** Base spacing unit in px. Default: 4 */
  base: number;
}

/**
 * Generated spacing token overrides.
 * Keys are CSS custom property names, values are CSS strings.
 */
export type SpacingScaleTokens = Record<string, string>;

// =============================================================================
// Computation
// =============================================================================

/**
 * Expand a spacing scale config into token overrides.
 *
 * --spacing-0 is a fixed anchor at 0px.
 * All other tokens scale linearly with the base unit.
 *
 * @example
 * ```
 * const tokens = expandSpacingScale({ base: 4 });
 * // tokens['--spacing-0'] === '0px'
 * // tokens['--spacing-1'] === '4px'
 * // tokens['--spacing-2'] === '8px'
 * // tokens['--spacing-4'] === '16px'
 *
 * const comfortable = expandSpacingScale({ base: 6 });
 * // tokens['--spacing-1'] === '6px'
 * // tokens['--spacing-2'] === '12px'
 * ```
 */
export function expandSpacingScale(
  config: XDSSpacingScaleConfig,
): SpacingScaleTokens {
  const {base} = config;
  return {
    '--spacing-0': '0px',
    '--spacing-0-5': `${Math.round(base * 0.5)}px`,
    '--spacing-1': `${Math.round(base * 1)}px`,
    '--spacing-1-5': `${Math.round(base * 1.5)}px`,
    '--spacing-2': `${Math.round(base * 2)}px`,
    '--spacing-3': `${Math.round(base * 3)}px`,
    '--spacing-4': `${Math.round(base * 4)}px`,
    '--spacing-5': `${Math.round(base * 5)}px`,
    '--spacing-6': `${Math.round(base * 6)}px`,
    '--spacing-7': `${Math.round(base * 7)}px`,
    '--spacing-8': `${Math.round(base * 8)}px`,
    '--spacing-9': `${Math.round(base * 9)}px`,
    '--spacing-10': `${Math.round(base * 10)}px`,
    '--spacing-11': `${Math.round(base * 11)}px`,
    '--spacing-12': `${Math.round(base * 12)}px`,
  };
}
