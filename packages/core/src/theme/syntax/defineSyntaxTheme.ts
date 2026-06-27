// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';

/**
 * @file defineSyntaxTheme.ts
 * @input syntaxTokenDefaults from tokens.ts
 * @output defineSyntaxTheme, SyntaxTheme, syntaxThemeStyle
 * @position Syntax theme definition API; consumed by presets, SyntaxTheme, defineTheme
 *
 * @see https://github.com/facebook/astryx/issues/1148
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

/**
 * Token value — either a single string or a [light, dark] tuple.
 * Tuples are converted to CSS light-dark() at theme creation time.
 */
export type SyntaxTokenValue = string | [light: string, dark: string];

/** Token map for defineSyntaxTheme input — values can be strings or tuples. */
export type SyntaxThemeTokenInput = Record<
  SyntaxThemeTokenKey,
  SyntaxTokenValue
>;

/** Resolved token map — all values are CSS strings (tuples resolved to light-dark()). */
export type SyntaxThemeTokenMap = Record<SyntaxThemeTokenKey, string>;

/** Input to defineSyntaxTheme. */
export interface SyntaxThemeInput {
  name: string;
  tokens: SyntaxThemeTokenInput;
}

/** A defined syntax theme — tokens are resolved to CSS strings. */
export interface SyntaxThemeDefinition {
  /** Theme name */
  name: string;
  /** Resolved token values (light-dark() CSS strings) */
  tokens: SyntaxThemeTokenMap;
  /** Original input tokens (preserves tuples for mode resolution) */
  __inputTokens: SyntaxThemeTokenInput;
}

// =============================================================================
// Token key <-> CSS property mapping
// =============================================================================

const CSS_PREFIX = '--color-syntax-';

function toCSSProperty(key: SyntaxThemeTokenKey): SyntaxTokenName {
  return (CSS_PREFIX + key) as SyntaxTokenName;
}

/** All valid human-readable token keys, derived from the defaults. */
export const ALL_SYNTAX_KEYS: SyntaxThemeTokenKey[] = Object.keys(
  syntaxTokenDefaults,
).map(k => k.replace(CSS_PREFIX, '') as SyntaxThemeTokenKey);

// =============================================================================
// Helpers
// =============================================================================

/** Resolve a token value to a CSS string. Tuples become light-dark(). */
function resolveTokenValue(value: SyntaxTokenValue): string {
  if (Array.isArray(value)) {
    return `light-dark(${value[0]}, ${value[1]})`;
  }
  return value;
}

/**
 * Resolve a token value for a specific color mode.
 * - [light, dark] tuple → picks the correct side
 * - light-dark(a, b) string → parses and picks
 * - plain string → pass through
 */
export function resolveSyntaxTokenForMode(
  value: SyntaxTokenValue,
  mode: 'light' | 'dark',
): string {
  if (Array.isArray(value)) {
    return mode === 'dark' ? value[1] : value[0];
  }
  const match = value.match(/^light-dark\(([^,]+),([^)]+)\)$/);
  if (match) {
    return mode === 'dark' ? match[2].trim() : match[1].trim();
  }
  return value;
}

// =============================================================================
// defineSyntaxTheme
// =============================================================================

/**
 * Create a syntax theme from a complete token map.
 *
 * Token values can be:
 * - A string: used as-is (e.g. '#ff79c6' or 'light-dark(#0064E0, #2694FE)')
 * - A [light, dark] tuple: converted to light-dark(light, dark)
 *
 * @example
 * const myTheme = defineSyntaxTheme({
 *   name: 'my-theme',
 *   tokens: {
 *     keyword: ['#0064E0', '#2694FE'],     // [light, dark] tuple
 *     string: '#98c379',                    // same in both modes
 *     comment: 'light-dark(#666, #999)',    // CSS light-dark() string
 *     // ... all 14 tokens
 *   },
 * });
 */
export function defineSyntaxTheme(
  input: SyntaxThemeInput,
): SyntaxThemeDefinition {
  const missing = ALL_SYNTAX_KEYS.filter(key => !(key in input.tokens));
  if (missing.length > 0) {
    console.warn(
      '[Astryx] defineSyntaxTheme("' +
        input.name +
        '"): missing tokens: ' +
        missing.join(', ') +
        '. All 14 syntax tokens are required.',
    );
  }

  // Resolve tuples to light-dark() CSS strings
  const resolved: Partial<SyntaxThemeTokenMap> = {};
  for (const key of ALL_SYNTAX_KEYS) {
    resolved[key] = resolveTokenValue(input.tokens[key]);
  }

  return {
    name: input.name,
    tokens: resolved as SyntaxThemeTokenMap,
    __inputTokens: {...input.tokens},
  };
}

// =============================================================================
// Utilities
// =============================================================================

/** Generate a CSS custom property style object for React's style prop. */
export function syntaxThemeStyle(
  theme: SyntaxThemeDefinition,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of ALL_SYNTAX_KEYS) {
    vars[toCSSProperty(key)] = theme.tokens[key];
  }
  return vars;
}

/** Convert a syntax theme to CSS declarations (no selector wrapper). */
export function syntaxThemeToCSS(theme: SyntaxThemeDefinition): string {
  return ALL_SYNTAX_KEYS.map(
    key => toCSSProperty(key) + ': ' + theme.tokens[key] + ';',
  ).join('\n  ');
}
