// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {defineTheme} from './defineTheme';
import {
  resolveThemeToken,
  resolveThemeTokens,
  tokenVar,
  tokenVars,
} from './tokens';

const testTheme = defineTheme({
  name: 'test',
  tokens: {
    '--color-accent': ['#AA0000', '#FF5555'],
    '--color-neutral': ['rgba(5, 54, 89, 0.1)', 'rgba(223, 226, 229, 0.2)'],
    '--spacing-4': '20px',
  },
});

describe('tokenVar', () => {
  it('returns a CSS var() reference for known token names', () => {
    expect(tokenVar('--color-text-primary')).toBe('var(--color-text-primary)');
  });

  it('returns a CSS var() reference for custom token names', () => {
    expect(tokenVar('--app-custom-token')).toBe('var(--app-custom-token)');
  });
});

describe('tokenVars', () => {
  it('contains var() references for known tokens', () => {
    expect(tokenVars['--color-text-primary']).toBe('var(--color-text-primary)');
    expect(tokenVars['--spacing-4']).toBe('var(--spacing-4)');
  });
});

describe('resolveThemeTokens', () => {
  it('resolves defaults when no theme is provided', () => {
    const tokens = resolveThemeTokens(null, {mode: 'light'});
    expect(tokens['--color-text-primary']).toBe('#0A1317');
    expect(tokens['--spacing-1']).toBe('4px');
  });

  it('resolves tuple overrides using original input tokens', () => {
    const light = resolveThemeTokens(testTheme, {mode: 'light'});
    const dark = resolveThemeTokens(testTheme, {mode: 'dark'});

    expect(light['--color-accent']).toBe('#AA0000');
    expect(dark['--color-accent']).toBe('#FF5555');
  });

  it('resolves tuple overrides with nested comma values', () => {
    const light = resolveThemeTokens(testTheme, {mode: 'light'});
    const dark = resolveThemeTokens(testTheme, {mode: 'dark'});

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

    const light = resolveThemeTokens(builtTheme, {mode: 'light'});
    const dark = resolveThemeTokens(builtTheme, {mode: 'dark'});

    expect(light['--color-neutral']).toBe('rgba(5, 54, 89, 0.1)');
    expect(dark['--color-neutral']).toBe('rgba(223, 226, 229, 0.2)');
  });

  it('resolves single-value overrides unchanged', () => {
    const tokens = resolveThemeTokens(testTheme, {mode: 'light'});
    expect(tokens['--spacing-4']).toBe('20px');
  });
});

describe('resolveThemeToken', () => {
  it('resolves one token', () => {
    expect(resolveThemeToken(testTheme, '--color-accent', {mode: 'dark'})).toBe(
      '#FF5555',
    );
  });

  it('returns fallback for unknown token names', () => {
    expect(
      resolveThemeToken(testTheme, '--missing-token', {
        mode: 'dark',
        fallback: 'fallback',
      }),
    ).toBe('fallback');
  });

  it('returns empty string for unknown token names without fallback', () => {
    expect(
      resolveThemeToken(testTheme, '--missing-token', {mode: 'dark'}),
    ).toBe('');
  });
});

describe('resolveThemeTokens — reference resolution', () => {
  it('resolves a token that references another token to a raw value', () => {
    const theme = defineTheme({
      name: 'ref',
      tokens: {
        '--color-accent': ['#0058D2', '#BBC2FF'],
        '--color-text-accent': 'var(--color-accent)',
      },
    });

    const light = resolveThemeTokens(theme, {mode: 'light'});
    const dark = resolveThemeTokens(theme, {mode: 'dark'});

    expect(light['--color-text-accent']).toBe('#0058D2');
    expect(dark['--color-text-accent']).toBe('#BBC2FF');
  });

  it('resolves reference chains iteratively', () => {
    const theme = defineTheme({
      name: 'chain',
      tokens: {
        '--color-accent': ['#112233', '#445566'],
        '--color-icon-accent': 'var(--color-accent)',
        '--color-text-accent': 'var(--color-icon-accent)',
      },
    });

    const light = resolveThemeTokens(theme, {mode: 'light'});
    expect(light['--color-icon-accent']).toBe('#112233');
    expect(light['--color-text-accent']).toBe('#112233');
  });

  it('uses the var() fallback when the referenced token is unknown', () => {
    const theme = defineTheme({
      name: 'fallback',
      tokens: {
        '--color-text-accent': 'var(--not-a-token, #ABCDEF)',
      },
    });

    const tokens = resolveThemeTokens(theme, {mode: 'light'});
    expect(tokens['--color-text-accent']).toBe('#ABCDEF');
  });

  it('leaves an unresolvable reference as a literal var()', () => {
    const theme = defineTheme({
      name: 'unresolvable',
      tokens: {
        '--color-text-accent': 'var(--not-a-token)',
      },
    });

    const tokens = resolveThemeTokens(theme, {mode: 'light'});
    expect(tokens['--color-text-accent']).toBe('var(--not-a-token)');
  });

  it('does not loop forever on a reference cycle', () => {
    const theme = defineTheme({
      name: 'cycle',
      tokens: {
        '--color-text-accent': 'var(--color-icon-accent)',
        '--color-icon-accent': 'var(--color-text-accent)',
      },
    });

    const tokens = resolveThemeTokens(theme, {mode: 'light'});
    // The cycle collapses to a literal reference rather than hanging.
    expect(tokens['--color-text-accent']).toContain('var(');
    expect(tokens['--color-icon-accent']).toContain('var(');
  });
});

describe('resolveThemeTokens — CSS color functions', () => {
  it('evaluates color-mix with transparent to an rgba() value', () => {
    const theme = defineTheme({
      name: 'mix',
      tokens: {
        '--color-accent': ['#0058D2', '#BBC2FF'],
        '--color-accent-muted':
          'color-mix(in srgb, var(--color-accent) 20%, transparent)',
      },
    });

    const light = resolveThemeTokens(theme, {mode: 'light'});
    const dark = resolveThemeTokens(theme, {mode: 'dark'});

    expect(light['--color-accent-muted']).toBe('rgba(0, 88, 210, 0.2)');
    expect(dark['--color-accent-muted']).toBe('rgba(187, 194, 255, 0.2)');
  });

  it('resolves the muted token inside a light-dark() tuple per mode', () => {
    const theme = defineTheme({
      name: 'ld-mix',
      tokens: {
        '--color-accent': ['#FF0000', '#00FF00'],
        '--color-accent-muted': [
          'color-mix(in srgb, var(--color-accent) 20%, transparent)',
          'color-mix(in srgb, var(--color-accent) 25%, transparent)',
        ],
      },
    });

    const light = resolveThemeTokens(theme, {mode: 'light'});
    const dark = resolveThemeTokens(theme, {mode: 'dark'});

    expect(light['--color-accent-muted']).toBe('rgba(255, 0, 0, 0.2)');
    expect(dark['--color-accent-muted']).toBe('rgba(0, 255, 0, 0.25)');
  });

  it('mixes two opaque colors by weight', () => {
    const theme = defineTheme({
      name: 'two-color',
      tokens: {
        '--color-neutral': 'color-mix(in srgb, #000000, #FFFFFF)',
      },
    });

    const tokens = resolveThemeTokens(theme, {mode: 'light'});
    expect(tokens['--color-neutral']).toBe('#808080');
  });

  it('mixes two opaque colors with an explicit percentage', () => {
    const theme = defineTheme({
      name: 'weighted',
      tokens: {
        '--color-neutral': 'color-mix(in srgb, #000000 25%, #FFFFFF)',
      },
    });

    const tokens = resolveThemeTokens(theme, {mode: 'light'});
    expect(tokens['--color-neutral']).toBe('#BFBFBF');
  });

  it('preserves an unsupported color space rather than guessing', () => {
    const theme = defineTheme({
      name: 'oklab',
      tokens: {
        '--color-accent': ['#0058D2', '#BBC2FF'],
        '--color-neutral':
          'color-mix(in oklab, var(--color-accent), black 15%)',
      },
    });

    const tokens = resolveThemeTokens(theme, {mode: 'light'});
    // var() still resolves; the unsupported mix stays as a color-mix() expression.
    expect(tokens['--color-neutral']).toContain('color-mix(in oklab');
    expect(tokens['--color-neutral']).toContain('#0058D2');
  });
});

describe('resolveThemeTokens — generated themes end to end', () => {
  it('resolves derived accent tokens from defineTheme({color}) to raw values', () => {
    const theme = defineTheme({name: 'brand', color: {accent: '#0064E0'}});

    const light = resolveThemeTokens(theme, {mode: 'light'});
    const dark = resolveThemeTokens(theme, {mode: 'dark'});

    const isConcreteColor = (value: string): boolean => /^(#|rgb)/.test(value);

    for (const key of [
      '--color-accent',
      '--color-text-accent',
      '--color-icon-accent',
      '--color-accent-muted',
    ]) {
      expect(isConcreteColor(light[key])).toBe(true);
      expect(isConcreteColor(dark[key])).toBe(true);
      expect(light[key]).not.toContain('var(');
      expect(light[key]).not.toContain('color-mix');
    }

    // The derived accent tokens resolve to the base accent.
    expect(light['--color-text-accent']).toBe(light['--color-accent']);
    expect(light['--color-icon-accent']).toBe(light['--color-accent']);
  });
});
