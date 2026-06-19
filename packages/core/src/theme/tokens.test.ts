// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {defineTheme} from './defineTheme';
import {
  resolveXDSThemeToken,
  resolveXDSThemeTokens,
  xdsTokenVar,
  xdsTokenVars,
} from './tokens';

const testTheme = defineTheme({
  name: 'test',
  tokens: {
    '--color-accent': ['#AA0000', '#FF5555'],
    '--color-neutral': ['rgba(5, 54, 89, 0.1)', 'rgba(223, 226, 229, 0.2)'],
    '--spacing-4': '20px',
  },
});

describe('xdsTokenVar', () => {
  it('returns a CSS var() reference for known token names', () => {
    expect(xdsTokenVar('--color-text-primary')).toBe(
      'var(--color-text-primary)',
    );
  });

  it('returns a CSS var() reference for custom token names', () => {
    expect(xdsTokenVar('--app-custom-token')).toBe('var(--app-custom-token)');
  });
});

describe('xdsTokenVars', () => {
  it('contains var() references for known tokens', () => {
    expect(xdsTokenVars['--color-text-primary']).toBe(
      'var(--color-text-primary)',
    );
    expect(xdsTokenVars['--spacing-4']).toBe('var(--spacing-4)');
  });
});

describe('resolveXDSThemeTokens', () => {
  it('resolves defaults when no theme is provided', () => {
    const tokens = resolveXDSThemeTokens(null, {mode: 'light'});
    expect(tokens['--color-text-primary']).toBe('#0A1317');
    expect(tokens['--spacing-1']).toBe('4px');
  });

  it('resolves tuple overrides using original input tokens', () => {
    const light = resolveXDSThemeTokens(testTheme, {mode: 'light'});
    const dark = resolveXDSThemeTokens(testTheme, {mode: 'dark'});

    expect(light['--color-accent']).toBe('#AA0000');
    expect(dark['--color-accent']).toBe('#FF5555');
  });

  it('resolves tuple overrides with nested comma values', () => {
    const light = resolveXDSThemeTokens(testTheme, {mode: 'light'});
    const dark = resolveXDSThemeTokens(testTheme, {mode: 'dark'});

    expect(light['--color-neutral']).toBe('rgba(5, 54, 89, 0.1)');
    expect(dark['--color-neutral']).toBe('rgba(223, 226, 229, 0.2)');
  });

  it('resolves built theme light-dark() strings without __inputTokens', () => {
    const builtTheme = {
      name: 'built',
      __built: true,
      tokens: {
        '--color-neutral':
          'light-dark(rgba(5, 54, 89, 0.1), rgba(223, 226, 229, 0.2))',
      },
    } as const;

    const light = resolveXDSThemeTokens(builtTheme, {mode: 'light'});
    const dark = resolveXDSThemeTokens(builtTheme, {mode: 'dark'});

    expect(light['--color-neutral']).toBe('rgba(5, 54, 89, 0.1)');
    expect(dark['--color-neutral']).toBe('rgba(223, 226, 229, 0.2)');
  });

  it('resolves single-value overrides unchanged', () => {
    const tokens = resolveXDSThemeTokens(testTheme, {mode: 'light'});
    expect(tokens['--spacing-4']).toBe('20px');
  });
});

describe('resolveXDSThemeToken', () => {
  it('resolves one token', () => {
    expect(
      resolveXDSThemeToken(testTheme, '--color-accent', {mode: 'dark'}),
    ).toBe('#FF5555');
  });

  it('returns fallback for unknown token names', () => {
    expect(
      resolveXDSThemeToken(testTheme, '--missing-token', {
        mode: 'dark',
        fallback: 'fallback',
      }),
    ).toBe('fallback');
  });

  it('returns empty string for unknown token names without fallback', () => {
    expect(
      resolveXDSThemeToken(testTheme, '--missing-token', {mode: 'dark'}),
    ).toBe('');
  });
});
