/**
 * XDS Theme Type Definitions
 */

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
 * Raw theme values - plain objects with the actual CSS values
 * Useful for programmatic access (e.g., parsing light-dark() values)
 */
export interface ThemeRaw {
  /** Raw color values (e.g., 'light-dark(#0064E0, #2694FE)') */
  colors: Record<string, string>;
  /** Raw spacing values (e.g., '8px') */
  spacing: Record<string, string>;
  /** Raw size values (e.g., '32px') */
  size: Record<string, string>;
  /** Raw radius values (e.g., '12px') */
  radius: Record<string, string>;
  /** Raw elevation values (e.g., '0px 2px 4px rgba(0,0,0,0.1)') */
  elevation: Record<string, string>;
  /** Raw transition values (e.g., '0.2s ease') */
  transition: Record<string, string>;
  /** Raw typography values (e.g., font family strings) */
  typography: Record<string, string>;
  /** Raw text size values (e.g., '1rem') */
  textSize: Record<string, string>;
  /** Raw line height values (e.g., '1.5') */
  lineHeight: Record<string, string>;
  /** Raw font weight values (e.g., '400') */
  fontWeight: Record<string, string>;
}

/**
 * Theme styles - StyleX styles that set CSS variables
 */
export interface ThemeStyles {
  /** Color CSS variables */
  colors: StyleXStyles;
  /** Spacing CSS variables */
  spacing: StyleXStyles;
  /** Size CSS variables (component heights: sm, md, lg) */
  size: StyleXStyles;
  /** Radius CSS variables */
  radius: StyleXStyles;
  /** Elevation CSS variables */
  elevation: StyleXStyles;
  /** Transition CSS variables */
  transition: StyleXStyles;
  /** Typography (font family) CSS variables */
  typography: StyleXStyles;
  /** Text size CSS variables */
  textSize: StyleXStyles;
  /** Line height CSS variables */
  lineHeight: StyleXStyles;
  /** Font weight CSS variables */
  fontWeight: StyleXStyles;
}

/**
 * Theme object - pre-compiled StyleX styles that set CSS variables
 */
export interface Theme {
  /** Theme name */
  name: string;
  /** StyleX styles containing CSS variable definitions */
  styles: ThemeStyles;
  /** Raw CSS values for programmatic access */
  raw: ThemeRaw;
  /** Component-specific style overrides (optional) */
  components?: ComponentStyles;
}
