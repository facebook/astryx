// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {expandColorScale} from './expandColorScale';
import {defineTheme} from './defineTheme';
import {generateThemeRules} from './generateThemeRules';
import {resolveThemeTokens} from './tokens';
import {colorDefaults} from './tokens.stylex';

/** Light-mode half of colorDefaults['--color-accent'] — the hue an accent-less config seeds from. */
const DEFAULT_ACCENT = '#0064E0';
const DEFAULT_ACCENT_DARK = '#2694FE';

/** The three tokens that only exist when a seed accent is supplied. */
const ACCENT_TOKENS = [
  '--color-accent',
  '--color-accent-muted',
  '--color-on-accent',
] as const;

describe('expandColorScale', () => {
  it('produces all expected token keys', () => {
    const tokens = expandColorScale({accent: '#0064E0'});
    const expectedKeys = [
      '--color-accent',
      '--color-accent-muted',
      '--color-on-accent',
      '--color-neutral',
      '--color-background-surface',
      '--color-background-body',
      '--color-overlay',
      '--color-overlay-hover',
      '--color-overlay-pressed',
      '--color-background-muted',
      '--color-text-primary',
      '--color-text-secondary',
      '--color-text-disabled',
      '--color-text-accent',
      '--color-icon-accent',
      '--color-icon-primary',
      '--color-icon-secondary',
      '--color-icon-disabled',
      '--color-background-card',
      '--color-background-popover',
      '--color-background-inverted',
      '--color-border',
      '--color-border-emphasized',
      '--color-skeleton',
      '--color-track',
      '--color-shadow',
      '--color-tint-hover',
    ];
    for (const key of expectedKeys) {
      expect(tokens).toHaveProperty(key);
    }
  });

  it('all values are strings', () => {
    const tokens = expandColorScale({accent: '#0064E0'});
    for (const value of Object.values(tokens)) {
      expect(typeof value).toBe('string');
    }
  });

  it('neutralStyle variants produce different --color-neutral values', () => {
    const warm = expandColorScale({accent: '#0064E0', neutralStyle: 'warm'});
    const cool = expandColorScale({accent: '#0064E0', neutralStyle: 'cool'});
    const neutral = expandColorScale({
      accent: '#0064E0',
      neutralStyle: 'neutral',
    });
    expect(warm['--color-neutral']).not.toBe(cool['--color-neutral']);
    expect(cool['--color-neutral']).not.toBe(neutral['--color-neutral']);
    expect(warm['--color-neutral']).not.toBe(neutral['--color-neutral']);
  });

  it('emits derived accent tokens as references to --color-accent', () => {
    const tokens = expandColorScale({accent: '#0064E0'});
    // Reference tokens follow a scoped --color-accent override at runtime.
    expect(tokens['--color-text-accent']).toBe('var(--color-accent)');
    expect(tokens['--color-icon-accent']).toBe('var(--color-accent)');
    expect(tokens['--color-accent-muted']).toBe(
      'light-dark(color-mix(in srgb, var(--color-accent) 20%, transparent), color-mix(in srgb, var(--color-accent) 25%, transparent))',
    );
    // The base token and the contrast-computed on-accent stay resolved.
    expect(tokens['--color-accent']).toMatch(/^light-dark\(#/);
    expect(tokens['--color-on-accent']).toMatch(/^light-dark\(#/);
  });

  it('contrast high produces different --color-text-primary than standard', () => {
    const standard = expandColorScale({
      accent: '#0064E0',
      contrast: 'standard',
    });
    const high = expandColorScale({accent: '#0064E0', contrast: 'high'});
    expect(high['--color-text-primary']).not.toBe(
      standard['--color-text-primary'],
    );
  });
});

describe('expandColorScale — neutral-only themes (#2279)', () => {
  it('accent is optional — a config without one expands', () => {
    const tokens = expandColorScale({neutralStyle: 'warm'});
    expect(tokens['--color-background-surface']).toMatch(/^light-dark\(#/);
  });

  it('expands an empty config', () => {
    const tokens = expandColorScale({});
    expect(tokens['--color-background-surface']).toMatch(/^light-dark\(#/);
    expect(tokens).not.toHaveProperty('--color-accent');
  });

  it('omits the accent tokens so they fall through to colorDefaults', () => {
    const tokens = expandColorScale({neutralStyle: 'warm'});
    for (const key of ACCENT_TOKENS) {
      expect(tokens).not.toHaveProperty(key);
    }
    // ...and the reference tokens still point at whatever --color-accent resolves to.
    expect(tokens['--color-text-accent']).toBe('var(--color-accent)');
    expect(tokens['--color-icon-accent']).toBe('var(--color-accent)');
  });

  it('seeds the neutral palettes from the light half of the default accent', () => {
    // Drift guard: the module's DEFAULT_ACCENT_SEED is private, so pin the
    // colorDefaults value it is copied from. Re-coloring the default accent
    // without re-seeding would silently change every neutral-only theme.
    expect(colorDefaults['--color-accent']).toBe(
      `light-dark(${DEFAULT_ACCENT}, ${DEFAULT_ACCENT_DARK})`,
    );

    const neutralOnly = expandColorScale({neutralStyle: 'warm'});
    const seeded = expandColorScale({
      accent: DEFAULT_ACCENT,
      neutralStyle: 'warm',
    });
    for (const [key, value] of Object.entries(seeded)) {
      if ((ACCENT_TOKENS as ReadonlyArray<string>).includes(key)) {
        continue;
      }
      expect(neutralOnly[key], key).toBe(value);
    }
  });

  it('honours neutralStyle and contrast without an accent', () => {
    const warm = expandColorScale({neutralStyle: 'warm'});
    const cool = expandColorScale({neutralStyle: 'cool'});
    expect(warm['--color-neutral']).not.toBe(cool['--color-neutral']);

    const high = expandColorScale({contrast: 'high'});
    const standard = expandColorScale({contrast: 'standard'});
    expect(high['--color-text-primary']).not.toBe(
      standard['--color-text-primary'],
    );
  });

  it('does not re-color themes that do pass an accent', () => {
    // Seeding from the default hex derives a DIFFERENT accent than the default
    // token holds, so "just default the seed" is not behavior-preserving —
    // omitting the tokens is the only way a neutral-only theme keeps the
    // default accent.
    const tokens = expandColorScale({accent: DEFAULT_ACCENT});
    expect(tokens['--color-accent']).toMatch(/^light-dark\(#/);
    expect(tokens['--color-accent']).not.toBe(colorDefaults['--color-accent']);
  });

  it('treats an empty accent as supplied, not absent', () => {
    // '' is falsy but not nullish. Only an absent accent is neutral-only; a
    // supplied-but-malformed one keeps its pre-#2279 behavior (the hex parser
    // falls back to black) rather than silently dropping the accent tokens.
    const tokens = expandColorScale({accent: ''});
    for (const key of ACCENT_TOKENS) {
      expect(tokens).toHaveProperty(key);
    }
  });
});

describe('expandColorScale + defineTheme integration', () => {
  it('explicit token overrides win over generated values', () => {
    const theme = defineTheme({
      name: 'test-override',
      color: {accent: '#0064E0'},
      tokens: {'--color-accent': 'red'},
    });
    expect(theme.tokens['--color-accent']).toBe('red');
  });

  it('generated theme CSS keeps the accent references (#3495)', () => {
    const theme = defineTheme({
      name: 'test-accent-refs',
      color: {accent: '#DC2626'},
    });
    const css = generateThemeRules(theme).join('\n');
    expect(css).toContain('--color-text-accent: var(--color-accent);');
    expect(css).toContain('--color-icon-accent: var(--color-accent);');
    expect(css).toContain(
      '--color-accent-muted: light-dark(color-mix(in srgb, var(--color-accent) 20%, transparent), color-mix(in srgb, var(--color-accent) 25%, transparent));',
    );
    // The base token itself stays a resolved color pair.
    expect(css).toMatch(/--color-accent: light-dark\(#/);
  });

  it('a neutral-only theme leaves the accent tokens at their defaults (#2279)', () => {
    const theme = defineTheme({
      name: 'test-neutral-only',
      color: {neutralStyle: 'warm'},
    });
    for (const key of ACCENT_TOKENS) {
      expect(theme.tokens).not.toHaveProperty(key);
    }
    // Neutrals are still themed.
    expect(theme.tokens['--color-background-surface']).toMatch(
      /^light-dark\(#/,
    );

    const css = generateThemeRules(theme).join('\n');
    expect(css).not.toContain('--color-accent:');
    expect(css).not.toContain('--color-on-accent:');
    expect(css).toContain('--color-background-surface:');
  });

  it('a neutral-only theme resolves accent tokens to the defaults at runtime (#2279)', () => {
    // The CSS side falls through by simply not emitting the tokens. The JS side
    // (useTheme/resolveThemeTokens) has to agree: the omitted tokens come back
    // from tokenDefaults, and the var() references the theme DOES emit resolve
    // against them instead of leaking a literal 'var(--color-accent)'.
    const theme = defineTheme({
      name: 'test-neutral-only-runtime',
      color: {neutralStyle: 'warm'},
    });

    const light = resolveThemeTokens(theme, {mode: 'light'});
    expect(light['--color-accent']).toBe(DEFAULT_ACCENT);
    expect(light['--color-text-accent']).toBe(DEFAULT_ACCENT);
    expect(light['--color-icon-accent']).toBe(DEFAULT_ACCENT);

    const dark = resolveThemeTokens(theme, {mode: 'dark'});
    expect(dark['--color-accent']).toBe(DEFAULT_ACCENT_DARK);
    expect(dark['--color-text-accent']).toBe(DEFAULT_ACCENT_DARK);
  });

  it('an explicit accent token still wins on a neutral-only theme (#2279)', () => {
    // Neutral scale from HCT + a hand-picked accent: the tokens map is the only
    // source of --color-accent, so the reference tokens follow it.
    const theme = defineTheme({
      name: 'test-neutral-only-explicit-accent',
      color: {neutralStyle: 'warm'},
      tokens: {'--color-accent': ['#AA0000', '#FF5555']},
    });
    expect(
      resolveThemeTokens(theme, {mode: 'light'})['--color-text-accent'],
    ).toBe('#AA0000');

    const css = generateThemeRules(theme).join('\n');
    expect(css).toContain('--color-text-accent: var(--color-accent);');
  });
});
