/**
 * XDS Theme Type Definitions
 */

import type {XDSIconRegistry} from '../Icon/IconRegistry';

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
export type XDSTextType = 'body' | 'large' | 'label' | 'supporting' | 'code';

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
 * Prose element types for XDSFontWrapper
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

/**
 * Component-specific style overrides
 * Each component augments this interface to add its own entry
 * See Button.tsx for an example of module augmentation
 */
export interface ComponentStyles {
  // Core typography styles
  /** Heading styles (h1-h6) */
  heading?: {
    /** Default heading styles */
    styles?: Partial<Record<HeadingLevel, StyleXStyles>>;
    /** Editorial heading styles (larger scale) */
    editorialStyles?: Partial<Record<HeadingLevel, StyleXStyles>>;
  };
  /** Text styles */
  text?: {
    /** Semantic text styles (body, large, label, supporting, code) */
    styles?: Partial<Record<XDSTextType, StyleXStyles>>;
  };
  /** Prose styles for XDSFontWrapper */
  prose?: {
    /** Base wrapper styles */
    base?: StyleXStyles;
    /** Prose element styles */
    styles?: Partial<Record<ProseElement, StyleXStyles>>;
  };

  // Components add their entries via module augmentation
  // Example in Button.tsx:
  // declare module '../theme/types' {
  //   interface ComponentStyles {
  //     button?: { variants?: Partial<Record<ButtonVariant, StyleXStyles>> };
  //   }
  // }
}

/**
 * Theme styles - StyleX styles that set CSS variables.
 * All fields are optional — omitted groups use the defineVars defaults
 * from tokens.stylex.ts, enabling partial theme overrides.
 */
export interface ThemeStyles {
  /** Color CSS variables */
  colors?: StyleXStyles;
  /** Spacing CSS variables */
  spacing?: StyleXStyles;
  /** Size CSS variables (component heights: sm, md, lg) */
  size?: StyleXStyles;
  /** Radius CSS variables */
  radius?: StyleXStyles;
  /** Elevation CSS variables */
  elevation?: StyleXStyles;
  /** Transition CSS variables */
  transition?: StyleXStyles;
  /** Typography (font family) CSS variables */
  typography?: StyleXStyles;
  /** Text size CSS variables */
  textSize?: StyleXStyles;
  /** Line height CSS variables */
  lineHeight?: StyleXStyles;
  /** Font weight CSS variables */
  fontWeight?: StyleXStyles;
}

/**
 * Raw token values for programmatic access.
 * Useful for charting libraries, theme editors, or parsing light-dark() values.
 * All fields are optional — partial themes only include overridden groups.
 */
export interface ThemeRaw {
  colors?: Record<string, string>;
  spacing?: Record<string, string>;
  size?: Record<string, string>;
  radius?: Record<string, string>;
  elevation?: Record<string, string>;
  transition?: Record<string, string>;
  typography?: Record<string, string>;
  textSize?: Record<string, string>;
  lineHeight?: Record<string, string>;
  fontWeight?: Record<string, string>;
}

/**
 * Theme object - pre-compiled StyleX styles that set CSS variables
 */
export interface Theme {
  /** Theme name */
  name: string;
  /** StyleX styles containing CSS variable definitions */
  styles: ThemeStyles;
  /** Component-specific style overrides (optional) */
  components?: ComponentStyles;
  /** Optional icon registry for overriding built-in fallback icons */
  icons?: Partial<XDSIconRegistry>;
  /** Raw token values for programmatic access (optional) */
  raw?: ThemeRaw;
}
