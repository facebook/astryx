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
 * Semantic text types for XDSText
 */
export type XDSTextType =
  | 'body'
  | 'large'
  | 'label'
  | 'supporting'
  | 'code'
  | 'display-1'
  | 'display-2'
  | 'display-3';

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
