/**
 * defineTheme — Create an XDS theme from a flat token map.
 *
 * Two distribution modes:
 * - Unbuilt: XDSTheme generates CSS and injects a <style> tag at runtime
 * - Built: `npx xds theme build` pre-compiles to a CSS file; XDSTheme just
 *   sets the data-xds-theme attribute
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
 *     '--color-surface': ['#F0F8FF', '#0A1628'],
 *     '--radius-3': '16px',                     // same in both modes
 *   },
 *   icons: oceanIcons,
 * });
 *
 * <XDSTheme theme={oceanTheme}>
 *   <App />
 * </XDSTheme>
 * ```
 */

import type {XDSIconRegistry} from '../Icon/globalIconRegistry';
import type {ThemeFontSource, TypographyConfig, FontWeight} from './types';
import {parseStyleKey} from '../utils/parseStyleKey';
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
  lineHeightDefaults,
  fontWeightDefaults,
  typeScaleDefaults,
} from './tokens.stylex';
import {
  expandTypeScale,
  generateTypeScaleComponents,
  type XDSTypeScaleConfig,
} from './expandTypeScale';
import {
  expandMotionScale,
  type XDSMotionScaleConfig,
} from './expandMotionScale';
import {
  expandRadiusScale,
  type XDSRadiusScaleConfig,
} from './expandRadiusScale';

import type {DomainTokenName} from './domainTokens';
import {domainTokenDefaults} from './domainTokens';

// =============================================================================
// Types
// =============================================================================

/** All valid XDS core token names */
export type XDSCoreTokenName =
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
  | keyof typeof lineHeightDefaults
  | keyof typeof fontWeightDefaults
  | keyof typeof typeScaleDefaults;

/** All valid XDS token names — core + domain tokens */
export type XDSTokenName = XDSCoreTokenName | DomainTokenName;

/**
 * Token value — either a single string or a [light, dark] tuple.
 * Tuples are converted to CSS light-dark() at theme creation time.
 */
export type XDSTokenValue = string | [light: string, dark: string];

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
 *   ':focus-visible': { outline: '2px solid var(--color-ring-focus)' },
 * }
 * ```
 */
export type XDSStyleOverrides = Record<string, string | Record<string, string>>;

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
export type XDSComponentStyleMap = Record<
  string,
  Record<string, XDSStyleOverrides>
>;

/** Input to defineTheme */
export interface XDSDefineThemeInput {
  /** Theme name — used for data-xds-theme attribute and identification */
  name: string;
  /**
   * Unified typography configuration — fonts, scale, and weights.
   *
   * Replaces the separate `typeScale` and `fonts` fields with a single
   * config. Scale controls sizing; roles (body, heading, code) declare
   * fonts, fallbacks, and weights. Heading inherits from body if omitted.
   *
   * @example
   * ```tsx
   * typography: {
   *   scale: { base: 14, ratio: 1.2 },
   *   body: { family: 'Geist', fallbacks: '-apple-system, sans-serif', url: '...' },
   *   heading: { weight: 'semibold', weights: { 3: 'bold', 4: 'bold' } },
   *   code: { family: 'Geist Mono', fallbacks: '"SF Mono", monospace', url: '...' },
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
   * motion: { fast: 175, medium: 410, ratio: 0.75 }
   *
   * // Suggested starting points:
   * //   Snappy:    { fast: 100, medium: 250, ratio: 0.75 }
   * //   Default:   { fast: 175, medium: 410, ratio: 0.75 }
   * //   Cinematic: { fast: 200, medium: 500, ratio: 0.7 }
   * ```
   */
  motion?: XDSMotionScaleConfig;
  /**
   * Radius configuration. Generates radius token overrides
   * from a base unit and multiplier.
   *
   * radius-0 and radius-rounded are always fixed (never affected by multiplier).
   * radius-1 through radius-4 = base * step * multiplier.
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
  radius?: XDSRadiusScaleConfig;
  /** Token overrides — flat map of CSS custom property names to values.
   *  Values can be a string or [light, dark] tuple.
   *  Only include tokens you want to override; defaults fill the rest. */
  tokens?: Partial<Record<XDSTokenName, XDSTokenValue>>;
  /**
   * Component style overrides — keyed by component name (lowercase).
   * Each entry maps style keys to CSS property overrides, scoped under
   * the theme's data-xds-theme attribute via @scope.
   *
   * Use `prop:value` keys to target specific visual props. New values
   * not in the base type are automatically detected by `xds theme build`
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
   *     'status:neutral': { backgroundColor: 'var(--color-muted)' }, // new status
   *   },
   * }
   * ```
   */
  components?: XDSComponentStyleMap;
  /** Icon registry — maps semantic icon names to React nodes */
  icons?: Partial<XDSIconRegistry>;
}

/** A defined theme — ready to pass to <XDSTheme> */
export interface XDSDefinedTheme {
  /** Theme name */
  name: string;
  /** Token overrides — only the tokens the consumer specified */
  tokens: Record<string, string>;
  /** Component style overrides */
  components?: XDSComponentStyleMap;
  /** Icon registry */
  icons?: Partial<XDSIconRegistry>;
  /** Whether this theme has been pre-compiled by theme build CLI */
  __built?: true;
  /**
   * Font declarations — fonts this theme requires.
   * Passed through from defineTheme input unchanged.
   */
  fonts?: ThemeFontSource[];
}

// =============================================================================
// All defaults merged into a single flat map
// =============================================================================

/** All XDS token defaults as a flat map. Useful for resolving full token sets. */
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
  ...lineHeightDefaults,
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
function resolveTokenValue(value: XDSTokenValue): string {
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
  base?: XDSComponentStyleMap,
  overrides?: XDSComponentStyleMap,
): XDSComponentStyleMap | undefined {
  if (!base && !overrides) return undefined;
  if (!base) return overrides;
  if (!overrides) return base;

  const result: XDSComponentStyleMap = {};

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
  if (!family) return undefined;
  const quoted = family.includes(' ') ? `"${family}"` : family;
  if (fallbacks) return `${quoted}, ${fallbacks}`;
  return quoted;
}

/**
 * Create an XDS theme.
 *
 * Pass only the tokens you want to override — everything else
 * inherits from the XDS defaults.
 *
 * When `typography.scale` is provided, it generates typography token overrides
 * that are merged into the token map. Explicit `tokens` entries take
 * precedence over generated values.
 */
export function defineTheme(input: XDSDefineThemeInput): XDSDefinedTheme {
  const tokens: Record<string, string> = {};

  // Build typeScale config from typography if present
  const typo = input.typography;
  let typeScaleConfig: XDSTypeScaleConfig | undefined;
  if (typo?.scale) {
    // Collect weight overrides from typography roles
    const headingWeights: Partial<Record<1 | 2 | 3 | 4 | 5 | 6, string>> = {};
    const headingRole = typo.heading;
    if (headingRole?.weights) {
      for (const [level, w] of Object.entries(headingRole.weights)) {
        if (w)
          headingWeights[Number(level) as 1 | 2 | 3 | 4 | 5 | 6] =
            resolveFontWeight(w);
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
    if (typo.body?.weight)
      textWeights.body = resolveFontWeight(typo.body.weight);
    if (typo.code?.weight)
      textWeights.code = resolveFontWeight(typo.code.weight);

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

  // 1. Apply typeScale-generated tokens first (lowest precedence)
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

    if (bodyFamily) tokens['--font-body'] = bodyFamily;
    if (headingFamily) tokens['--font-heading'] = headingFamily;
    if (codeFamily) tokens['--font-code'] = codeFamily;
  }

  // 2. Apply explicit token overrides (highest precedence — overwrites generated tokens)
  if (input.tokens) {
    for (const [key, value] of Object.entries(input.tokens)) {
      if (value !== undefined) {
        tokens[key] = resolveTokenValue(value);
      }
    }
  }

  // 3. Generate component overrides: typeScale-generated (lowest) + explicit (highest)
  let components = input.components;
  if (typeScaleConfig) {
    const generated = generateTypeScaleComponents(typeScaleConfig);
    components = deepMergeComponents(generated, input.components);
  }

  // 4. Derive fonts array from typography roles (for runtime loading)
  let fonts: ThemeFontSource[] | undefined;
  if (typo) {
    const seen = new Set<string>();
    const fontList: ThemeFontSource[] = [];
    // Heading inherits from body — collect body first, then heading (may be same), then code
    for (const role of [typo.body, typo.heading, typo.code]) {
      if (role?.family && role.url && !seen.has(role.family)) {
        seen.add(role.family);
        fontList.push({family: role.family, url: role.url});
      }
    }
    // If heading has no family/url but body does, body is already in the list
    if (fontList.length > 0) fonts = fontList;
  }

  return {
    name: input.name,
    tokens,
    components,
    icons: input.icons,
    fonts,
  };
}

// =============================================================================
// CSS generation (used by XDSTheme for unbuilt themes)
// =============================================================================

/**
 * Convert camelCase to kebab-case for CSS property names.
 * e.g. borderRadius → border-radius, backgroundColor → background-color
 */
function toKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
}

/**
 * Generate CSS rules for a defined theme.
 * Includes token overrides and component style overrides.
 */
/**
 * Generate the intermediary CSS rules for a theme.
 *
 * Returns an array of CSS rule strings — the shared format used by both
 * the runtime path (useInsertionEffect) and the build path (xds theme build).
 *
 * Options:
 * - computedValues: when true, prose rules use computed px values from tokens
 *   (for the build path where CSS must be self-contained).
 *   When false (default), prose rules use var() references to token custom properties
 *   (for the runtime path where tokens are set on :scope).
 */
export function generateThemeRules(theme: XDSDefinedTheme): string[] {
  const parts: string[] = [];
  const tokens = theme.tokens;

  // Helper: resolve a token value — tokens always have computed values
  // since defineTheme runs expandTypeScale to produce them.
  const val = (key: string): string => tokens[key] || `var(${key})`;

  // 1. Token block — CSS custom properties on :scope
  const tokenEntries = Object.entries(tokens);
  if (tokenEntries.length > 0) {
    const declarations = tokenEntries
      .map(([prop, value]) => `    ${prop}: ${value};`)
      .join('\n');
    parts.push(`  :scope {\n${declarations}\n  }`);
  }

  // 2. Component overrides (.xds-* class rules)
  if (theme.components) {
    for (const [component, rules] of Object.entries(theme.components)) {
      for (const [key, styles] of Object.entries(
        rules as Record<
          string,
          Record<string, string | Record<string, string>>
        >,
      )) {
        const entries = Object.entries(styles);
        if (entries.length > 0) {
          const suffix = parseStyleKey(key);
          const baseSelector = `.xds-${component}${suffix}`;

          // Separate regular properties from pseudo-class overrides
          const props: [string, string][] = [];
          const pseudos: [string, Record<string, string>][] = [];

          for (const [prop, value] of entries) {
            if (prop.startsWith(':') && typeof value === 'object') {
              pseudos.push([prop, value as Record<string, string>]);
            } else {
              props.push([prop, value as string]);
            }
          }

          // Emit base rule
          if (props.length > 0) {
            const declarations = props
              .map(([prop, value]) => `    ${toKebabCase(prop)}: ${value};`)
              .join('\n');
            parts.push(`  ${baseSelector} {\n${declarations}\n  }`);
          }

          // Emit pseudo-class rules
          for (const [pseudo, pseudoStyles] of pseudos) {
            const pseudoEntries = Object.entries(pseudoStyles);
            if (pseudoEntries.length > 0) {
              const declarations = pseudoEntries
                .map(([prop, value]) => `    ${toKebabCase(prop)}: ${value};`)
                .join('\n');
              parts.push(`  ${baseSelector}${pseudo} {\n${declarations}\n  }`);
            }
          }
        }
      }
    }
  }

  // 3. Prose HTML element rules (h1-h6, p, small, code, hr)
  parts.push(`  :is(h1, h2, h3, h4, h5, h6) {
    font-family: var(--font-heading);
    color: var(--color-text-primary);
  }`);

  for (let level = 1; level <= 6; level++) {
    parts.push(`  h${level} {
    font-size: ${val(`--heading-${level}-size`)};
    font-weight: ${val(`--heading-${level}-weight`)};
    line-height: ${val(`--heading-${level}-leading`)};
  }`);
  }

  parts.push(`  p {
    font-family: var(--font-heading);
    font-size: ${val('--text-body-size')};
    font-weight: ${val('--text-body-weight')};
    line-height: ${val('--text-body-leading')};
    color: var(--color-text-primary);
  }`);

  parts.push(`  small {
    font-size: ${val('--text-supporting-size')};
    font-weight: ${val('--text-supporting-weight')};
    line-height: ${val('--text-supporting-leading')};
    color: var(--color-text-secondary);
  }`);

  parts.push(`  code, pre {
    font-family: var(--font-code);
    font-size: ${val('--text-code-size')};
    line-height: ${val('--text-code-leading')};
  }`);

  parts.push(`  hr {
    border: none;
    border-top: 1px solid var(--color-border);
  }`);

  // 4. Prop-level color overrides (for text/heading/link specificity)
  const TEXT_COLOR_MAP: Record<string, string> = {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    disabled: 'var(--color-text-disabled)',
    placeholder: 'var(--color-text-secondary)',
    active: 'var(--color-accent)',
  };

  const components = theme.components || {};
  const touchesText = 'text' in components;
  const touchesHeading = 'heading' in components;
  const touchesLink = 'link' in components;

  if (touchesText || touchesHeading || touchesLink) {
    for (const [colorName, colorValue] of Object.entries(TEXT_COLOR_MAP)) {
      if (touchesText) {
        parts.push(`  .xds-text.${colorName} { color: ${colorValue}; }`);
      }
      if (touchesHeading) {
        parts.push(`  .xds-heading.${colorName} { color: ${colorValue}; }`);
      }
      if (touchesLink) {
        parts.push(`  .xds-link.${colorName} { color: ${colorValue}; }`);
      }
    }
  }

  return parts;
}

/**
 * Generate the full CSS string for a theme — runtime path.
 * Wraps rules in @scope (no @layer — runtime injects into <style> tag).
 */
export function generateThemeCSS(theme: XDSDefinedTheme): string {
  const rules = generateThemeRules(theme);
  if (rules.length === 0) return '';
  const scopeSelector = `[data-xds-theme="${theme.name}"]`;
  const inner = rules.join('\n\n');
  return `@scope (${scopeSelector}) to ([data-xds-theme]) {\n${inner}\n}`;
}

// =============================================================================
// Type guard
// =============================================================================

/** Check if a theme object was created with defineTheme */
export function isDefinedTheme(theme: unknown): theme is XDSDefinedTheme {
  return (
    typeof theme === 'object' &&
    theme !== null &&
    'name' in theme &&
    'tokens' in theme &&
    !('styles' in theme)
  );
}
