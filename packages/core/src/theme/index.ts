/**
 * XDS Theme System
 *
 * Exports:
 * - XDSTheme: Provider component that applies theme
 * - useXDSTheme: Hook to access current theme
 * - defaultTheme: XDS default theme
 * - neutralTheme: Neutral grayscale theme
 * - Token exports for direct use in StyleX
 */

export {XDSTheme, useXDSTheme, Theme, useTheme} from './XDSTheme';
export {defaultTheme} from './defaultTheme.stylex';
export {neutralTheme} from './neutralTheme.stylex';

// Export tokens for use in custom components
export {
  colorRaw,
  spacingRaw,
  radiusRaw,
  elevationRaw,
  transitionRaw,
  typographyRaw,
  textSizeRaw,
  lineHeightRaw,
  fontWeightRaw,
  colorVars,
  spacingVars,
  radiusVars,
  elevationVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
  fontWeightVars,
} from './tokens.stylex';

// Export token key types for theme authoring
export type {
  ColorVarName,
  SpacingVarName,
  RadiusVarName,
  ElevationVarName,
  TransitionVarName,
  TypographyVarName,
  TextSizeVarName,
  LineHeightVarName,
  FontWeightVarName,
  BaseColorRaw,
  BaseSpacingRaw,
  BaseRadiusRaw,
  BaseElevationRaw,
  BaseTransitionRaw,
  BaseTypographyRaw,
  BaseTextSizeRaw,
  BaseLineHeightRaw,
  BaseFontWeightRaw,
} from './tokens.stylex';

export type {
  Theme as ThemeType,
  ThemeMode,
  ThemeRaw,
  ComponentStyles,
  ThemeStyles,
  HeadingLevel,
  XDSTextType,
  XDSTextSize,
  XDSTextWeight,
  XDSTextColor,
} from './types';
