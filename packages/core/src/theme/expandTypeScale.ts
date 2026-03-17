/**
 * @file expandTypeScale.ts
 * @input Type scale configuration { base, ratio, weights? }
 * @output Token overrides for heading and text typography
 * @position Theme utility; consumed by defineTheme.ts
 *
 * Computes font sizes, weights, and line heights from a base size and
 * scaling ratio using a geometric progression: size = base × ratio^step.
 *
 * The heading scale is anchored at h4 = base. Headings h1–h3 scale up,
 * h5–h6 scale down. Text types are mapped to fixed steps relative to base.
 *
 * Line heights are unitless ratios, snapped so the computed px value
 * aligns to a 4px grid for visual rhythm.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/expandTypeScale.test.ts
 * - /packages/core/src/theme/defineTheme.ts
 */

// =============================================================================
// Types
// =============================================================================

/** Font weight value — either a CSS string or a var() reference. */
export type FontWeightValue = string;

/**
 * Weight overrides for heading levels.
 * Keys are heading levels 1–6, values are CSS font-weight values
 * (e.g. '600', 'var(--font-weight-bold)').
 */
export type HeadingWeightOverrides = Partial<
  Record<1 | 2 | 3 | 4 | 5 | 6, FontWeightValue>
>;

/**
 * Weight overrides for text types.
 * Keys are text type names, values are CSS font-weight values.
 */
export type TextWeightOverrides = Partial<
  Record<'body' | 'large' | 'label' | 'code' | 'supporting', FontWeightValue>
>;

/**
 * Type scale configuration.
 *
 * @example
 * ```
 * // Default XDS type scale
 * { base: 14, ratio: 1.2 }
 *
 * // With custom weights
 * {
 *   base: 14,
 *   ratio: 1.2,
 *   weights: {
 *     heading: { 1: 'var(--font-weight-bold)', 3: 'var(--font-weight-bold)' },
 *     text: { large: 'var(--font-weight-normal)' },
 *   },
 * }
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
  /** Optional weight overrides for headings and text types. */
  weights?: {
    /** Per-level heading weight overrides. Unset levels use the defaults. */
    heading?: HeadingWeightOverrides;
    /** Per-type text weight overrides. Unset types use the defaults. */
    text?: TextWeightOverrides;
  };
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
 * Themes can override individual levels via weights.heading in the config.
 */
const DEFAULT_HEADING_WEIGHTS: Record<number, string> = {
  1: 'var(--font-weight-semibold)',
  2: 'var(--font-weight-semibold)',
  3: 'var(--font-weight-semibold)',
  4: 'var(--font-weight-semibold)',
  5: 'var(--font-weight-semibold)',
  6: 'var(--font-weight-semibold)',
};

/**
 * Default font weights per text type.
 * Themes can override individual types via weights.text in the config.
 */
const DEFAULT_TEXT_WEIGHTS: Record<string, string> = {
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
 * Compute a unitless line-height ratio, snapped so the computed px value
 * aligns to a 4px grid. Ensures a minimum of fontSize + 4px for readability.
 *
 * Returns a unitless number (e.g. 1.3333) — not a px value — so line-height
 * scales proportionally when StyleX converts font sizes to relative units.
 */
function computeLeading(fontSize: number, targetRatio: number): number {
  const rawLh = fontSize * targetRatio;
  const snappedLh = Math.max(Math.ceil(rawLh / 4) * 4, fontSize + 4);
  // Round to 4 decimal places for clean CSS output
  return Math.round((snappedLh / fontSize) * 10000) / 10000;
}

/**
 * Expand a type scale configuration into typography token overrides.
 *
 * Generates 33 tokens: 6 heading levels × 3 properties + 5 text types × 3 properties.
 *
 * Font sizes are emitted as px values (e.g. '24px').
 * Line heights are emitted as unitless ratios (e.g. '1.3333').
 * Font weights are emitted as var() references (e.g. 'var(--font-weight-semibold)').
 *
 * @example
 * ```
 * const tokens = expandTypeScale({ base: 14, ratio: 1.2 });
 * // tokens['--heading-1-size'] === '24px'
 * // tokens['--heading-1-leading'] === '1.3333'
 * // tokens['--heading-4-size'] === '14px'  (anchor)
 * // tokens['--text-body-size'] === '14px'
 * ```
 */
export function expandTypeScale(config: XDSTypeScaleConfig): TypeScaleTokens {
  const {base, ratio, weights} = config;
  const tokens: TypeScaleTokens = {};

  // Merge weight overrides with defaults
  const headingWeights = {
    ...DEFAULT_HEADING_WEIGHTS,
    ...(weights?.heading as Record<number, string> | undefined),
  };
  const textWeights = {
    ...DEFAULT_TEXT_WEIGHTS,
    ...(weights?.text as Record<string, string> | undefined),
  };

  // Heading tokens
  for (const [levelStr, step] of Object.entries(HEADING_STEPS)) {
    const level = Number(levelStr);
    const size = computeSize(base, ratio, step);
    const leading = computeLeading(size, HEADING_LH_RATIO);

    tokens[`--heading-${level}-size`] = `${size}px`;
    tokens[`--heading-${level}-weight`] = headingWeights[level];
    tokens[`--heading-${level}-leading`] = `${leading}`;
  }

  // Text tokens
  for (const [type, step] of Object.entries(TEXT_STEPS)) {
    const size = computeSize(base, ratio, step);
    const leading = computeLeading(size, TEXT_LH_RATIOS[type]);

    tokens[`--text-${type}-size`] = `${size}px`;
    tokens[`--text-${type}-weight`] = textWeights[type];
    tokens[`--text-${type}-leading`] = `${leading}`;
  }

  return tokens;
}
