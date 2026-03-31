'use client';

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
  XDSCoreTokenName,
  XDSTokenName,
  XDSTokenValue,
  XDSComponentStyleMap,
  XDSStyleOverrides,
} from './defineTheme';

export type {SyntaxTokenName, DomainTokenName} from './domainTokens';

export {syntaxTokenDefaults, domainTokenDefaults} from './domainTokens';

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
  borderDefaults,
  radiusDefaults,
  shadowDefaults,
  durationDefaults,
  easeDefaults,
  transitionDefaults,
  typographyDefaults,
  textSizeDefaults,
  fontWeightDefaults,
  typeScaleDefaults,
  colorVars,
  spacingVars,
  sizeVars,
  borderVars,
  radiusVars,
  shadowVars,
  durationVars,
  easeVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  fontWeightVars,
  typeScaleVars,
} from './tokens.stylex';

// Export token key types for theme authoring
export type {
  ColorVarName,
  SpacingVarName,
  SizeVarName,
  BorderVarName,
  RadiusVarName,
  ShadowVarName,
  DurationVarName,
  EaseVarName,
  TransitionVarName,
  TypographyVarName,
  TextSizeVarName,
  FontWeightVarName,
  TypeScaleVarName,
} from './tokens.stylex';

export {useXDSTheme} from './useXDSTheme';
export type {UseXDSThemeReturn} from './useXDSTheme';

export type {
  ThemeMode,
  HeadingLevel,
  XDSTextType,
  XDSTextSize,
  XDSTextWeight,
  XDSTextColor,
  ThemeFontSource,
  TypographyConfig,
  TypographyRole,
  FontWeight,
} from './types';
