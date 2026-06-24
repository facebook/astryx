// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Astryx Theme System
 *
 * Exports:
 * - Theme: Provider component that applies theme
 * - defineTheme: Create themes with token + component overrides
 * - Token exports for direct use in StyleX
 *
 * Themes are in separate packages:
 *   import { defaultTheme } from '@astryxdesign/theme-default';
 *   import { neutralTheme } from '@astryxdesign/theme-neutral';
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
  SyntaxThemeDefinition,
  SyntaxThemeInput,
  SyntaxThemeTokenKey,
  SyntaxThemeTokenMap,
  SyntaxThemeTokenInput,
  SyntaxTokenValue,
} from './syntax';

// SyntaxTheme provider
export {SyntaxTheme, useSyntaxTheme} from './syntax';
export type {UseSyntaxThemeReturn} from './syntax';

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
export type {UseThemeReturn, ThemeContextValue} from './useTheme';
export {
  resolveThemeToken,
  resolveThemeTokens,
  tokenVar,
  tokenVars,
} from './tokens';
export type {
  ResolveThemeTokenOptions,
  ResolveThemeTokensOptions,
  ResolvedThemeMode,
} from './tokens';

export type {
  ThemeMode,
  HeadingTag,
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
