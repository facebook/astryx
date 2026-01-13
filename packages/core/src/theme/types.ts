/**
 * XDS Theme Type Definitions
 *
 * Supports color pairs [light, dark] for easy theme creation.
 * Internally converted to CSS light-dark() function.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyleXTheme = any;

/**
 * Theme mode - system follows OS preference
 */
export type ThemeMode = 'system' | 'light' | 'dark';

/**
 * Color pair tuple [light, dark]
 */
export type ColorPair = [light: string, dark: string];

/**
 * Color token value - can be a single string or [light, dark] pair
 * Single strings are used as-is (for both modes)
 * Pairs are converted to light-dark(light, dark)
 */
export type ColorValue = string | ColorPair;

/**
 * Color token overrides for createTheme
 * Each value can be:
 * - A single string: `accent: '#0066cc'` (same for both modes)
 * - A color pair: `accent: ['#0066cc', '#66b3ff']` ([light, dark])
 */
export interface ColorTokenOverrides {
  // Core semantic
  accent?: ColorValue;
  accentDeemphasized?: ColorValue;
  accentText?: ColorValue;
  surface?: ColorValue;
  wash?: ColorValue;
  overlay?: ColorValue;
  hoverOverlay?: ColorValue;
  pressedOverlay?: ColorValue;
  focusOutline?: ColorValue;
  deemphasized?: ColorValue;

  // Text
  textPrimary?: ColorValue;
  textSecondary?: ColorValue;
  textDisabled?: ColorValue;
  textLink?: ColorValue;
  textPlaceholder?: ColorValue;

  // Icon
  iconPrimary?: ColorValue;
  iconSecondary?: ColorValue;
  iconTertiary?: ColorValue;
  iconDisabled?: ColorValue;

  // Surface variants
  card?: ColorValue;
  popover?: ColorValue;
  navbar?: ColorValue;

  // Status/Sentiment
  positive?: ColorValue;
  positiveDeemphasized?: ColorValue;
  negative?: ColorValue;
  negativeDeemphasized?: ColorValue;
  warning?: ColorValue;
  warningDeemphasized?: ColorValue;
  educational?: ColorValue;
  educationalDeemphasized?: ColorValue;

  // Divider
  divider?: ColorValue;
  dividerHighContrast?: ColorValue;
  dividerEmphasized?: ColorValue;

  // Disabled/Effects
  disabledOverlay?: ColorValue;
  glimmer?: ColorValue;
  glimmerHighContrast?: ColorValue;
  shadowElevation?: ColorValue;

  // Literal color sets
  blueBackground?: ColorValue;
  blueBorder?: ColorValue;
  blueIcon?: ColorValue;
  blueText?: ColorValue;
  cyanBackground?: ColorValue;
  cyanBorder?: ColorValue;
  cyanIcon?: ColorValue;
  cyanText?: ColorValue;
  grayBackground?: ColorValue;
  grayBorder?: ColorValue;
  grayIcon?: ColorValue;
  grayText?: ColorValue;
  greenBackground?: ColorValue;
  greenBorder?: ColorValue;
  greenIcon?: ColorValue;
  greenText?: ColorValue;
  orangeBackground?: ColorValue;
  orangeBorder?: ColorValue;
  orangeIcon?: ColorValue;
  orangeText?: ColorValue;
  pinkBackground?: ColorValue;
  pinkBorder?: ColorValue;
  pinkIcon?: ColorValue;
  pinkText?: ColorValue;
  purpleBackground?: ColorValue;
  purpleBorder?: ColorValue;
  purpleIcon?: ColorValue;
  purpleText?: ColorValue;
  redBackground?: ColorValue;
  redBorder?: ColorValue;
  redIcon?: ColorValue;
  redText?: ColorValue;
  tealBackground?: ColorValue;
  tealBorder?: ColorValue;
  tealIcon?: ColorValue;
  tealText?: ColorValue;
  yellowBackground?: ColorValue;
  yellowBorder?: ColorValue;
  yellowIcon?: ColorValue;
  yellowText?: ColorValue;
}

/**
 * Spacing token overrides
 */
export interface SpacingTokenOverrides {
  space0?: string;
  space0_5?: string;
  space1?: string;
  space2?: string;
  space3?: string;
  space4?: string;
  space5?: string;
  space6?: string;
  space7?: string;
  containerPaddingPage?: string;
  containerPaddingCard?: string;
  containerPaddingPopover?: string;
  containerGapSections?: string;
}

/**
 * Radius token overrides
 */
export interface RadiusTokenOverrides {
  rounded?: string;
  container?: string;
  element?: string;
  content?: string;
}

/**
 * Elevation token overrides
 * Values can be a single string or [light, dark] pair
 */
export interface ElevationTokenOverrides {
  base?: ColorValue;
  thumb?: ColorValue;
  dialog?: ColorValue;
  hover?: ColorValue;
  menu?: ColorValue;
}

/**
 * Transition token overrides
 */
export interface TransitionTokenOverrides {
  fast?: string;
  normal?: string;
}

/**
 * Typography token overrides
 */
export interface TypographyTokenOverrides {
  fontFamilyBody?: string;
  fontFamilyCode?: string;
  fontFamilyHeading?: string;
}

/**
 * Theme token overrides for createTheme
 */
export interface ThemeTokenOverrides {
  color?: ColorTokenOverrides;
  spacing?: SpacingTokenOverrides;
  radius?: RadiusTokenOverrides;
  elevation?: ElevationTokenOverrides;
  transition?: TransitionTokenOverrides;
  typography?: TypographyTokenOverrides;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** Theme name */
  name?: string;
  /** Token overrides - color values can be [light, dark] pairs */
  tokens?: ThemeTokenOverrides;
}

/**
 * Created theme object
 */
export interface Theme {
  /** Theme name */
  name: string;
  /** Color theme StyleX styles */
  colorTheme: StyleXTheme;
  /** Elevation theme StyleX styles */
  elevationTheme: StyleXTheme;
  /** Runtime CSS variable overrides */
  overrides: Record<string, string>;
}
