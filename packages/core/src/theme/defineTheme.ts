/**
 * defineTheme — Create an XDS theme from a flat token map.
 *
 * Two distribution modes:
 * - Unbuilt: XDSTheme generates CSS and injects a <style> tag at runtime
 * - Built: `npx xds build-theme` pre-compiles to a CSS file; XDSTheme just applies a className
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

import type {XDSIconRegistry} from '../Icon/IconRegistry';
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
export type TokenValue = string | [light: string, dark: string];

/**
 * CSS property values for a style rule.
 * Keys are camelCase CSS properties, values are CSS strings.
 */
export type StyleOverrides = Record<string, string>;

/**
 * Component style overrides.
 *
 * Each top-level key is a component name. Values are objects where:
 * - `base` — styles for all instances
 * - `prop:value` — styles when a visual prop matches (e.g. `variant:secondary`)
 * - `prop:value+prop:value` — intersection of multiple props
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
export type ComponentStyleMap = Record<string, Record<string, StyleOverrides>>;

/** Input to defineTheme */
export interface DefineThemeInput {
  /** Theme name — used for CSS class and identification */
  name: string;
  /** Token overrides — flat map of CSS custom property names to values.
   *  Values can be a string or [light, dark] tuple.
   *  Only include tokens you want to override; defaults fill the rest. */
  tokens?: Partial<Record<XDSTokenName, TokenValue>>;
  /**
   * Component style overrides — keyed by component name (lowercase).
   * Each entry maps CSS properties to values, scoped under the theme class.
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
   * // [data-xds-theme="ocean"] .xds-button { font-weight: 600; }
   * // [data-xds-theme="ocean"] .xds-button[data-variant="secondary"] { ... }
   * ```
   */
  components?: ComponentStyleMap;
  /** Icon registry — maps semantic icon names to React nodes */
  icons?: Partial<XDSIconRegistry>;
}

/** A defined theme — ready to pass to <XDSTheme> */
export interface DefinedTheme {
  /** Theme name */
  name: string;
  /** Resolved token values (overrides merged with defaults) */
  tokens: Record<string, string>;
  /** Only the overridden tokens (for CSS generation) */
  overrides: Record<string, string>;
  /** Component style overrides */
  components?: ComponentStyleMap;
  /** Icon registry */
  icons?: Partial<XDSIconRegistry>;
  /** Pre-built CSS className — set by build-theme, absent for unbuilt themes */
  __builtClassName?: string;
  /** Marker to distinguish from legacy Theme type */
  __defined: true;
}

// =============================================================================
// All defaults merged into a single flat map
// =============================================================================

const allDefaults: Record<string, string> = {
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
function resolveTokenValue(value: TokenValue): string {
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
export function defineTheme(input: DefineThemeInput): DefinedTheme {
  const overrides: Record<string, string> = {};

  if (input.tokens) {
    for (const [key, value] of Object.entries(input.tokens)) {
      if (value !== undefined) {
        if (!(key in allDefaults)) {
          console.warn(
            `[XDS] defineTheme("${input.name}"): unknown token "${key}". ` +
              `Run "npx xds docs tokens" to see valid token names.`,
          );
        }
        overrides[key] = resolveTokenValue(value);
      }
    }
  }

  // Merge: defaults + overrides
  const tokens = {...allDefaults, ...overrides};

  return {
    name: input.name,
    tokens,
    overrides,
    components: input.components,
    icons: input.icons,
    __defined: true,
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
 * Parse a component style key into a CSS selector suffix.
 *
 * Uses class names for visual prop values — shorter HTML, easier to inspect.
 * The component class (e.g. .xds-button) disambiguates any value overlaps.
 *
 * Values starting with a digit get prefixed with the prop name since
 * CSS class names can't start with a number.
 *
 * - `base` → '' (no suffix)
 * - `variant:secondary` → '.secondary'
 * - `level:1` → '.level-1'
 * - `variant:destructive+size:sm` → '.destructive.sm'
 */
function parseStyleKey(key: string): string {
  if (key === 'base') return '';

  return key
    .split('+')
    .map(part => {
      const [prop, value] = part.split(':');
      // CSS classes can't start with a digit — prefix with prop name
      if (/^\d/.test(value)) {
        return `.${prop}-${value}`;
      }
      return `.${value}`;
    })
    .join('');
}

/**
 * Generate CSS rules for a defined theme.
 * Includes token overrides and component style overrides.
 */
export function generateThemeCSS(theme: DefinedTheme): string {
  const parts: string[] = [];
  const scopeSelector = `[data-xds-theme="${theme.name}"]`;

  // Token overrides — applied to the scope root itself
  const tokenEntries = Object.entries(theme.overrides);
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

/**
 * Get the className for a defined theme.
 * Built themes use the pre-compiled class; unbuilt themes use the generated one.
 */
export function getThemeClassName(theme: DefinedTheme): string {
  return theme.__builtClassName ?? `xds-theme-${theme.name}`;
}

// =============================================================================
// Type guard
// =============================================================================

/** Check if a theme object was created with defineTheme */
export function isDefinedTheme(theme: unknown): theme is DefinedTheme {
  return (
    typeof theme === 'object' &&
    theme !== null &&
    '__defined' in theme &&
    (theme as DefinedTheme).__defined === true
  );
}
