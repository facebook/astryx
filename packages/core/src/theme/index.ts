/**
 * XDS Theme System
 *
 * Exports:
 * - createTheme: Create a theme with light-dark() color values
 * - Theme: Provider component that applies theme
 * - useTheme: Hook to access current theme
 * - Token exports for direct use in StyleX
 * - Types for theme configuration
 */

export { createTheme } from './createTheme';
export { Theme, useTheme } from './Theme';
export { defaultTheme } from './defaultTheme';
export { shadcnTheme } from './shadcnTheme';

// Export tokens for use in custom components
export {
  colorTokens,
  spacingTokens,
  radiusTokens,
  elevationTokens,
  transitionTokens,
  typographyTokens,
} from './tokens.stylex';

// Export pre-compiled themes (for advanced use)
export {
  colorTheme,
  elevationTheme,
  // Legacy exports for backwards compatibility
  lightTheme,
  darkTheme,
  lightElevationTheme,
  darkElevationTheme,
} from './themes.stylex';

export type {
  Theme as ThemeType,
  ThemeConfig,
  ThemeTokenOverrides,
  ThemeMode,
  ColorTokenOverrides,
  SpacingTokenOverrides,
  RadiusTokenOverrides,
  ElevationTokenOverrides,
  TransitionTokenOverrides,
  TypographyTokenOverrides,
  ColorPair,
  ColorValue,
} from './types';
