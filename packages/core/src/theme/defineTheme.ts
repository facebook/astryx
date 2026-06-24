// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * defineTheme — Create an Astryx theme from a flat token map.
 *
 * Two distribution modes:
 * - Unbuilt: Theme generates CSS and injects a <style> tag at runtime
 * - Built: `npx astryx theme build` pre-compiles to a CSS file; Theme just
 *   sets the data-astryx-theme attribute
 *
 * Token values can be:
 * - A string: used as-is for both light and dark modes
 * - A [light, dark] tuple: converted to light-dark(light, dark)
 *
 * @example
 * ```tsx
 * const oceanTheme = defineTheme({
 *   name: 'ocean',
 *   tokens: {
 *     '--color-accent': ['#0077B6', '#48CAE4'],    // [light, dark]
 *     '--color-background-surface': ['#F0F8FF', '#0A1628'],
 *     '--radius-container': '16px',                     // same in both modes
 *   },
 *   icons: oceanIcons,
 * });
 *
 * <Theme theme={oceanTheme}>
 *   <App />
 * </Theme>
 * ```
 */

import type {IconRegistry} from '../Icon/globalIconRegistry';
import type {TypographyConfig, FontWeight} from './types';
import {
  resolveOnMedia,
  type OnMediaOverrides,
  type ResolvedOnMedia,
} from './onMediaTokens';
import {
  colorDefaults,
  spacingDefaults,
  sizeDefaults,
  radiusDefaults,
  shadowDefaults,
  durationDefaults,
  easeDefaults,
  transitionDefaults,
  typographyDefaults,
  textSizeDefaults,
  fontWeightDefaults,
  typeScaleDefaults,
} from './tokens.stylex';
import {
  expandTypeScale,
  generateTypeScaleComponents,
  type TypeScaleConfig,
} from './expandTypeScale';
import {
  expandMotionScale,
  type MotionScaleConfig,
} from './expandMotionScale';
import {
  expandRadiusScale,
  type RadiusScaleConfig,
} from './expandRadiusScale';
import {expandColorScale, type ColorScaleConfig} from './expandColorScale';

import type {DomainTokenName} from './domainTokens';
import {domainTokenDefaults} from './domainTokens';
import type {SyntaxThemeDefinition} from './syntax';

// =============================================================================
// Types
// =============================================================================

/** All valid Astryx core token names */
export type CoreTokenName =
  | keyof typeof colorDefaults
  | keyof typeof spacingDefaults
  | keyof typeof sizeDefaults
  | keyof typeof radiusDefaults
  | keyof typeof shadowDefaults
  | keyof typeof durationDefaults
  | keyof typeof easeDefaults
  | keyof typeof transitionDefaults
  | keyof typeof typographyDefaults
  | keyof typeof textSizeDefaults
  | keyof typeof fontWeightDefaults
  | keyof typeof typeScaleDefaults;

/** All valid Astryx token names — core + domain tokens */
export type TokenName = CoreTokenName | DomainTokenName;

/**
 * Token value — either a single string or a [light, dark] tuple.
 * Tuples are converted to CSS light-dark() at theme creation time.
 */
export type TokenValue = string | [light: string, dark: string];

/**
 * CSS property values for a style rule.
 *
 * Keys are camelCase CSS properties with string values, OR pseudo-class
 * selectors (starting with `:`) mapping to nested property objects.
 *
 * Pseudo-class keys generate separate CSS rules with the pseudo appended
 * to the component selector. Supported pseudo-classes include `:hover`,
 * `:focus-visible`, `:active`, `:checked`, `:disabled`, etc.
 *
 * @example
 * ```ts
 * {
 *   borderColor: '#8F9296',
 *   ':hover': { borderColor: 'color-mix(in srgb, #8F9296, black 20%)' },
 *   ':focus-visible': { outline: '2px solid var(--color-accent)' },
 * }
 * ```
 */
export type StyleOverrides = Record<string, string | Record<string, string>>;

/**
 * Component style overrides.
 *
 * Each top-level key is a component name (lowercase). Values are objects
 * mapping style keys to CSS property overrides:
 * - `base` — styles applied to all instances of the component
 * - `prop:value` — styles when a visual prop matches (e.g. `variant:secondary`)
 * - `prop:value+prop:value` — intersection of multiple props
 *
 * The `base` key is optional — omit it to only override specific variants.
 *
 * Style values can include pseudo-class keys (`:hover`, `:focus-visible`, etc.)
 * to override interaction states without CSS custom property escape hatches.
 *
 * @example
 * ```tsx
 * components: {
 *   button: {
 *     base: { fontWeight: '600' },
 *     'variant:secondary': { backgroundColor: 'rgba(0,0,0,0.06)' },
 *     'variant:destructive+size:sm': { padding: '2px 6px' },
 *   },
 *   badge: {
 *     'variant:ghost': { border: '1px solid var(--color-border)' },
 *   },
 *   radio: {
 *     base: {
 *       borderColor: '#8F9296',
 *       ':hover': { borderColor: 'color-mix(in srgb, #8F9296, black 20%)' },
 *     },
 *   },
 * }
 * ```
 */
export type ComponentStyleMap = Record<
  string,
  Record<string, StyleOverrides>
>;

/** Input to defineTheme */
export interface DefineThemeInput {
  /** Theme name — used for data-astryx-theme attribute and identification */
  name: string;

  /**
   * Base theme to extend. When provided, the new theme starts with the
   * base theme's tokens, components, and fonts, then applies overrides
   * from this input on top. The base theme's values have lowest precedence.
   *
   * Use this to create variant themes that customize only a few aspects
   * (e.g. icons, accent color) without re-specifying the full theme.
   *
   * @example
   * ```tsx
   * import {defaultTheme} from '@astryxdesign/theme-default';
   *
   * const myTheme = defineTheme({
   *   name: 'my-brand',
   *   extends: defaultTheme,
   *   icons: myIcons,
   *   tokens: { '--color-accent': '#FF0000' },
   * });
   * ```
   */
  extends?: DefinedTheme;
  /**
   * Unified typography configuration — fonts, scale, and weights.
   *
   * Scale controls sizing; roles (body, heading, code) declare
   * fonts, fallbacks, and weights. Heading inherits from body if omitted.
   *
   * Font loading is the consumer's responsibility — add a <link> or
   * @import for your fonts before rendering the theme.
   *
   * @example
   * ```tsx
   * typography: {
   *   scale: { base: 14, ratio: 1.2 },
   *   body: { family: 'Geist', fallbacks: '-apple-system, sans-serif' },
   *   heading: { weight: 'semibold', weights: { 3: 'bold', 4: 'bold' } },
   *   code: { family: 'Geist Mono', fallbacks: '"SF Mono", monospace' },
   * }
   * ```
   */
  typography?: TypographyConfig;
  /**
   * Motion configuration. Computes duration min/max variants from
   * base values and a scaling ratio: min = base × ratio, max = base / ratio.
   *
   * Explicit `tokens` overrides take precedence over motion-generated values.
   *
   * @example
   * ```
   * motion: { fast: 175, medium: 410, slow: 975, ratio: 0.75 }
   *
   * // Suggested starting points:
   * //   Snappy:    { fast: 100, medium: 250, ratio: 0.75 }
   * //   Default:   { fast: 175, medium: 410, slow: 975, ratio: 0.75 }
   * //   Cinematic: { fast: 200, medium: 500, slow: 1200, ratio: 0.7 }
   * ```
   */
  motion?: MotionScaleConfig;
  /**
   * Radius configuration. Generates radius token overrides
   * from a base unit and multiplier.
   *
   * --radius-none and --radius-full are always fixed (never affected by multiplier).
   * --radius-inner through --radius-page = base * step * multiplier.
   *
   * When omitted, themes use the hardcoded defaults (base=4, multiplier=1).
   * Explicit `tokens` overrides take precedence over radius-generated values.
   *
   * @example
   * ```tsx
   * radius: { base: 4, multiplier: 1 }
   *
   * // Sharp/brutalist — all radii become 0
   * radius: { base: 4, multiplier: 0 }
   * ```
   */
  radius?: RadiusScaleConfig;
  /**
   * Color scale configuration. Generates color token overrides from a
   * single accent color using the HCT perceptual color model.
   *
   * Only generates tokens derivable from the accent — status colors,
   * categorical hues, and fixed tokens (on-dark/on-light) use defaults.
   * Explicit `tokens` entries always take precedence.
   *
   * @example
   * ```tsx
   * color: { accent: '#0064E0', neutralStyle: 'cool', contrast: 'standard' }
   * ```
   */
  color?: ColorScaleConfig;
  /** Token overrides — flat map of CSS custom property names to values.
   *  Values can be a string or [light, dark] tuple.
   *  Only include tokens you want to override; defaults fill the rest. */
  tokens?: Partial<Record<TokenName, TokenValue>>;
  /**
   * Component style overrides — keyed by component name (lowercase).
   * Each entry maps style keys to CSS property overrides, scoped under
   * the theme's data-astryx-theme attribute via @scope.
   *
   * Use `prop:value` keys to target specific visual props. New values
   * not in the base type are automatically detected by `astryx theme build`
   * and generate TypeScript module augmentations for type-safe extensibility.
   *
   * @example
   * ```tsx
   * components: {
   *   button: {
   *     base: { fontWeight: '600' },
   *     'variant:secondary': { backgroundColor: '...' },
   *     'variant:primary-muted': { backgroundColor: '#ECF5FF' }, // new — generates augmentation
   *   },
   *   banner: {
   *     'status:neutral': { backgroundColor: 'var(--color-background-muted)' }, // new status
   *   },
   * }
   * ```
   */
  components?: ComponentStyleMap;
  /** Icon registry — maps semantic icon names to React nodes */
  icons?: Partial<IconRegistry>;
  /**
   * Default syntax highlighting theme for code components.
   * Sets --color-syntax-* tokens at the theme root. Can be overridden
   * per-region via SyntaxTheme or per-instance via syntaxTheme prop.
   *
   * @example
   * ```tsx
   * import {dracula} from '@astryxdesign/core/theme/syntax';
   * defineTheme({ name: 'my-theme', syntax: dracula, ... })
   * ```
   */
  syntax?: SyntaxThemeDefinition;
  /**
   * Overrides for content on a dark surface (e.g. inverted toast,
   * dark tooltip). Accepts token and component overrides — same shape
   * as the main theme. Token defaults are generated if omitted.
   *
   * Used by `<MediaTheme surface="dark">` to set semantic tokens
   * and component styles so children render correctly against a dark
   * background.
   *
   * @example
   * ```tsx
   * onDark: {
   *   tokens: { '--color-accent': '#90CAF9' },
   *   components: {
   *     button: { 'variant:ghost': { borderWidth: '1px' } },
   *   },
   * }
   * ```
   */
  onDark?: OnMediaOverrides;
  /**
   * Overrides for content on a light surface. Same shape as `onDark`
   * but for the inverse case (e.g. dark-mode page with a light popover).
   */
  onLight?: OnMediaOverrides;
}

/** A defined theme — ready to pass to <Theme> */
export interface DefinedTheme {
  /** Theme name */
  name: string;
  /** Token overrides — only the tokens the consumer specified */
  tokens: Record<string, string>;
  /** Component style overrides */
  components?: ComponentStyleMap;
  /** Icon registry */
  icons?: Partial<IconRegistry>;
  /** Whether this theme has been pre-compiled by theme build CLI */
  __built?: true;
  /**
   * Raw input tokens preserved from defineTheme() input.
   * Keeps [light, dark] tuples intact for programmatic access
   * (e.g. data viz, canvas rendering) without parsing light-dark() strings.
   * @internal
   */
  __inputTokens?: Partial<Record<string, TokenValue>>;
  /**
   * Resolved on-media token overrides for dark surfaces.
   * Generated by defineTheme from defaults + user onDark overrides.
   * Used by MediaTheme and generateThemeRules.
   * @internal
   */
  __onDark?: ResolvedOnMedia;
  /**
   * Resolved on-media overrides for light surfaces.
   * @internal
   */
  __onLight?: ResolvedOnMedia;
}

// =============================================================================
// All defaults merged into a single flat map
// =============================================================================

/** All Astryx token defaults as a flat map. Useful for resolving full token sets. */
export const xdsTokenDefaults: Record<string, string> = {
  ...colorDefaults,
  ...spacingDefaults,
  ...sizeDefaults,
  ...radiusDefaults,
  ...shadowDefaults,
  ...durationDefaults,
  ...easeDefaults,
  ...transitionDefaults,
  ...typographyDefaults,
  ...textSizeDefaults,
  ...fontWeightDefaults,
  ...typeScaleDefaults,
  ...domainTokenDefaults,
};

// =============================================================================
// defineTheme
// =============================================================================

/**
 * Resolve a token value to a CSS string.
 * - String values pass through as-is
 * - [light, dark] tuples become light-dark(light, dark)
 */
function resolveTokenValue(value: TokenValue): string {
  if (Array.isArray(value)) {
    return `light-dark(${value[0]}, ${value[1]})`;
  }
  return value;
}

/**
 * Deep-merge two component style maps.
 * Properties in `overrides` take precedence over `base`.
 * This allows typeScale-generated rules to be overridden by explicit components.
 */
function deepMergeComponents(
  base?: ComponentStyleMap,
  overrides?: ComponentStyleMap,
): ComponentStyleMap | undefined {
  if (!base && !overrides) {
    return undefined;
  }
  if (!base) {
    return overrides;
  }
  if (!overrides) {
    return base;
  }

  const result: ComponentStyleMap = {};

  // Start with all base entries
  for (const [component, rules] of Object.entries(base)) {
    result[component] = {...rules};
  }

  // Merge overrides on top
  for (const [component, rules] of Object.entries(overrides)) {
    if (!result[component]) {
      result[component] = {...rules};
    } else {
      for (const [key, styles] of Object.entries(rules)) {
        result[component][key] = {
          ...result[component][key],
          ...styles,
        };
      }
    }
  }

  return result;
}

/**
 * Resolve a FontWeight name to a var() reference.
 * Named weights map to var(--font-weight-*); raw values pass through.
 */
function resolveFontWeight(weight: FontWeight): string {
  const named: Record<string, string> = {
    normal: 'var(--font-weight-normal)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
  };
  return named[weight] ?? weight;
}

/**
 * Build the full CSS font-family value from family + fallbacks.
 * Quotes the family name if it contains spaces.
 */
function buildFontFamily(
  family?: string,
  fallbacks?: string,
): string | undefined {
  if (!family) {
    return undefined;
  }
  const quoted = family.includes(' ') ? `"${family}"` : family;
  if (fallbacks) {
    return `${quoted}, ${fallbacks}`;
  }
  return quoted;
}

/**
 * Create an Astryx theme.
 *
 * Pass only the tokens you want to override — everything else
 * inherits from the Astryx defaults.
 *
 * When `typography.scale` is provided, it generates typography token overrides
 * that are merged into the token map. Explicit `tokens` entries take
 * precedence over generated values.
 */
export function defineTheme(input: DefineThemeInput): DefinedTheme {
  const tokens: Record<string, string> = {};

  // 0. Pre-seed from base theme when `extends` is provided (lowest precedence)
  const base = input.extends;
  if (base) {
    for (const [key, value] of Object.entries(base.tokens)) {
      tokens[key] = value;
    }
  }

  // Build typeScale config from typography if present
  const typo = input.typography;
  let typeScaleConfig: TypeScaleConfig | undefined;
  if (typo?.scale) {
    // Collect weight overrides from typography roles
    const headingWeights: Partial<Record<1 | 2 | 3 | 4 | 5 | 6, string>> = {};
    const headingRole = typo.heading;
    if (headingRole?.weights) {
      for (const [level, w] of Object.entries(headingRole.weights)) {
        if (w) {
          headingWeights[Number(level) as 1 | 2 | 3 | 4 | 5 | 6] =
            resolveFontWeight(w);
        }
      }
    }
    // Default heading weight from role
    const defaultHeadingWeight = headingRole?.weight
      ? resolveFontWeight(headingRole.weight)
      : undefined;
    if (defaultHeadingWeight) {
      for (let i = 1; i <= 6; i++) {
        if (!(i in headingWeights)) {
          headingWeights[i as 1 | 2 | 3 | 4 | 5 | 6] = defaultHeadingWeight;
        }
      }
    }

    // Text weight overrides from roles
    const textWeights: Partial<Record<string, string>> = {};
    if (typo.body?.weight) {
      textWeights.body = resolveFontWeight(typo.body.weight);
    }
    if (typo.code?.weight) {
      textWeights.code = resolveFontWeight(typo.code.weight);
    }

    typeScaleConfig = {
      base: typo.scale.base,
      ratio: typo.scale.ratio,
      weights: {
        ...(Object.keys(headingWeights).length > 0
          ? {heading: headingWeights}
          : {}),
        ...(Object.keys(textWeights).length > 0 ? {text: textWeights} : {}),
      },
    };
  }

  // 1. Apply color-generated tokens (lowest precedence for colors)
  if (input.color) {
    const colorTokens = expandColorScale(input.color);
    for (const [key, value] of Object.entries(colorTokens)) {
      tokens[key] = value;
    }
  }

  // 1a. Apply typeScale-generated tokens (lowest precedence for type)
  if (typeScaleConfig) {
    const typeScaleTokens = expandTypeScale(typeScaleConfig);
    for (const [key, value] of Object.entries(typeScaleTokens)) {
      tokens[key] = value;
    }
  }

  // 1b. Apply radius-generated tokens (lowest precedence for radius)
  if (input.radius) {
    const radiusTokens = expandRadiusScale(input.radius);
    for (const [key, value] of Object.entries(radiusTokens)) {
      tokens[key] = value;
    }
  }

  // 1c. Apply motion-generated tokens (same precedence as typeScale)
  if (input.motion) {
    const motionTokens = expandMotionScale(input.motion);
    for (const [key, value] of Object.entries(motionTokens)) {
      tokens[key] = value;
    }
  }

  // 1d. Apply typography font family tokens
  if (typo) {
    // Heading inherits from body if not specified
    const bodyFamily = buildFontFamily(typo.body?.family, typo.body?.fallbacks);
    const headingFamily =
      buildFontFamily(typo.heading?.family, typo.heading?.fallbacks) ??
      bodyFamily;
    const codeFamily = buildFontFamily(typo.code?.family, typo.code?.fallbacks);

    if (bodyFamily) {
      tokens['--font-family-body'] = bodyFamily;
    }
    if (headingFamily) {
      tokens['--font-family-heading'] = headingFamily;
    }
    if (codeFamily) {
      tokens['--font-family-code'] = codeFamily;
    }
  }

  // 1e. Apply syntax theme tokens (before explicit overrides)
  if (input.syntax) {
    const syntaxMap = input.syntax.tokens;
    const prefix = '--color-syntax-';
    for (const [key, value] of Object.entries(syntaxMap)) {
      tokens[prefix + key] = value;
    }
  }

  // 2. Apply explicit token overrides (highest precedence — overwrites generated tokens)
  if (input.tokens) {
    for (const [key, value] of Object.entries(input.tokens)) {
      if (value !== undefined) {
        tokens[key] = resolveTokenValue(value);
      }
    }
  }

  // 3. Generate component overrides: base (lowest) → typeScale → explicit (highest)
  let components = input.components;
  if (typeScaleConfig) {
    const generated = generateTypeScaleComponents(typeScaleConfig);
    components = deepMergeComponents(generated, input.components);
  }
  if (base?.components) {
    components = deepMergeComponents(base.components, components);
  }

  // 4. Resolve on-media token overrides (defaults + user overrides)
  const __onDark = resolveOnMedia('dark', input.onDark);
  const __onLight = resolveOnMedia('light', input.onLight);

  // 5. Merge icons — input icons override base icons
  const icons =
    input.icons && base?.icons
      ? {...base.icons, ...input.icons}
      : (input.icons ?? base?.icons);

  return {
    name: input.name,
    tokens,
    components,
    icons,
    __inputTokens: input.tokens,
    __onDark,
    __onLight,
  };
}

// =============================================================================
// CSS generation — re-exported from ./generateThemeRules.ts
// =============================================================================

export {
  generateThemeRules,
  generateThemeRulesSplit,
  generateOnMediaCSS,
  generateThemeCSS,
  generateThemeCSSFlat,
  type ThemeRulesSplit,
  type ThemeCSSOutput,
} from './generateThemeRules';

// =============================================================================
// Type guard
// =============================================================================

/** Check if a theme object was created with defineTheme */
export function isDefinedTheme(theme: unknown): theme is DefinedTheme {
  return (
    typeof theme === 'object' &&
    theme !== null &&
    'name' in theme &&
    'tokens' in theme &&
    !('styles' in theme)
  );
}
