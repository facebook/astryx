/**
 * @file expandTypeScale.ts
 * @input Type scale configuration { base, ratio }
 * @output Token overrides for heading and text typography
 * @position Theme utility; consumed by defineTheme.ts
 *
 * Computes font sizes, weights, and line heights from a base size and
 * scaling ratio using a geometric progression: size = base × ratio^step.
 *
 * The heading scale is anchored at h4 = base. Headings h1–h3 scale up,
 * h5–h6 scale down. Text types are mapped to fixed steps relative to base.
 *
 * Line heights are snapped to a 4px grid for visual rhythm.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/expandTypeScale.test.ts
 * - /packages/core/src/theme/defineTheme.ts
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Type scale configuration.
 *
 * @example
 * ```
 * // Default XDS type scale
 * { base: 14, ratio: 1.2 }
 *
 * // Suggested starting points:
 * //   Dense/functional: { base: 12, ratio: 1.125 }
 * //   Default:          { base: 14, ratio: 1.2 }
 * //   Airy/editorial:   { base: 16, ratio: 1.25 }
 * ```
 */
export interface XDSTypeScaleConfig {
  /** Base font size in px. Anchored to h4 and body text. */
  base: number;
  /** Scaling ratio for the geometric progression. */
  ratio: number;
}

/**
 * Generated typography token overrides.
 * Keys are CSS custom property names, values are CSS strings.
 */
export type TypeScaleTokens = Record<string, string>;

// =============================================================================
// Constants
// =============================================================================

/**
 * Heading level → step offset from base (h4 = 0).
 * h1 is 3 steps above base, h6 is 2 steps below.
 */
const HEADING_STEPS: Record<number, number> = {
  1: 3,
  2: 2,
  3: 1,
  4: 0,
  5: -1,
  6: -2,
};

/**
 * Text type → step offset from base.
 * body/label/code are at base, large is one step up, supporting one step down.
 */
const TEXT_STEPS: Record<string, number> = {
  body: 0,
  large: 1,
  label: 0,
  code: 0,
  supporting: -1,
};

/**
 * Default font weights per heading level.
 */
const HEADING_WEIGHTS: Record<number, string> = {
  1: 'var(--font-weight-semibold)',
  2: 'var(--font-weight-semibold)',
  3: 'var(--font-weight-semibold)',
  4: 'var(--font-weight-semibold)',
  5: 'var(--font-weight-semibold)',
  6: 'var(--font-weight-semibold)',
};

/**
 * Default font weights per text type.
 */
const TEXT_WEIGHTS: Record<string, string> = {
  body: 'var(--font-weight-normal)',
  large: 'var(--font-weight-semibold)',
  label: 'var(--font-weight-medium)',
  code: 'var(--font-weight-normal)',
  supporting: 'var(--font-weight-normal)',
};

/**
 * Line-height target ratios. Headings are tighter, body text is more generous.
 */
const HEADING_LH_RATIO = 1.3;
const TEXT_LH_RATIOS: Record<string, number> = {
  body: 1.5,
  large: 1.45,
  label: 1.4,
  code: 1.5,
  supporting: 1.5,
};

// =============================================================================
// Computation
// =============================================================================

/**
 * Compute a font size from the geometric progression and round to nearest integer.
 */
function computeSize(base: number, ratio: number, step: number): number {
  return Math.round(base * Math.pow(ratio, step));
}

/**
 * Snap a line height to a 4px grid.
 * Ensures minimum of fontSize + 4px for readability.
 */
function snapLineHeight(fontSize: number, lhRatio: number): number {
  const raw = fontSize * lhRatio;
  const snapped = Math.ceil(raw / 4) * 4;
  return Math.max(snapped, fontSize + 4);
}

/**
 * Expand a type scale configuration into typography token overrides.
 *
 * Generates 33 tokens: 6 heading levels × 3 properties + 5 text types × 3 properties.
 *
 * @example
 * ```
 * const tokens = expandTypeScale({ base: 14, ratio: 1.2 });
 * // tokens['--heading-1-size'] === '24px'
 * // tokens['--heading-4-size'] === '14px'  (anchor)
 * // tokens['--text-body-size'] === '14px'
 * ```
 */
export function expandTypeScale(config: XDSTypeScaleConfig): TypeScaleTokens {
  const {base, ratio} = config;
  const tokens: TypeScaleTokens = {};

  // Heading tokens
  for (const [levelStr, step] of Object.entries(HEADING_STEPS)) {
    const level = Number(levelStr);
    const size = computeSize(base, ratio, step);
    const lh = snapLineHeight(size, HEADING_LH_RATIO);

    tokens[`--heading-${level}-size`] = `${size}px`;
    tokens[`--heading-${level}-weight`] = HEADING_WEIGHTS[level];
    tokens[`--heading-${level}-leading`] = `${lh}px`;
  }

  // Text tokens
  for (const [type, step] of Object.entries(TEXT_STEPS)) {
    const size = computeSize(base, ratio, step);
    const lhRatio = TEXT_LH_RATIOS[type];
    const lh = snapLineHeight(size, lhRatio);

    tokens[`--text-${type}-size`] = `${size}px`;
    tokens[`--text-${type}-weight`] = TEXT_WEIGHTS[type];
    tokens[`--text-${type}-leading`] = `${lh}px`;
  }

  return tokens;
}
