/**
 * XDS Theme Type Definitions
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyleXTheme = any;

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
 * Theme object - pre-compiled StyleX theme
 */
export interface Theme {
  /** Theme name */
  name: string;
  /** Color theme StyleX styles */
  colorTheme: StyleXTheme;
  /** Elevation theme StyleX styles */
  elevationTheme: StyleXTheme;
  /** Spacing theme StyleX styles (optional) */
  spacingTheme?: StyleXTheme;
  /** Radius theme StyleX styles (optional) */
  radiusTheme?: StyleXTheme;
  /** Transition theme StyleX styles (optional) */
  transitionTheme?: StyleXTheme;
  /** Typography theme StyleX styles (optional) */
  typographyTheme?: StyleXTheme;
  /** Component-specific style overrides (optional) */
  components?: ComponentStyles;
}
