/**
 * XDS Theme System
 *
 * Exports:
 * - Theme: Provider component that applies theme
 * - useTheme: Hook to access current theme
 * - defaultTheme: XDS default theme
 * - neutralTheme: Neutral grayscale theme
 * - Token exports for direct use in StyleX
 */

export { Theme, useTheme } from './Theme';
export { defaultTheme } from './defaultTheme.stylex';
export { neutralTheme } from './neutralTheme.stylex';

// Export tokens for use in custom components
export {
  color,
  spacing,
  radius,
  elevation,
  transition,
  typography,
} from './tokens.stylex';

// Export token key types for theme authoring
export type {
  ColorTokenKey,
  SpacingTokenKey,
  RadiusTokenKey,
  ElevationTokenKey,
  TransitionTokenKey,
  TypographyTokenKey,
} from './tokens.stylex';

export type {
  Theme as ThemeType,
  ThemeMode,
  ThemeRaw,
  ComponentStyles,
  ThemeStyles,
} from './types';
