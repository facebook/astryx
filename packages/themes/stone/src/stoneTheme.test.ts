// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {generateThemeCSS} from '@astryxdesign/core/theme';
import {stoneTheme} from './stoneTheme';

describe('stone touch + narrow type pin', () => {
  it('floors body to 16px and holds Display 1 at its desktop size', () => {
    const rule = stoneTheme.__adaptationRules?.[0];

    expect(stoneTheme.__adaptations.rules).toHaveLength(1);
    expect(rule?.when).toEqual({pointer: 'coarse', width: {below: 'lg'}});
    expect(rule?.query).toBe('(width < 1024px) and (pointer: coarse)');
    // Pinned ladder: base 16 (was 14), ratio 1.25 -> 1.2225, Display 1 pinned.
    expect(rule?.tokens['--font-size-base']).toBe('1rem');
    expect(rule?.tokens['--font-size-lg']).toBe('1.25rem');
    expect(rule?.tokens['--font-size-5xl']).toBe('3.3125rem');
    // Desktop scale is untouched.
    expect(stoneTheme.tokens['--font-size-base']).toBe('0.875rem');
    expect(stoneTheme.tokens['--font-size-5xl']).toBe('3.3125rem');
    expect(generateThemeCSS(stoneTheme).component).toContain(
      '@media (width < 1024px) and (pointer: coarse)',
    );
  });
});

describe('stone input status roles', () => {
  it('keeps soft per-input status rims on the foreground roles', () => {
    const inputs = [
      'text-input',
      'text-area',
      'number-input',
      'date-input',
      'time-input',
      'selector',
      'multi-selector',
      'typeahead',
      'tokenizer',
    ];

    for (const input of inputs) {
      const component = stoneTheme.components![input];
      expect(component['status:success']).toMatchObject({
        '--color-status-foreground-success': 'light-dark(#7f977e, #99b298)',
      });
      expect(component['status:warning']).toMatchObject({
        '--color-status-foreground-warning': 'light-dark(#9f8f68, #bbaa81)',
      });
      expect(component['status:error']).toMatchObject({
        '--color-status-foreground-error': 'light-dark(#a58b86, #c0a5a1)',
      });
    }
  });
});

describe('stone secondary ComplexSelector', () => {
  it('keeps the hover fill off a disabled trigger in either form', () => {
    expect(generateThemeCSS(stoneTheme).component).toMatch(
      /:hover:not\(:has\(> ?:is\(:disabled, ?\[aria-disabled="true"\]\)\)\)/,
    );
  });
});
