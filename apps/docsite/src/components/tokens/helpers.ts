import type {UseXDSThemeReturn} from '@xds/core/theme';
import {borderDefaults} from '@xds/core/theme';

const extraDefaults: Record<string, string> = {
  ...borderDefaults,
};

export function resolveToken(theme: UseXDSThemeReturn, name: string): string {
  return theme.token(name) || extraDefaults[name] || '';
}

export function resolveTokenForMode(
  theme: UseXDSThemeReturn,
  name: string,
  _mode: 'light' | 'dark',
): string {
  return theme.token(name) || extraDefaults[name] || '';
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
    ...Object.keys(extraDefaults),
  ]);
  return [...allKeys].filter(k => k.startsWith(prefix));
}
