"use strict";

/**
 * @file defineSyntaxTheme.ts
 * @input syntaxTokenDefaults from tokens.ts
 * @output defineSyntaxTheme, XDSSyntaxTheme, syntaxThemeStyle
 * @position Syntax theme definition API; consumed by presets, XDSCodeTheme, defineTheme
 *
 * @see https://github.com/facebookexperimental/xds/issues/1148
 */

import {syntaxTokenDefaults, type SyntaxTokenName} from './tokens';

// =============================================================================
// Types
// =============================================================================

/** Human-readable syntax token name (without CSS custom property prefix). */
export type SyntaxThemeTokenKey =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'function'
  | 'type'
  | 'variable'
  | 'operator'
  | 'constant'
  | 'tag'
  | 'attribute'
  | 'property'
  | 'punctuation'
  | 'background';

/** A complete mapping of token names to CSS color values. */
export type SyntaxThemeTokenMap = Record<SyntaxThemeTokenKey, string>;

export interface SyntaxThemeInput {
  name: string;
  tokens: SyntaxThemeTokenMap;
}

/** A defined syntax theme. */
export interface XDSSyntaxTheme {
  name: string;
  tokens: SyntaxThemeTokenMap;
}

// =============================================================================
// Token key <-> CSS property mapping
// =============================================================================

const CSS_PREFIX = '--color-syntax-';

function toCSSProperty(key: SyntaxThemeTokenKey): SyntaxTokenName {
  return (CSS_PREFIX + key) as SyntaxTokenName;
}

const ALL_KEYS: SyntaxThemeTokenKey[] = Object.keys(syntaxTokenDefaults)
  .map(k => k.replace(CSS_PREFIX, '') as SyntaxThemeTokenKey);

// =============================================================================
// defineSyntaxTheme
// =============================================================================

/**
 * Create a syntax theme from a complete token map.
 *
 * @example
 * const dracula = defineSyntaxTheme({
 *   name: 'dracula',
 *   tokens: { keyword: '#ff79c6', string: '#f1fa8c', ... },
 * });
 */
export function defineSyntaxTheme(input: SyntaxThemeInput): XDSSyntaxTheme {
  const missing = ALL_KEYS.filter(key => !(key in input.tokens));
  if (missing.length > 0) {
    console.warn(
      '[XDS] defineSyntaxTheme("' + input.name + '"): missing tokens: ' +
        missing.join(', ') + '. All 14 syntax tokens are required.',
    );
  }
  return {name: input.name, tokens: {...input.tokens}};
}

// =============================================================================
// Utilities
// =============================================================================

/** Generate a CSS custom property style object for React's style prop. */
export function syntaxThemeStyle(
  theme: XDSSyntaxTheme,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of ALL_KEYS) {
    vars[toCSSProperty(key)] = theme.tokens[key];
  }
  return vars;
}

/** Convert a syntax theme to CSS declarations (no selector wrapper). */
export function syntaxThemeToCSS(theme: XDSSyntaxTheme): string {
  return ALL_KEYS
    .map(key => toCSSProperty(key) + ': ' + theme.tokens[key] + ';')
    .join('\n  ');
}
