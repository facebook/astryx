// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Unit tests for the contrast-pair helpers (#5014).
 *
 * These pin the two judgements the module makes: what a ratio is, and — the
 * load-bearing one — WHICH pairs it is entitled to an opinion about. A check
 * that fires on themes doing nothing wrong gets muted, so the silence cases
 * here matter as much as the catch.
 *
 * `resolveThemeTokens` is injected, so these run without core built: a stub
 * that returns the token map per mode is the whole contract.
 */

import {describe, it, expect} from 'vitest';
import {
  contrastRatio,
  collectContrastFailures,
  formatContrastFailure,
} from './contrast-warning.mjs';

/**
 * Build a theme-shaped object plus a resolver over per-mode token maps.
 * @param {{authored: string[], light: Record<string, string>, dark?: Record<string, string>}} spec
 */
function themeWith({authored, light, dark}) {
  const theme = {
    tokens: light,
    __inputTokens: Object.fromEntries(authored.map(t => [t, light[t]])),
  };
  const resolve = (_t, {mode}) => (mode === 'dark' ? (dark ?? light) : light);
  return {theme, resolve};
}

describe('contrastRatio', () => {
  it('measures the canonical extremes', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBe(21);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBe(1);
  });

  it('agrees with the known default error pair', () => {
    // The dark default that fails AA (#5019) — the number this check exists
    // to be trusted about.
    expect(contrastRatio('#FFFFFF', '#F5394F')).toBe(3.76);
    expect(contrastRatio('#FFFFFF', '#E3193B')).toBe(4.7);
  });

  it('reads shorthand hex, rgb(), and rgba()', () => {
    expect(contrastRatio('#fff', '#000')).toBe(21);
    expect(contrastRatio('rgb(255, 255, 255)', 'rgb(0,0,0)')).toBe(21);
    expect(contrastRatio('rgba(255, 255, 255, 1)', '#000')).toBe(21);
  });

  it('composites a translucent foreground over its background', () => {
    // 50% black over white is mid grey, not black.
    const ratio = contrastRatio('rgba(0, 0, 0, 0.5)', '#FFFFFF');
    expect(ratio).toBeGreaterThan(3);
    expect(ratio).toBeLessThan(6);
  });

  it('abstains rather than guessing', () => {
    // A guessed ratio is worse than none: these cannot be resolved to sRGB
    // here, and a wrong number would be quoted as fact in a warning.
    expect(contrastRatio('color-mix(in srgb, red, blue)', '#FFF')).toBeNull();
    expect(contrastRatio('var(--color-accent)', '#FFF')).toBeNull();
    expect(contrastRatio('#FFF', undefined)).toBeNull();
    // A translucent BACKGROUND needs the surface under it, which depends on
    // where the component sits.
    expect(contrastRatio('#FFF', 'rgba(0,0,0,0.2)')).toBeNull();
  });
});

describe('collectContrastFailures', () => {
  it('catches the one-sided override — the bug this exists for', () => {
    // Authored a dark accent, kept the on-accent generated for the old one.
    const {theme, resolve} = themeWith({
      authored: ['--color-accent'],
      light: {'--color-accent': '#0064E0', '--color-on-accent': '#FFFFFF'},
      dark: {'--color-accent': '#1E6FE0', '--color-on-accent': '#002D80'},
    });

    const findings = collectContrastFailures(theme, resolve);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      fg: '--color-on-accent',
      bg: '--color-accent',
      mode: 'dark',
      min: 4.5,
      authored: ['--color-accent'],
      inherited: ['--color-on-accent'],
    });
    expect(findings[0].ratio).toBeLessThan(4.5);
  });

  it('says nothing when the theme authored BOTH sides', () => {
    // Nothing was silently voided — the author chose the pair. Firing here
    // would warn on all seven shipped themes; see the SCOPE note in the module.
    const {theme, resolve} = themeWith({
      authored: ['--color-accent', '--color-on-accent'],
      light: {'--color-accent': '#7FC9B8', '--color-on-accent': '#FFFFFF'},
    });

    expect(collectContrastFailures(theme, resolve)).toEqual([]);
  });

  it('says nothing when the theme authored NEITHER side', () => {
    // The defaults' own failures are the defaults' to fix (#5019).
    const {theme, resolve} = themeWith({
      authored: ['--radius-element'],
      light: {
        '--radius-element': '4px',
        '--color-accent': '#7FC9B8',
        '--color-on-accent': '#FFFFFF',
      },
    });

    expect(collectContrastFailures(theme, resolve)).toEqual([]);
  });

  it('reports a failing pair in each mode it fails in', () => {
    const {theme, resolve} = themeWith({
      authored: ['--color-error'],
      light: {'--color-error': '#FF6B6B', '--color-on-error': '#FFFFFF'},
      dark: {'--color-error': '#FF8888', '--color-on-error': '#FFFFFF'},
    });

    const modes = collectContrastFailures(theme, resolve).map(f => f.mode);

    expect(modes).toEqual(['light', 'dark']);
  });

  it('holds non-text pairs to 3:1, not 4.5:1', () => {
    // A control boundary at 3.5:1 is compliant (WCAG 1.4.11) and must not warn.
    const {theme, resolve} = themeWith({
      authored: ['--color-border-emphasized'],
      light: {
        '--color-border-emphasized': '#949494',
        '--color-background-surface': '#FFFFFF',
      },
    });

    expect(collectContrastFailures(theme, resolve)).toEqual([]);
  });

  it('stays silent on a theme with no hand-written tokens at all', () => {
    const resolve = () => ({'--color-accent': '#7FC9B8', '--color-on-accent': '#FFF'});

    expect(collectContrastFailures({tokens: {}}, resolve)).toEqual([]);
    expect(collectContrastFailures({}, resolve)).toEqual([]);
  });

  it('does not crash on a theme shape the resolver rejects', () => {
    const theme = {__inputTokens: {'--color-accent': '#000'}};
    const resolve = () => {
      throw new Error('not a theme');
    };

    expect(collectContrastFailures(theme, resolve)).toEqual([]);
  });
});

describe('formatContrastFailure', () => {
  it('names the forgotten token, not just the number', () => {
    const message = formatContrastFailure({
      fg: '--color-on-accent',
      bg: '--color-accent',
      mode: 'dark',
      ratio: 2.61,
      min: 4.5,
      what: 'label on the accent fill',
      authored: ['--color-accent'],
      inherited: ['--color-on-accent'],
    });

    expect(message).toContain('2.61:1 in dark mode');
    expect(message).toContain('below 4.5:1');
    expect(message).toContain('you set --color-accent');
    expect(message).toContain('left --color-on-accent');
  });
});
