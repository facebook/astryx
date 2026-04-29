/**
 * XDS Type Definitions
 *
 * Shared types used across XDS components.
 */

/**
 * A font source declaration for a theme.
 * Used to declare fonts the theme requires so they can be preloaded,
 * reported at build time, and loaded at runtime as a fallback.
 *
 * @example
 * ```
 * fonts: [
 *   { family: 'Figtree', url: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700' },
 * ]
 * ```
 */
export interface ThemeFontSource {
  /** Font family name, e.g. 'Figtree' */
  family: string;
  /** URL to load the font from, e.g. a Google Fonts URL */
  url: string;
}

// =============================================================================
// Typography config types
// =============================================================================

/**
 * Named font weight — maps to var(--font-weight-*) at the token layer.
 * Raw CSS values (e.g. '800') are accepted as an escape hatch.
 */
export type FontWeight =
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | (string & {});

/**
 * A typography role declaration (body, heading, or code).
 *
 * @example
 * ```
 * body: {
 *   family: 'Geist',
 *   fallbacks: '"Geist Fallback", -apple-system, sans-serif',
 *   url: 'https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/style.css',
 *   weight: 'normal',
 * }
 * ```
 */
export interface TypographyRole {
  /** Primary font name — used for font loading detection via document.fonts.check() */
  family?: string;
  /** CSS fallback font stack (appended after family in the computed --font-* token) */
  fallbacks?: string;
  /** Stylesheet URL for runtime font loading. Omit for system fonts. */
  url?: string;
  /** Default font weight for this role */
  weight?: FontWeight;
  /** Per-level weight overrides (heading only: keys are heading levels 1–6) */
  weights?: Partial<Record<1 | 2 | 3 | 4 | 5 | 6, FontWeight>>;
}

/**
 * Unified typography configuration.
 *
 * Replaces the separate `typeScale`, `fonts`, and font token overrides
 * with a single config object.
 *
 * - `scale` controls the geometric type scale (base size + ratio)
 * - `body`, `heading`, `code` declare fonts, fallbacks, weights per role
 * - `heading` inherits family/fallbacks/url from `body` if not specified
 *
 * @example
 * ```
 * typography: {
 *   scale: { base: 14, ratio: 1.2 },
 *   body: { family: 'Geist', fallbacks: '-apple-system, sans-serif', url: '...' },
 *   heading: { weight: 'semibold', weights: { 3: 'bold', 4: 'bold' } },
 *   code: { family: 'Geist Mono', fallbacks: '"SF Mono", monospace', url: '...' },
 * }
 * ```
 */
export interface TypographyConfig {
  /** Type scale: generates text size tokens from base + ratio */
  scale?: {base: number; ratio: number};
  /** Body text font configuration */
  body?: TypographyRole;
  /** Heading font configuration. Inherits family/fallbacks/url from body if omitted. */
  heading?: TypographyRole;
  /** Code/monospace font configuration */
  code?: TypographyRole;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StyleXStyles = any;

/**
 * Theme mode - system follows OS preference
 */
export type ThemeMode = 'system' | 'light' | 'dark';

/**
 * Heading levels (1-6)
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Built-in semantic text types for XDSText.
 */
export type XDSBuiltinTextType =
  | 'body'
  | 'large'
  | 'label'
  | 'supporting'
  | 'code'
  | 'display-1'
  | 'display-2'
  | 'display-3';

/**
 * Semantic text types for XDSText.
 *
 * Themes can define custom text types via component overrides in defineTheme.
 * Custom types render with `body` baseline styles and receive their visual
 * treatment from theme CSS (`.xds-text.<custom-type> { ... }`).
 *
 * To add type-safe custom types, use module augmentation:
 * ```ts
 * declare module '@xds/core/theme' {
 *   interface XDSCustomTextTypes {
 *     hero: true;
 *     caption: true;
 *   }
 * }
 * ```
 *
 * `xds theme build` generates these augmentations automatically when it
 * detects new `type:*` values in a theme's component overrides.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface XDSCustomTextTypes {}

export type XDSTextType =
  | XDSBuiltinTextType
  | (keyof XDSCustomTextTypes & string);

/**
 * Text size scale for XDSText size prop override
 * Maps to --text-* tokens
 */
export type XDSTextSize =
  | '4xs'
  | '3xs'
  | '2xs'
  | 'xsm'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

/**
 * Font weight variants for XDSText/XDSHeading
 */
export type XDSTextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/**
 * Text color variants for XDSText/XDSHeading
 */
export type XDSTextColor =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'placeholder'
  | 'active'
  | 'inherit';

/**
 * Display mode for XDSText/XDSHeading
 */
export type XDSTextDisplay = 'inline' | 'block';

/**
 * Word break behavior for truncated text
 */
export type XDSWordBreak = 'break-word' | 'break-all';

/**
 * Text wrap behavior
 */
export type XDSTextWrap = 'wrap' | 'nowrap' | 'balance' | 'pretty';

/**
 * Allowed CSS properties for XDSText/XDSHeading xstyle prop.
 * Constrained to layout-only properties to prevent typography escapes.
 */
export type XDSTextXStyleAllowed = {
  // Index signature required for StyleXStyles compatibility
  [key: string]: unknown;

  // Margins
  margin?: unknown;
  marginTop?: unknown;
  marginBottom?: unknown;
  marginStart?: unknown;
  marginEnd?: unknown;
  marginBlock?: unknown;
  marginBlockStart?: unknown;
  marginBlockEnd?: unknown;
  marginInline?: unknown;
  marginInlineStart?: unknown;
  marginInlineEnd?: unknown;

  // Width constraints
  width?: unknown;
  minWidth?: unknown;
  maxWidth?: unknown;

  // Flex child properties
  alignSelf?: unknown;
  flexBasis?: unknown;
  flexGrow?: unknown;
  flexShrink?: unknown;

  // Text layout (non-typography)
  textAlign?: unknown;
  textAlignLast?: unknown;
  verticalAlign?: unknown;
};

/**
 * Prose element types for typography CSS
 */
export type ProseElement =
  | 'p'
  | 'ul'
  | 'ol'
  | 'li'
  | 'liLast'
  | 'blockquote'
  | 'code'
  | 'pre'
  | 'preCode'
  | 'hr'
  | 'strong'
  | 'em'
  | 'a'
  | 'aHover'
  | 'firstChild'
  | 'lastChild';
