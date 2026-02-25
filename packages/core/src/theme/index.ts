/**
 * XDS Theme System
 *
 * Exports:
 * - XDSTheme: Provider component that applies theme
 * - useXDSTheme: Hook to access current theme
 * - Token exports for direct use in StyleX
 *
 * Themes are in separate packages:
 *   import { defaultTheme } from '@xds/theme-default';
 *   import { neutralTheme } from '@xds/theme-neutral';
 */

export {XDSTheme, useXDSTheme, Theme, useTheme} from './XDSTheme';

// Export token defaults and vars for use in custom components and themes
export {
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
  colorVars,
  spacingVars,
  sizeVars,
  radiusVars,
  elevationVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
  fontWeightVars,
} from './tokens.stylex';

// Deprecated re-exports — use *Defaults instead
export {
  colorRaw,
  spacingRaw,
  sizeRaw,
  radiusRaw,
  elevationRaw,
  transitionRaw,
  typographyRaw,
  textSizeRaw,
  lineHeightRaw,
  fontWeightRaw,
} from './tokens.stylex';

// Export token key types for theme authoring
export type {
  ColorVarName,
  SpacingVarName,
  SizeVarName,
  RadiusVarName,
  ElevationVarName,
  TransitionVarName,
  TypographyVarName,
  TextSizeVarName,
  LineHeightVarName,
  FontWeightVarName,
} from './tokens.stylex';

export type {
  Theme as ThemeType,
  ThemeRaw,
  ThemeMode,
  ComponentStyles,
  ThemeStyles,
  HeadingLevel,
  XDSTextType,
  XDSTextSize,
  XDSTextWeight,
  XDSTextColor,
} from './types';
