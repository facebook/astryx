// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {DefinedTheme} from '@xds/core/theme';
import {xdsTokenDefaults} from '@xds/core/theme';

/**
 * Parse a light-dark() CSS value into [light, dark] components.
 */
export function parseLightDark(value: string): [string, string] | null {
  const match = value.match(/^light-dark\(\s*([^,]+?)\s*,\s*(.+?)\s*\)$/);
  if (!match) {
    return null;
  }
  return [match[1], match[2]];
}

/**
 * Resolve a token's value for a specific mode from a defined theme.
 * Checks __inputTokens for [light, dark] tuples first,
 * then parses light-dark() from resolved tokens,
 * then falls back to xdsTokenDefaults.
 */
export function resolveTokenForMode(
  theme: DefinedTheme,
  tokenName: string,
  mode: 'light' | 'dark',
): string {
  // 1. Check __inputTokens (preserves tuples)
  const inputTokens = theme.__inputTokens;
  if (inputTokens) {
    const val = inputTokens[tokenName];
    if (Array.isArray(val)) {
      return mode === 'dark' ? val[1] : val[0];
    }
    if (typeof val === 'string') {
      const parsed = parseLightDark(val);
      if (parsed) {
        return mode === 'dark' ? parsed[1] : parsed[0];
      }
      return val;
    }
  }
  // 2. Check theme.tokens (resolved, may contain light-dark())
  const resolved = theme.tokens[tokenName];
  if (resolved) {
    const parsed = parseLightDark(resolved);
    if (parsed) {
      return mode === 'dark' ? parsed[1] : parsed[0];
    }
    return resolved;
  }
  // 3. Fall back to defaults
  const def = xdsTokenDefaults[tokenName];
  if (def) {
    const parsed = parseLightDark(def);
    if (parsed) {
      return mode === 'dark' ? parsed[1] : parsed[0];
    }
    return def;
  }
  return '';
}

/**
 * Resolve a token for the current mode (resolves light-dark() to a single value).
 */
export function resolveToken(
  theme: DefinedTheme,
  tokenName: string,
): string {
  const resolved = theme.tokens[tokenName];
  if (resolved) {
    const parsed = parseLightDark(resolved);
    // Default to light mode for display
    if (parsed) {
      return parsed[0];
    }
    return resolved;
  }
  const def = xdsTokenDefaults[tokenName];
  if (def) {
    const parsed = parseLightDark(def);
    if (parsed) {
      return parsed[0];
    }
    return def;
  }
  return '';
}

/**
 * Check if a theme has dual light/dark mode support.
 */
export function hasDualMode(theme: DefinedTheme): boolean {
  const inputTokens = theme.__inputTokens;
  if (inputTokens) {
    return Object.values(inputTokens).some(v => Array.isArray(v));
  }
  return Object.values(theme.tokens).some(
    v => typeof v === 'string' && v.includes('light-dark('),
  );
}

/**
 * Get all token names matching a prefix from the theme + defaults.
 * Sorts numerically when tokens end with a number (e.g. --spacing-2 before --spacing-10).
 */
export function getTokensByPrefix(
  theme: DefinedTheme,
  prefix: string,
): string[] {
  const allKeys = new Set([
    ...Object.keys(xdsTokenDefaults),
    ...Object.keys(theme.tokens),
  ]);
  return [...allKeys]
    .filter(k => k.startsWith(prefix))
    .sort((a, b) => {
      // Extract the suffix after the prefix
      const suffA = a.slice(prefix.length);
      const suffB = b.slice(prefix.length);
      // Try numeric comparison first
      const numA = parseFloat(suffA);
      const numB = parseFloat(suffB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      // Non-numeric suffixes: sort alphabetically
      return suffA.localeCompare(suffB);
    });
}
