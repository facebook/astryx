// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokens.ts
 * @input DefinedTheme objects and token names
 * @output Server-safe token helpers for resolving theme values and building CSS var references
 * @position Public theme utility; backs useTheme and external styling-library adapters
 *
 * Use these helpers when code outside React hooks needs Astryx token values:
 * build-time theme adapters, chart configuration, canvas/SVG rendering, tests,
 * or plain JS theme objects for other styling libraries.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/useTheme.ts
 * - /packages/core/src/theme/index.ts
 */

import {
  xdsTokenDefaults,
  type DefinedTheme,
  type TokenName,
  type TokenValue,
} from './defineTheme';

/** Resolved color mode used when choosing the side of light/dark token values. */
export type ResolvedThemeMode = 'light' | 'dark';

/** Options for resolving all tokens from a theme object. */
export interface ResolveThemeTokensOptions {
  /** Effective mode to resolve. Pass an explicit value; this helper does not read media queries. */
  mode: ResolvedThemeMode;
}

/** Options for resolving one token from a theme object. */
export interface ResolveThemeTokenOptions extends ResolveThemeTokensOptions {
  /** Value to return when the token name is unknown. Defaults to an empty string. */
  fallback?: string;
}

/**
 * Return a CSS custom property reference for an Astryx token name.
 *
 * Useful for non-StyleX styling-library configs (Panda, Chakra, MUI,
 * Emotion, styled-components, UnoCSS, CSS Modules) where the value should
 * stay connected to the active Astryx theme through the CSS cascade.
 *
 * @example
 * ```ts
 * const theme = {
 *   colors: {
 *     text: tokenVar('--color-text-primary'),
 *     surface: tokenVar('--color-background-surface'),
 *   },
 * };
 * ```
 */
export function tokenVar(name: TokenName | (string & {})): string {
  return `var(${name})`;
}

/** Flat map of every known Astryx token name to its `var(--token-name)` reference. */
export const tokenVars: Record<TokenName, string> = Object.fromEntries(
  Object.keys(xdsTokenDefaults).map(name => [name, tokenVar(name)]),
) as Record<TokenName, string>;

/**
 * Split the arguments of a CSS function body on the first top-level comma.
 * Handles nested functions such as rgba(), color-mix(), var(), and quoted strings.
 */
function splitTopLevelComma(input: string): [string, string] | null {
  let depth = 0;
  let quote: '"' | "'" | null = null;
  let isEscaped = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (quote !== null) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '(') {
      depth++;
      continue;
    }

    if (char === ')') {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (char === ',' && depth === 0) {
      return [input.slice(0, i).trim(), input.slice(i + 1).trim()];
    }
  }

  return null;
}

/** Parse a CSS light-dark(light, dark) function into its two argument values. */
function parseLightDark(value: string): [light: string, dark: string] | null {
  const trimmed = value.trim();
  const prefix = 'light-dark(';
  if (!trimmed.startsWith(prefix) || !trimmed.endsWith(')')) {
    return null;
  }

  const inner = trimmed.slice(prefix.length, -1);
  return splitTopLevelComma(inner);
}

/**
 * Resolve a token value for a specific mode.
 *
 * - `[light, dark]` tuple → picks the side for `mode`
 * - `light-dark(light, dark)` string → parses nested CSS values and picks the side
 * - any other string → returned unchanged
 */
function resolveXDSTokenValue(
  value: TokenValue,
  mode: ResolvedThemeMode,
): string {
  if (Array.isArray(value)) {
    return mode === 'dark' ? value[1] : value[0];
  }

  const parsed = parseLightDark(value);
  if (parsed !== null) {
    return mode === 'dark' ? parsed[1] : parsed[0];
  }

  return value;
}

/**
 * Resolve all Astryx token values for a theme and effective color mode.
 *
 * The result starts with `xdsTokenDefaults`, applies `theme.tokens`, then
 * reapplies `theme.__inputTokens` when available so explicit tuple overrides
 * retain their original light/dark sides instead of relying on CSS parsing.
 * This mirrors the token resolution used by `useTheme()` but does not need
 * React context or media queries.
 *
 * Pass `theme` as null/undefined to resolve defaults only.
 */
export function resolveThemeTokens(
  theme: DefinedTheme | null | undefined,
  options: ResolveThemeTokensOptions,
): Record<string, string> {
  const {mode} = options;
  const resolved: Record<string, string> = {};

  for (const [key, value] of Object.entries(xdsTokenDefaults)) {
    resolved[key] = resolveXDSTokenValue(value, mode);
  }

  if (theme == null) {
    return resolved;
  }

  for (const [key, value] of Object.entries(theme.tokens)) {
    resolved[key] = resolveXDSTokenValue(value, mode);
  }

  if (theme.__inputTokens) {
    for (const [key, value] of Object.entries(theme.__inputTokens)) {
      if (value !== undefined) {
        resolved[key] = resolveXDSTokenValue(value, mode);
      }
    }
  }

  return resolved;
}

/** Resolve one Astryx token value for a theme and effective color mode. */
export function resolveThemeToken(
  theme: DefinedTheme | null | undefined,
  name: TokenName | (string & {}),
  options: ResolveThemeTokenOptions,
): string {
  const tokens = resolveThemeTokens(theme, options);
  return tokens[name] ?? options.fallback ?? '';
}
