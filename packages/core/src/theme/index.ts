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
  generateThemeRules,
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

export {expandTypeScale, generateTypeScaleComponents} from './expandTypeScale';
export type {XDSTypeScaleConfig, TypeScaleTokens} from './expandTypeScale';

export {expandRadiusScale} from './expandRadiusScale';
export type {
  XDSRadiusScaleConfig,
  RadiusScaleTokens,
} from './expandRadiusScale';

export {expandMotionScale} from './expandMotionScale';
export type {
  XDSMotionScaleConfig,
  MotionScaleTokens,
} from './expandMotionScale';

// Export token defaults and vars for use in custom components and themes
export {
  colorDefaults,
  spacingDefaults,
  sizeDefaults,
  radiusDefaults,
  elevationDefaults,
  durationDefaults,
  easingDefaults,
  transitionDefaults,
  typographyDefaults,
  textSizeDefaults,
  lineHeightDefaults,
  fontWeightDefaults,
  typeScaleDefaults,
  colorVars,
  spacingVars,
  sizeVars,
  radiusVars,
  elevationVars,
  durationVars,
  easingVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
  fontWeightVars,
  typeScaleVars,
} from './tokens.stylex';

// Export token key types for theme authoring
export type {
  ColorVarName,
  SpacingVarName,
  SizeVarName,
  RadiusVarName,
  ElevationVarName,
  DurationVarName,
  EasingVarName,
  TransitionVarName,
  TypographyVarName,
  TextSizeVarName,
  LineHeightVarName,
  FontWeightVarName,
  TypeScaleVarName,
} from './tokens.stylex';

export type {
  ThemeMode,
  HeadingLevel,
  XDSTextType,
  XDSTextSize,
  XDSTextWeight,
  XDSTextColor,
} from './types';
