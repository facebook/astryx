'use client';

/**
 * @file syntax/index.ts
 * @position Re-exports for the syntax theme subsystem
 */

export {syntaxTokenDefaults} from './tokens';
export type {SyntaxTokenName} from './tokens';

export {defineSyntaxTheme, syntaxThemeStyle, syntaxThemeToCSS} from './defineSyntaxTheme';
export type {
  SyntaxTheme,
  SyntaxThemeInput,
  SyntaxThemeTokenKey,
  SyntaxThemeTokenMap,
  SyntaxThemeTokenInput,
  SyntaxTokenValue,
} from './defineSyntaxTheme';

export {XDSSyntaxTheme, useXDSSyntaxTheme} from './XDSSyntaxTheme';
export type {UseXDSSyntaxThemeReturn} from './XDSSyntaxTheme';
