// Copyright (c) Meta Platforms, Inc. and affiliates.

import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {generateThemeCSS} from '@astryxdesign/core/theme';
import {butterTheme} from './butterTheme';

const source = readFileSync(
  new URL('./butterTheme.ts', import.meta.url),
  'utf8',
);

describe('butter touch + narrow type pin', () => {
  it('floors body to 16px and holds Display 1 at its desktop size', () => {
    const rule = butterTheme.__adaptationRules?.[0];

    expect(butterTheme.__adaptations.rules).toHaveLength(1);
    expect(rule?.when).toEqual({pointer: 'coarse', width: {below: 'lg'}});
    expect(rule?.query).toBe('(width < 1024px) and (pointer: coarse)');
    expect(rule?.tokens['--font-size-base']).toBe('1rem');
    expect(rule?.tokens['--font-size-lg']).toBe('1.25rem');
    expect(rule?.tokens['--font-size-5xl']).toBe('3.3125rem');
    expect(butterTheme.tokens['--font-size-base']).toBe('0.875rem');
    expect(butterTheme.tokens['--font-size-5xl']).toBe('3.3125rem');
    expect(generateThemeCSS(butterTheme).component).toContain(
      '@media (width < 1024px) and (pointer: coarse)',
    );
  });
});

describe('butter color token mapping completeness', () => {
  it('does not redefine the data-visualization color system', () => {
    expect(
      Object.keys(butterTheme.tokens).filter(name =>
        name.startsWith('--color-data-'),
      ),
    ).toEqual([]);
  });

  it('keeps every root color value concrete', () => {
    for (const [name, value] of Object.entries(butterTheme.tokens)) {
      if (!name.startsWith('--color-')) {
        continue;
      }
      expect(typeof value, name).toBe('string');
      expect(value, name).toMatch(
        /^(?:transparent|#[0-9a-f]{6}(?:[0-9a-f]{2})?|light-dark\(#[0-9a-f]{6}(?:[0-9a-f]{2})?, #[0-9a-f]{6}(?:[0-9a-f]{2})?\)|color-mix\(.+\)|var\(.+\))$/i,
      );
    }
  });

  it('uses no one-off color literals in the maintained theme source', () => {
    expect(source).not.toMatch(
      /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsl[a]?\(|\boklch\(|\bblack\b|\bwhite\b/i,
    );
  });
});
