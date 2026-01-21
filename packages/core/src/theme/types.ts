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
 * Component-specific style overrides
 * Each component augments this interface to add its own entry
 * See Button.tsx for an example of module augmentation
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComponentStyles {
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
  /** Raw radius values (e.g., '12px') */
  radius: Record<string, string>;
  /** Raw elevation values (e.g., '0px 2px 4px rgba(0,0,0,0.1)') */
  elevation: Record<string, string>;
  /** Raw transition values (e.g., '0.2s ease') */
  transition: Record<string, string>;
  /** Raw typography values (e.g., font family strings) */
  typography: Record<string, string>;
}

/**
 * Theme styles - StyleX styles that set CSS variables
 */
export interface ThemeStyles {
  /** Color CSS variables */
  colors: StyleXStyles;
  /** Spacing CSS variables */
  spacing: StyleXStyles;
  /** Radius CSS variables */
  radius: StyleXStyles;
  /** Elevation CSS variables */
  elevation: StyleXStyles;
  /** Transition CSS variables */
  transition: StyleXStyles;
  /** Typography CSS variables */
  typography: StyleXStyles;
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
