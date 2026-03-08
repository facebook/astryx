/**
 * XDS Theme System
 *
 * Exports:
 * - XDSTheme: Provider component that applies theme
 * - defineTheme: Create themes with token + component overrides
 * - Token exports for direct use in StyleX
 *
 * Themes are in separate packages:
 *   import { defaultTheme } from '@xds/theme-default';
 *   import { neutralTheme } from '@xds/theme-neutral';
 */

export {XDSTheme} from './XDSTheme';
export {
  defineTheme,
  generateThemeCSS,
  isDefinedTheme,
  xdsTokenDefaults,
} from './defineTheme';
export type {
  XDSDefineThemeInput,
  XDSDefinedTheme,
  XDSTokenName,
  XDSTokenValue,
  XDSComponentStyleMap,
  XDSStyleOverrides,
} from './defineTheme';

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
  ThemeMode,
  HeadingLevel,
  XDSTextType,
  XDSTextSize,
  XDSTextWeight,
  XDSTextColor,
} from './types';
