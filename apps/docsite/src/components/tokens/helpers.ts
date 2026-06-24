// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useContext, useMemo} from 'react';
import type {UseThemeReturn} from '@astryxdesign/core/theme';
import {
  borderDefaults,
  ThemeContext,
  xdsTokenDefaults,
} from '@astryxdesign/core/theme';
import type {TokenValue} from '@astryxdesign/core/theme';

const extraDefaults: Record<string, string> = {
  ...borderDefaults,
};

export function resolveToken(theme: UseThemeReturn, name: string): string {
  return theme.token(name) || extraDefaults[name] || '';
}

function resolveValue(value: TokenValue, mode: 'light' | 'dark'): string {
  if (Array.isArray(value)) {
    return mode === 'dark' ? value[1] : value[0];
  }
  const prefix = 'light-dark(';
  if (value.startsWith(prefix) && value.endsWith(')')) {
    const inner = value.slice(prefix.length, -1);
    const commaIdx = inner.indexOf(',');
    if (commaIdx !== -1) {
      const light = inner.slice(0, commaIdx).trim();
      const dark = inner.slice(commaIdx + 1).trim();
      return mode === 'dark' ? dark : light;
    }
  }
  return value;
}

function buildTokenMap(
  rawTheme: {
    tokens: Record<string, string>;
    __inputTokens?: Partial<Record<string, TokenValue>>;
  } | null,
  mode: 'light' | 'dark',
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const [key, value] of Object.entries(xdsTokenDefaults)) {
    resolved[key] = resolveValue(value, mode);
  }
  for (const [key, value] of Object.entries(extraDefaults)) {
    resolved[key] = resolveValue(value, mode);
  }

  if (rawTheme?.__inputTokens) {
    for (const [key, value] of Object.entries(rawTheme.__inputTokens)) {
      if (value !== undefined) {
        resolved[key] = resolveValue(value, mode);
      }
    }
  } else if (rawTheme) {
    for (const [key, value] of Object.entries(rawTheme.tokens)) {
      resolved[key] = resolveValue(value, mode);
    }
  }

  return resolved;
}

export function useResolveTokenForMode(): (
  name: string,
  mode: 'light' | 'dark',
) => string {
  const ctx = useContext(ThemeContext);
  const rawTheme = ctx?.theme ?? null;

  const lightTokens = useMemo(
    () => buildTokenMap(rawTheme, 'light'),
    [rawTheme],
  );
  const darkTokens = useMemo(() => buildTokenMap(rawTheme, 'dark'), [rawTheme]);

  return (name: string, mode: 'light' | 'dark'): string => {
    return mode === 'dark'
      ? (darkTokens[name] ?? '')
      : (lightTokens[name] ?? '');
  };
}

export function hasDualMode(_theme: UseThemeReturn): boolean {
  return true;
}

export function getTokensByPrefix(
  theme: UseThemeReturn,
  prefix: string,
): string[] {
  const allKeys = new Set([
    ...Object.keys(theme.tokens),
    ...Object.keys(xdsTokenDefaults),
    ...Object.keys(extraDefaults),
  ]);
  return [...allKeys].filter(k => k.startsWith(prefix));
}
