// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it, vi} from 'vitest';
import {defineSyntaxTheme, REQUIRED_SYNTAX_KEYS} from './defineSyntaxTheme';
import {syntaxTokenDefaults} from './tokens';
import {dracula} from './presets';

const base = Object.fromEntries(
  REQUIRED_SYNTAX_KEYS.map(key => [key, '#123456']),
) as Parameters<typeof defineSyntaxTheme>[0]['tokens'];

describe('diff row slots in a syntax theme', () => {
  it('are optional: a theme that sets none keeps the semantic defaults', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const theme = defineSyntaxTheme({name: 't', tokens: base});
    expect(warn).not.toHaveBeenCalled();
    expect(theme.tokens.added).toBe(
      syntaxTokenDefaults['--color-syntax-added'],
    );
    expect(theme.tokens.removed).toBe(
      syntaxTokenDefaults['--color-syntax-removed'],
    );
    expect(theme.tokens['diff-header']).toBe(
      syntaxTokenDefaults['--color-syntax-diff-header'],
    );
    // A theme that sets no marker colour keeps its own line-number colour.
    expect(theme.tokens['added-marker']).toBe(
      'var(--color-syntax-punctuation)',
    );
    expect(theme.tokens['removed-marker']).toBe(
      'var(--color-syntax-punctuation)',
    );
    warn.mockRestore();
  });

  it('may be overridden to harmonize with the theme', () => {
    const theme = defineSyntaxTheme({
      name: 't',
      tokens: {...base, added: ['#e6ffed', '#1b3a24'], removed: '#ffeef0'},
    });
    expect(theme.tokens.added).toBe('light-dark(#e6ffed, #1b3a24)');
    expect(theme.tokens.removed).toBe('#ffeef0');
    expect(theme.tokens['diff-header']).toBe(
      syntaxTokenDefaults['--color-syntax-diff-header'],
    );
  });

  it('leaves the shipped presets valid without them: row paints default, markers follow punctuation', () => {
    expect(dracula.tokens.added).toBe(
      syntaxTokenDefaults['--color-syntax-added'],
    );
    expect(dracula.tokens['added-marker']).toBe(
      'var(--color-syntax-punctuation)',
    );
    expect(dracula.tokens['removed-marker']).toBe(
      'var(--color-syntax-punctuation)',
    );
  });

  it('defaults derive from the semantic tokens, never a literal colour', () => {
    expect(syntaxTokenDefaults['--color-syntax-added']).toBe(
      'color-mix(in srgb, var(--color-success-muted) 25%, transparent)',
    );
    expect(syntaxTokenDefaults['--color-syntax-removed']).toBe(
      'color-mix(in srgb, var(--color-error-muted) 25%, transparent)',
    );
    expect(syntaxTokenDefaults['--color-syntax-diff-header']).toBe(
      'var(--color-background-muted)',
    );
    expect(syntaxTokenDefaults['--color-syntax-added-marker']).toBe(
      'var(--color-text-green)',
    );
    expect(syntaxTokenDefaults['--color-syntax-removed-marker']).toBe(
      'var(--color-text-red)',
    );
  });
});
