/**
 * defineTheme — Create an XDS theme from a flat token map.
 *
 * Two distribution modes:
 * - Unbuilt: XDSTheme generates CSS and injects a <style> tag at runtime
 * - Built: `npx xds build-theme` pre-compiles to a CSS file; XDSTheme just
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
} from './tokens.stylex';

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
  | keyof typeof fontWeightDefaults;

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
  /** Whether this theme has been pre-compiled by build-theme CLI */
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
 * Create an XDS theme.
 *
 * Pass only the tokens you want to override — everything else
 * inherits from the XDS defaults.
 */
export function defineTheme(input: XDSDefineThemeInput): XDSDefinedTheme {
  const tokens: Record<string, string> = {};

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

  return {
    name: input.name,
    tokens,
    components: input.components,
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
export function generateThemeCSS(theme: XDSDefinedTheme): string {
  const parts: string[] = [];
  const scopeSelector = `[data-xds-theme="${theme.name}"]`;

  // Token overrides — applied to the scope root itself
  const tokenEntries = Object.entries(theme.tokens);
  if (tokenEntries.length > 0) {
    const declarations = tokenEntries
      .map(([prop, value]) => `    ${prop}: ${value};`)
      .join('\n');
    parts.push(`  :scope {\n${declarations}\n  }`);
  }

  // Component overrides
  if (theme.components) {
    for (const [component, rules] of Object.entries(theme.components)) {
      for (const [key, styles] of Object.entries(rules)) {
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

  if (parts.length === 0) return '';

  const inner = parts.join('\n\n');
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
