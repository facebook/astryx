/**
 * @file expandTypeScale.ts
 * @input Type scale configuration { base, ratio, weights? }
 * @output Token overrides for raw size tokens and semantic typography tokens
 * @position Theme utility; consumed by defineTheme.ts
 *
 * Computes a complete typography token set from a base size and scaling ratio
 * using a geometric progression: size = base × ratio^step.
 *
 * Two-layer architecture:
 *   Layer 1: Raw size tokens (--font-size-4xs … --font-size-4xl)
 *            Geometric progression in rem.
 *   Layer 2: Semantic tokens (--heading-*, --text-*-size/leading/weight)
 *            Sizes are var() references to Layer 1.
 *            Line heights are hardcoded computed values (4px grid snapped).
 *            Weights are var() references to font-weight tokens.
 *
 * The named leading tokens (--leading-tight … --leading-relaxed) are NOT
 * modified by the type scale — they remain as intent-based ratios for
 * component use.
 *
 * Step mapping:
 *   step -5 → --font-size-4xs   (sub-scale)
 *   step -4 → --font-size-3xs   (sub-scale)
 *   step -3 → --font-size-2xs   (sub-scale)
 *   step -2 → --font-size-xs   (h6)
 *   step -1 → --font-size-sm    (h5, supporting)
 *   step  0 → --font-size-base  (h4, body, label, code)
 *   step +1 → --font-size-lg    (h3, large)
 *   step +2 → --font-size-xl    (h2)
 *   step +3 → --font-size-2xl   (h1)
 *   step +4 → --font-size-3xl
 *   step +5 → --font-size-4xl
 *
 * Line heights use a tiered target ratio based on font size:
 *   < 20px  → 1.5   (body text, small UI)
 *   20–31px → 1.4   (medium headings)
 *   ≥ 32px  → 1.25  (large display headings)
 *
 * Then 4px-grid-snapped with Math.round and a minimum of fontSize + 4.
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
 * Keys are built-in text type names, values are CSS font-weight values.
 * Accepts additional string keys for custom theme-defined text types.
 */
export type TextWeightOverrides = Partial<
  Record<
    | 'body'
    | 'large'
    | 'label'
    | 'code'
    | 'supporting'
    | 'display-1'
    | 'display-2'
    | 'display-3'
    | (string & {}),
    FontWeightValue
  >
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
 * Step → raw size token name.
 * These tokens form the geometric font size scale.
 *
 * The full scale spans steps -5 to +5:
 *   -5 → --font-size-4xs (sub-scale)
 *   -4 → --font-size-3xs (sub-scale)
 *   -3 → --font-size-2xs (sub-scale)
 *   -2 → --font-size-xs
 *   -1 → --font-size-sm
 *    0 → --font-size-base (anchor)
 *   +1 → --font-size-lg
 *   +2 → --font-size-xl
 *   +3 → --font-size-2xl
 *   +4 → --font-size-3xl
 *   +5 → --font-size-4xl
 */
const STEP_TO_SIZE_TOKEN: Record<number, string> = {
  [-5]: '--font-size-4xs',
  [-4]: '--font-size-3xs',
  [-3]: '--font-size-2xs',
  [-2]: '--font-size-xs',
  [-1]: '--font-size-sm',
  [0]: '--font-size-base',
  [1]: '--font-size-lg',
  [2]: '--font-size-xl',
  [3]: '--font-size-2xl',
  [4]: '--font-size-3xl',
  [5]: '--font-size-4xl',
  [6]: '--font-size-5xl',
};

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
  'display-1': 6, // largest — continues progression above h1
  'display-2': 5,
  'display-3': 4, // closest to h1
};

/**
 * Default font weights per heading level.
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
 */
const DEFAULT_TEXT_WEIGHTS: Record<string, string> = {
  body: 'var(--font-weight-normal)',
  large: 'var(--font-weight-semibold)',
  label: 'var(--font-weight-medium)',
  code: 'var(--font-weight-normal)',
  supporting: 'var(--font-weight-normal)',
  'display-1': 'var(--font-weight-normal)',
  'display-2': 'var(--font-weight-normal)',
  'display-3': 'var(--font-weight-normal)',
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
  'display-1': 1.2, // tighter — large text reads better tight
  'display-2': 1.2,
  'display-3': 1.2,
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

/** Convert px to rem based on the standard 16px root font size. */
function pxToRem(px: number): string {
  const rem = Math.round((px / 16) * 10000) / 10000;
  return `${rem}rem`;
}

/**
 * Tiered target line-height ratio based on font size.
 *
 *   < 20px  → 1.5   (body text, small UI elements)
 *   20–31px → 1.4   (medium headings, transitional)
 *   ≥ 32px  → 1.25  (large display headings)
 */
function targetLeadingRatio(fontSize: number): number {
  return fontSize < 20 ? 1.5 : fontSize < 32 ? 1.4 : 1.25;
}

/**
 * Compute a unitless line-height ratio, snapped so the computed px value
 * aligns to a 4px grid. Ensures a minimum gap of fontSize + 4px.
 *
 * Uses a tiered target ratio — see `targetLeadingRatio`.
 */
function computeLeading(fontSize: number): number {
  const target = targetLeadingRatio(fontSize);
  const rawLh = fontSize * target;
  const snappedLh = Math.max(
    Math.round(rawLh / 4) * 4,
    Math.ceil((fontSize + 4) / 4) * 4,
  );
  return Math.round((snappedLh / fontSize) * 10000) / 10000;
}

/**
 * Expand a type scale configuration into typography token overrides.
 *
 * Generates two layers of tokens:
 *   - Layer 1: 11 raw size tokens (--font-size-4xs … --font-size-4xl) in rem
 *   - Layer 2: semantic tokens using var() refs for sizes and
 *              hardcoded computed values for line heights
 *
 * Includes 6 heading levels × 3 + 8 text types × 3 (body, large, label, code, supporting, display-1/2/3).
 * Font sizes are emitted as rem values (e.g. '1.5rem') based on 16px root.
 * Line heights are emitted as unitless ratios (e.g. '1.3333').
 * Font weights are emitted as var() references (e.g. '''var(--font-weight-semibold)'''').
 *
 * @example
 * ```
 * const tokens = expandTypeScale({ base: 14, ratio: 1.2 });
 * // Layer 1 — raw sizes
 * // tokens['--font-size-base'] === '0.875rem'
 * // tokens['--font-size-2xl'] === '1.5rem'
 * //
 * // Layer 2 — semantic
 * // tokens['--text-heading-1-size'] === 'var(--font-size-2xl)'
 * // tokens['--text-heading-1-leading'] === '1.3333'
 * // tokens['--text-body-size'] === 'var(--font-size-base)'
 * // tokens['--text-body-leading'] === '1.4286'
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

  // ── Layer 1: Raw size tokens (rem) ────────────────────────────────────────
  for (let step = -5; step <= 6; step++) {
    const size = computeSize(base, ratio, step);
    tokens[STEP_TO_SIZE_TOKEN[step]] = pxToRem(size);
  }

  // ── Layer 2: Semantic tokens ──────────────────────────────────────────────
  // Sizes → var() refs to Layer 1
  // Line heights → hardcoded computed values (4px grid snapped)
  // Weights → var() refs (unchanged)

  // Heading tokens
  for (const [levelStr, step] of Object.entries(HEADING_STEPS)) {
    const level = Number(levelStr);
    const size = computeSize(base, ratio, step);
    const leading = computeLeading(size);

    tokens[`--text-heading-${level}-size`] = `var(${STEP_TO_SIZE_TOKEN[step]})`;
    tokens[`--text-heading-${level}-weight`] = headingWeights[level];
    tokens[`--text-heading-${level}-leading`] = `${leading}`;
  }

  // Text tokens
  for (const [type, step] of Object.entries(TEXT_STEPS)) {
    const size = computeSize(base, ratio, step);
    const leading = computeLeading(size);

    tokens[`--text-${type}-size`] = `var(${STEP_TO_SIZE_TOKEN[step]})`;
    tokens[`--text-${type}-weight`] = textWeights[type];
    tokens[`--text-${type}-leading`] = `${leading}`;
  }

  return tokens;
}

// =============================================================================
// Component override generation
// =============================================================================

const TEXT_FONT_FAMILIES: Record<string, string> = {
  body: 'var(--font-family-body)',
  large: 'var(--font-family-body)',
  label: 'var(--font-family-body)',
  code: 'var(--font-family-code)',
  supporting: 'var(--font-family-body)',
  'display-1': 'var(--font-family-heading)',
  'display-2': 'var(--font-family-heading)',
  'display-3': 'var(--font-family-heading)',
};

/**
 * Generate component style overrides for heading and text components.
 */
export function generateTypeScaleComponents(
  config: XDSTypeScaleConfig,
): Record<string, Record<string, Record<string, string>>> {
  const components: Record<string, Record<string, Record<string, string>>> = {};

  const headingRules: Record<string, Record<string, string>> = {};
  for (const level of [1, 2, 3, 4, 5, 6]) {
    headingRules[`level:${level}`] = {
      fontFamily: 'var(--font-family-heading)',
      fontSize: `var(--text-heading-${level}-size)`,
      fontWeight: `var(--text-heading-${level}-weight)`,
      lineHeight: `var(--text-heading-${level}-leading)`,
    };
  }
  components.heading = headingRules;

  const textRules: Record<string, Record<string, string>> = {};
  for (const type of [
    'body',
    'large',
    'label',
    'code',
    'supporting',
    'display-1',
    'display-2',
    'display-3',
  ]) {
    textRules[`type:${type}`] = {
      fontFamily: TEXT_FONT_FAMILIES[type],
      fontSize: `var(--text-${type}-size)`,
      lineHeight: `var(--text-${type}-leading)`,
    };
  }
  components.text = textRules;

  return components;
}
