import {useContext} from 'react';
import type {UseXDSThemeReturn} from '@xds/core/theme';
import {
  borderDefaults,
  XDSThemeContext,
  xdsTokenDefaults,
} from '@xds/core/theme';

const extraDefaults: Record<string, string> = {
  ...borderDefaults,
};

export function resolveToken(theme: UseXDSThemeReturn, name: string): string {
  return theme.token(name) || extraDefaults[name] || '';
}

function parseLightDark(
  value: string | [string, string],
  mode: 'light' | 'dark',
): string {
  if (Array.isArray(value)) {
    return mode === 'dark' ? value[1] : value[0];
  }
  const match = value.match(/^light-dark\(([^,]+),\s*([^)]+)\)$/);
  if (match) {
    return mode === 'dark' ? match[2].trim() : match[1].trim();
  }
  return value;
}

export function useResolveTokenForMode(): (
  name: string,
  mode: 'light' | 'dark',
) => string {
  const ctx = useContext(XDSThemeContext);
  const rawTheme = ctx?.theme ?? null;

  return (name: string, mode: 'light' | 'dark'): string => {
    if (rawTheme?.__inputTokens?.[name] != null) {
      return parseLightDark(
        rawTheme.__inputTokens[name] as string | [string, string],
        mode,
      );
    }
    const raw =
      rawTheme?.tokens[name] ??
      xdsTokenDefaults[name] ??
      extraDefaults[name] ??
      '';
    return parseLightDark(raw, mode);
  };
}

export function hasDualMode(_theme: UseXDSThemeReturn): boolean {
  return true;
}

export function getTokensByPrefix(
  theme: UseXDSThemeReturn,
  prefix: string,
): string[] {
  const allKeys = new Set([
    ...Object.keys(theme.tokens),
    ...Object.keys(xdsTokenDefaults),
    ...Object.keys(extraDefaults),
  ]);
  return [...allKeys].filter(k => k.startsWith(prefix));
}
