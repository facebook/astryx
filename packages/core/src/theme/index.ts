// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * XDS Theme System
 *
 * Exports:
 * - Theme: Provider component that applies theme
 * - defineTheme: Create themes with token + component overrides
 * - Token exports for direct use in StyleX
 *
 * Themes are in separate packages:
 *   import { defaultTheme } from '@xds/theme-default';
 *   import { neutralTheme } from '@xds/theme-neutral';
 */

export {Theme} from './Theme';
export {MediaTheme} from './MediaTheme';
export type {MediaThemeProps} from './MediaTheme';
export {
  defineTheme,
  generateThemeCSS,
  generateThemeCSSFlat,
  generateOnMediaCSS,
  generateThemeRules,
  generateThemeRulesSplit,
  type ThemeCSSOutput,
  type ThemeRulesSplit,
  isDefinedTheme,
  xdsTokenDefaults,
} from './defineTheme';
export type {
  DefineThemeInput,
  DefinedTheme,
  CoreTokenName,
  TokenName,
  TokenValue,
  ComponentStyleMap,
  StyleOverrides,
} from './defineTheme';

export type {
  SyntaxTokenName,
  DomainTokenName,
  DataTokenName,
} from './domainTokens';

export {
  syntaxTokenDefaults,
  domainTokenDefaults,
  dataTokenDefaults,
} from './domainTokens';

// Syntax theme API
export {defineSyntaxTheme} from './syntax';
export type {
  SyntaxTheme,
  SyntaxThemeInput,
  SyntaxThemeTokenKey,
  SyntaxThemeTokenMap,
  SyntaxThemeTokenInput,
  SyntaxTokenValue,
} from './syntax';

// SyntaxTheme provider
export {SyntaxTheme, useSyntaxTheme} from './syntax';
export type {UseXDSSyntaxThemeReturn} from './syntax';

export {expandTypeScale, generateTypeScaleComponents} from './expandTypeScale';
export type {TypeScaleConfig, TypeScaleTokens} from './expandTypeScale';

export {expandRadiusScale} from './expandRadiusScale';
export type {
  RadiusScaleConfig,
  RadiusScaleTokens,
} from './expandRadiusScale';

export {expandColorScale} from './expandColorScale';
export type {ColorScaleConfig, ColorScaleTokens} from './expandColorScale';

export {expandMotionScale} from './expandMotionScale';
export type {
  MotionScaleConfig,
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

export {useTheme, ThemeContext} from './useTheme';
export type {UseXDSThemeReturn, ThemeContextValue} from './useTheme';
export {
  resolveXDSThemeToken,
  resolveXDSThemeTokens,
  xdsTokenVar,
  xdsTokenVars,
} from './tokens';
export type {
  ResolveXDSThemeTokenOptions,
  ResolveXDSThemeTokensOptions,
  ResolvedThemeMode,
} from './tokens';

export type {
  ThemeMode,
  HeadingLevel,
  TextType,
  BuiltinTextType,
  CustomTextTypes,
  TextSize,
  TextWeight,
  TextColor,
  TypographyConfig,
  TypographyRole,
  FontWeight,
} from './types';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  MediaTheme as XDSMediaTheme,
  SyntaxTheme as XDSSyntaxTheme,
  Theme as XDSTheme,
  ThemeContext as XDSThemeContext,
  useSyntaxTheme as useXDSSyntaxTheme,
  useTheme as useXDSTheme,
} from '.';
export type {
  BorderVarName as XDSBorderVarName,
  BuiltinTextType as XDSBuiltinTextType,
  ColorScaleConfig as XDSColorScaleConfig,
  ColorScaleTokens as XDSColorScaleTokens,
  ColorVarName as XDSColorVarName,
  ComponentStyleMap as XDSComponentStyleMap,
  CoreTokenName as XDSCoreTokenName,
  CustomTextTypes as XDSCustomTextTypes,
  DataTokenName as XDSDataTokenName,
  DefineThemeInput as XDSDefineThemeInput,
  DefinedTheme as XDSDefinedTheme,
  DomainTokenName as XDSDomainTokenName,
  DurationVarName as XDSDurationVarName,
  EaseVarName as XDSEaseVarName,
  FontWeight as XDSFontWeight,
  FontWeightVarName as XDSFontWeightVarName,
  HeadingLevel as XDSHeadingLevel,
  MediaThemeProps as XDSMediaThemeProps,
  MotionScaleConfig as XDSMotionScaleConfig,
  MotionScaleTokens as XDSMotionScaleTokens,
  RadiusScaleConfig as XDSRadiusScaleConfig,
  RadiusScaleTokens as XDSRadiusScaleTokens,
  RadiusVarName as XDSRadiusVarName,
  ResolveXDSThemeTokenOptions as XDSResolveXDSThemeTokenOptions,
  ResolveXDSThemeTokensOptions as XDSResolveXDSThemeTokensOptions,
  ResolvedThemeMode as XDSResolvedThemeMode,
  ShadowVarName as XDSShadowVarName,
  SizeVarName as XDSSizeVarName,
  SpacingVarName as XDSSpacingVarName,
  StyleOverrides as XDSStyleOverrides,
  SyntaxTheme as XDSSyntaxTheme,
  SyntaxThemeInput as XDSSyntaxThemeInput,
  SyntaxThemeTokenInput as XDSSyntaxThemeTokenInput,
  SyntaxThemeTokenKey as XDSSyntaxThemeTokenKey,
  SyntaxThemeTokenMap as XDSSyntaxThemeTokenMap,
  SyntaxTokenName as XDSSyntaxTokenName,
  SyntaxTokenValue as XDSSyntaxTokenValue,
  TextColor as XDSTextColor,
  TextSize as XDSTextSize,
  TextSizeVarName as XDSTextSizeVarName,
  TextType as XDSTextType,
  TextWeight as XDSTextWeight,
  ThemeCSSOutput as XDSThemeCSSOutput,
  ThemeContextValue as XDSThemeContextValue,
  ThemeMode as XDSThemeMode,
  ThemeRulesSplit as XDSThemeRulesSplit,
  TokenName as XDSTokenName,
  TokenValue as XDSTokenValue,
  TransitionVarName as XDSTransitionVarName,
  TypeScaleConfig as XDSTypeScaleConfig,
  TypeScaleTokens as XDSTypeScaleTokens,
  TypeScaleVarName as XDSTypeScaleVarName,
  TypographyConfig as XDSTypographyConfig,
  TypographyRole as XDSTypographyRole,
  TypographyVarName as XDSTypographyVarName,
  UseXDSSyntaxThemeReturn as XDSUseXDSSyntaxThemeReturn,
  UseXDSThemeReturn as XDSUseXDSThemeReturn,
} from '.';
// <compat-aliases:end>
