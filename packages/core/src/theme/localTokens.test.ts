// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file localTokens.test.ts
 * @input Public defineTheme local-token enrollment and references
 * @output Prefix-independent ownership with exact, case-sensitive local edges
 * @position Focused AST-034 FR16–FR18 contract tests
 */

import {describe, expect, it} from 'vitest';
import {defineTheme} from './defineTheme';

describe('theme-local custom-property ownership', () => {
  it('accepts an owner-chosen valid custom-property name without changing it', () => {
    const theme = defineTheme({
      name: 'ocean',
      localTokens: {'--demo-selection-ink': ['#073b4c', '#d8f3ff']},
      components: {
        button: {
          base: {color: 'var(--demo-selection-ink)'},
        },
      },
    });

    expect(theme.localTokens).toEqual({
      '--demo-selection-ink': 'light-dark(#073b4c, #d8f3ff)',
    });
    expect(theme.__localTokenOwners).toEqual({
      '--demo-selection-ink': 'ocean',
    });
    expect(theme.__localTokenLineage).toEqual(['ocean']);
  });

  it('treats exact references as owned edges while case-only and unrelated references stay external', () => {
    expect(() =>
      defineTheme({
        name: 'ocean',
        localTokens: {
          '--demo-a': 'var(--demo-b)',
          '--demo-b': 'var(--demo-a)',
        },
      }),
    ).toThrow(/cycle detected/);

    expect(() =>
      defineTheme({
        name: 'ocean',
        localTokens: {'--Demo-Ink': '#073b4c'},
        components: {
          button: {
            base: {
              ':hover': {
                color: 'var(--demo-ink)',
                backgroundColor: 'var(--product-surface)',
              },
            },
          },
        },
        onDark: {
          components: {
            badge: {base: {color: 'var(--DEMO-INK)'}},
          },
        },
      }),
    ).not.toThrow();
  });

  it.each([
    ['missing custom-property prefix', 'demo-selection-ink'],
    ['empty custom-property name', '--'],
    ['unescaped whitespace', '--demo ink'],
    ['newline', '--demo\nink'],
  ])('rejects %s', (_label, name) => {
    expect(() =>
      defineTheme({
        name: 'ocean',
        localTokens: {[name]: '#073b4c'},
      }),
    ).toThrow(/valid CSS custom-property name/);
  });

  it('rejects a portable token even when the theme does not override it', () => {
    expect(() =>
      defineTheme({
        name: 'ocean',
        localTokens: {'--color-accent': '#073b4c'},
      }),
    ).toThrow(/cannot be declared in both tokens and localTokens/);
  });

  it('keeps existing long names byte-for-byte compatible', () => {
    const name = '--astryx-theme-ocean-color-status-fill-accent';
    const theme = defineTheme({
      name: 'ocean',
      localTokens: {[name]: '#073b4c'},
    });

    expect(theme.localTokens).toEqual({[name]: '#073b4c'});
    expect(theme.__localTokenOwners).toEqual({[name]: 'ocean'});
  });
});
