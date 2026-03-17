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
 *     '--radius-container': '16px',                 // same in both modes
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
import {parseStyleKey} from '../utils/parseStyleKey';
import {
  colorDefaults,
  spacingDefaults,
  sizeDefaults,
  radiusDefaults,
  elevationDefaults,
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

// =============================================================================
// Types
// =============================================================================

/** All valid XDS token names */
export type XDSTokenName =
  | keyof typeof colorDefaults
  | keyof typeof spacingDefaults
  | keyof typeof sizeDefaults
  | keyof typeof radiusDefaults
  | keyof typeof elevationDefaults
  | keyof typeof transitionDefaults
  | keyof typeof typographyDefaults
  | keyof typeof textSizeDefaults
  | keyof typeof lineHeightDefaults
  | keyof typeof fontWeightDefaults
  | keyof typeof typeScaleDefaults;

/**
 * Token value — either a single string or a [light, dark] tuple.
 * Tuples are converted to CSS light-dark() at theme creation time.
 */
export type XDSTokenValue = string | [light: string, dark: string];

/**
 * CSS property values for a style rule.
 * Keys are camelCase CSS properties, values are CSS strings.
 */
export type XDSStyleOverrides = Record<string, string>;

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
 * @example
 * ```tsx
 * components: {
 *   button: {
 *     base: { fontWeight: '600' },
 *     'variant:secondary': { backgroundColor: 'rgba(0,0,0,0.06)' },
 *     'variant:destructive+size:sm': { padding: '2px 6px' },
 *   },
 *   badge: {
 *     'variant:ghost': { border: '1px solid var(--color-divider)' },
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
   * Optional type scale configuration. Generates typography token overrides
   * from a base size and scaling ratio using a geometric progression.
   *
   * h4 is anchored to `base`. Headings h1–h3 scale up, h5–h6 scale down.
   * Text types: body/label/code at base, large one step up, supporting one step down.
   *
   * When omitted, themes use the hardcoded defaults (base=14, ratio=1.2).
   * Explicit `tokens` overrides take precedence over typeScale-generated values.
   *
   * @example
   * ```tsx
   * typeScale: { base: 14, ratio: 1.2 }
   *
   * // Suggested starting points:
   * //   Dense/functional: { base: 12, ratio: 1.125 }
   * //   Default:          { base: 14, ratio: 1.2 }
   * //   Airy/editorial:   { base: 16, ratio: 1.25 }
   * ```
   */
  typeScale?: XDSTypeScaleConfig;
  /** Token overrides — flat map of CSS custom property names to values.
   *  Values can be a string or [light, dark] tuple.
   *  Only include tokens you want to override; defaults fill the rest. */
  tokens?: Partial<Record<XDSTokenName, XDSTokenValue>>;
  /**
   * Component style overrides — keyed by component name (lowercase).
   * Each entry maps style keys to CSS property overrides, scoped under
   * the theme's data-xds-theme attribute via @scope.
   *
   * @example
   * ```tsx
   * components: {
   *   button: {
   *     base: { fontWeight: '600' },
   *     'variant:secondary': { backgroundColor: '...' },
   *   },
   * }
   * // Generates:
   * // @scope ([data-xds-theme="ocean"]) to ([data-xds-theme]) {
   * //   .xds-button { font-weight: 600; }
   * //   .xds-button.secondary { background-color: ...; }
   * // }
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
  ...elevationDefaults,
  ...transitionDefaults,
  ...typographyDefaults,
  ...textSizeDefaults,
  ...lineHeightDefaults,
  ...fontWeightDefaults,
  ...typeScaleDefaults,
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
 * Create an XDS theme.
 *
 * Pass only the tokens you want to override — everything else
 * inherits from the XDS defaults.
 *
 * When `typeScale` is provided, it generates typography token overrides
 * that are merged into the token map. Explicit `tokens` entries take
 * precedence over typeScale-generated values.
 */
export function defineTheme(input: XDSDefineThemeInput): XDSDefinedTheme {
  const tokens: Record<string, string> = {};

  // 1. Apply typeScale-generated tokens first (lowest precedence)
  if (input.typeScale) {
    const typeScaleTokens = expandTypeScale(input.typeScale);
    for (const [key, value] of Object.entries(typeScaleTokens)) {
      tokens[key] = value;
    }
  }

  // 2. Apply explicit token overrides (highest precedence — overwrites typeScale)
  if (input.tokens) {
    for (const [key, value] of Object.entries(input.tokens)) {
      if (value !== undefined) {
        if (!(key in xdsTokenDefaults)) {
          console.warn(
            `[XDS] defineTheme("${input.name}"): unknown token "${key}". ` +
              `Run "npx xds docs tokens" to see valid token names.`,
          );
        }
        tokens[key] = resolveTokenValue(value);
      }
    }
  }

  // 3. Generate component overrides: typeScale-generated (lowest) + explicit (highest)
  let components = input.components;
  if (input.typeScale) {
    const generated = generateTypeScaleComponents(input.typeScale);
    components = deepMergeComponents(generated, input.components);
  }

  return {
    name: input.name,
    tokens,
    components,
    icons: input.icons,
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
export function generateThemeRules(
  theme: XDSDefinedTheme,
): string[] {
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
      for (const [key, styles] of Object.entries(rules as Record<string, Record<string, string>>)) {
        const entries = Object.entries(styles);
        if (entries.length > 0) {
          const suffix = parseStyleKey(key);
          const declarations = entries
            .map(([prop, value]) => `    ${toKebabCase(prop)}: ${value};`)
            .join('\n');
          parts.push(`  .xds-${component}${suffix} {\n${declarations}\n  }`);
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
    border-top: 1px solid var(--color-divider);
  }`);

  // 4. Prop-level color overrides (for text/heading/link specificity)
  const TEXT_COLOR_MAP: Record<string, string> = {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    disabled: 'var(--color-text-disabled)',
    placeholder: 'var(--color-text-placeholder)',
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
