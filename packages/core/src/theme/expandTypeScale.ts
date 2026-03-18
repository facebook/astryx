/**
 * @file expandTypeScale.ts
 * @input Type scale configuration { base, ratio, weights? }
 * @output Token overrides for raw size, leading, and semantic typography tokens
 * @position Theme utility; consumed by defineTheme.ts
 *
 * Computes a complete typography token set from a base size and scaling ratio
 * using a geometric progression: size = base × ratio^step.
 *
 * Three-layer architecture:
 *   Layer 1:  Raw size tokens (--text-xsm … --text-4xl)
 *   Layer 1b: Leading tokens (--leading-tight … --leading-4xl)
 *   Layer 2:  Semantic tokens (--heading-*, --text-*-size/leading/weight)
 *             All size/leading values are var() references to Layer 1/1b.
 *
 * Step mapping:
 *   step -2 → --text-xsm  / --leading-tight    (h6)
 *   step -1 → --text-sm   / --leading-snug     (h5, supporting)
 *   step  0 → --text-base / --leading-base     (h4, body, label, code)
 *   step +1 → --text-lg   / --leading-normal   (h3, large)
 *   step +2 → --text-xl   / --leading-relaxed  (h2)
 *   step +3 → --text-2xl  / --leading-2xl      (h1)
 *   step +4 → --text-3xl  / --leading-3xl
 *   step +5 → --text-4xl  / --leading-4xl
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
 * Step → raw size token name.
 * These tokens form the geometric font size scale.
 */
const STEP_TO_SIZE_TOKEN: Record<number, string> = {
  [-2]: '--text-xsm',
  [-1]: '--text-sm',
  [0]: '--text-base',
  [1]: '--text-lg',
  [2]: '--text-xl',
  [3]: '--text-2xl',
  [4]: '--text-3xl',
  [5]: '--text-4xl',
};

/**
 * Step → leading token name.
 * Steps -2 through +2 reuse the existing named tokens.
 * Steps +3 through +5 extend the scale with size-based names.
 */
const STEP_TO_LEADING_TOKEN: Record<number, string> = {
  [-2]: '--leading-tight',
  [-1]: '--leading-snug',
  [0]: '--leading-base',
  [1]: '--leading-normal',
  [2]: '--leading-relaxed',
  [3]: '--leading-2xl',
  [4]: '--leading-3xl',
  [5]: '--leading-4xl',
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
 * Tiered target line-height ratio based on font size.
 *
 * Smaller text gets more generous leading for readability.
 * Larger display text gets tighter leading for visual density.
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
 * aligns to a 4px grid. Ensures a minimum gap of fontSize + 4px for readability.
 *
 * Uses a tiered target ratio — see `targetLeadingRatio`.
 *
 * Returns a unitless number (e.g. 1.4286) — not a px value — so line-height
 * scales proportionally when StyleX converts font sizes to relative units.
 */
function computeLeading(fontSize: number): number {
  const targetRatio = targetLeadingRatio(fontSize);
  const rawLh = fontSize * targetRatio;
  const snappedLh = Math.max(
    Math.round(rawLh / 4) * 4,
    Math.ceil((fontSize + 4) / 4) * 4,
  );
  // Round to 4 decimal places for clean CSS output
  return Math.round((snappedLh / fontSize) * 10000) / 10000;
}

/**
 * Expand a type scale configuration into typography token overrides.
 *
 * Generates three layers of tokens:
 *   - Layer 1:  8 raw size tokens (--text-xsm … --text-4xl)
 *   - Layer 1b: 8 leading tokens (--leading-tight … --leading-4xl)
 *   - Layer 2:  33 semantic tokens (headings + text types) using var() refs
 *
 * @example
 * ```
 * const tokens = expandTypeScale({ base: 14, ratio: 1.2 });
 * // Layer 1 — raw sizes
 * // tokens['--text-base'] === '14px'
 * // tokens['--text-2xl'] === '24px'
 * //
 * // Layer 1b — leading
 * // tokens['--leading-base'] === '1.4286'
 * //
 * // Layer 2 — semantic (var refs)
 * // tokens['--heading-1-size'] === 'var(--text-2xl)'
 * // tokens['--heading-1-leading'] === 'var(--leading-2xl)'
 * // tokens['--text-body-size'] === 'var(--text-base)'
 * // tokens['--text-body-leading'] === 'var(--leading-base)'
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

  // ── Layer 1: Raw size tokens ──────────────────────────────────────────────
  for (let step = -2; step <= 5; step++) {
    const size = computeSize(base, ratio, step);
    tokens[STEP_TO_SIZE_TOKEN[step]] = `${size}px`;
  }

  // ── Layer 1b: Leading tokens ──────────────────────────────────────────────
  for (let step = -2; step <= 5; step++) {
    const size = computeSize(base, ratio, step);
    const leading = computeLeading(size);
    tokens[STEP_TO_LEADING_TOKEN[step]] = `${leading}`;
  }

  // ── Layer 2: Semantic tokens (all var() references) ───────────────────────

  // Heading tokens
  for (const [levelStr, step] of Object.entries(HEADING_STEPS)) {
    const level = Number(levelStr);
    tokens[`--heading-${level}-size`] = `var(${STEP_TO_SIZE_TOKEN[step]})`;
    tokens[`--heading-${level}-weight`] = headingWeights[level];
    tokens[`--heading-${level}-leading`] =
      `var(${STEP_TO_LEADING_TOKEN[step]})`;
  }

  // Text tokens
  for (const [type, step] of Object.entries(TEXT_STEPS)) {
    tokens[`--text-${type}-size`] = `var(${STEP_TO_SIZE_TOKEN[step]})`;
    tokens[`--text-${type}-weight`] = textWeights[type];
    tokens[`--text-${type}-leading`] = `var(${STEP_TO_LEADING_TOKEN[step]})`;
  }

  return tokens;
}

// =============================================================================
// Component override generation
// =============================================================================

/**
 * Font family mapping for auto-generated component overrides.
 * Code text uses the code font; everything else uses the heading/body font.
 */
const TEXT_FONT_FAMILIES: Record<string, string> = {
  body: 'var(--font-body)',
  large: 'var(--font-body)',
  label: 'var(--font-body)',
  code: 'var(--font-code)',
  supporting: 'var(--font-body)',
};

/**
 * Generate component style overrides for heading and text components
 * from a type scale configuration.
 *
 * Produces rules like:
 *   heading: { 'level:1': { fontFamily, fontSize, fontWeight, lineHeight } }
 *   text:    { 'type:body': { fontFamily, fontSize, fontWeight, lineHeight } }
 *
 * Color is intentionally excluded — it's handled by component internals
 * (XDSHeading defaults to primary, XDSText has per-type defaults).
 * Including color here would duplicate component logic and risk specificity
 * conflicts with the color prop.
 *
 * @example
 * ```
 * const components = generateTypeScaleComponents({ base: 14, ratio: 1.2 });
 * // components.heading['level:1'].fontSize === 'var(--heading-1-size)'
 * ```
 */
export function generateTypeScaleComponents(
  config: XDSTypeScaleConfig,
): Record<string, Record<string, Record<string, string>>> {
  const components: Record<string, Record<string, Record<string, string>>> = {};

  // Heading overrides
  const headingRules: Record<string, Record<string, string>> = {};
  for (const level of [1, 2, 3, 4, 5, 6]) {
    headingRules[`level:${level}`] = {
      fontFamily: 'var(--font-heading)',
      fontSize: `var(--heading-${level}-size)`,
      fontWeight: `var(--heading-${level}-weight)`,
      lineHeight: `var(--heading-${level}-leading)`,
    };
  }
  components.heading = headingRules;

  // Text overrides
  const textRules: Record<string, Record<string, string>> = {};
  for (const type of ['body', 'large', 'label', 'code', 'supporting']) {
    textRules[`type:${type}`] = {
      fontFamily: TEXT_FONT_FAMILIES[type],
      fontSize: `var(--text-${type}-size)`,
      fontWeight: `var(--text-${type}-weight)`,
      lineHeight: `var(--text-${type}-leading)`,
    };
  }
  components.text = textRules;

  return components;
}
