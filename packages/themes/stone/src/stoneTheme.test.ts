// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {generateThemeCSS, resolveThemeTokens} from '@astryxdesign/core/theme';
import {stonePalettes} from './stonePalettes';
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

const categoricalFamilies = [
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
] as const;

describe('stone palette mapping', () => {
  it.each(['light', 'dark'] as const)(
    'resolves the neutral surface ladder from reviewed %s stops',
    mode => {
      const tokens = resolveThemeTokens(stoneTheme, {mode});
      const ramp = stonePalettes.neutral[mode];

      expect(tokens['--color-background-body']).toBe(
        ramp[mode === 'light' ? 95 : 5],
      );
      expect(tokens['--color-background-surface']).toBe(
        ramp[mode === 'light' ? 100 : 10],
      );
      expect(tokens['--color-background-card']).toBe(
        ramp[mode === 'light' ? 100 : 15],
      );
      expect(tokens['--color-background-popover']).toBe(
        ramp[mode === 'light' ? 100 : 20],
      );
      expect(tokens['--color-text-primary']).toBe(
        ramp[mode === 'light' ? 15 : 95],
      );
      expect(tokens['--color-text-secondary']).toBe(
        ramp[mode === 'light' ? 40 : 70],
      );
    },
  );

  it.each(['light', 'dark'] as const)(
    'keeps every categorical %s role on the same four-stop pattern',
    mode => {
      const tokens = resolveThemeTokens(stoneTheme, {mode});
      for (const family of categoricalFamilies) {
        const ramp = stonePalettes[family][mode];
        expect(tokens[`--color-background-${family}`]).toBe(
          ramp[mode === 'light' ? 90 : 35],
        );
        expect(tokens[`--color-border-${family}`]).toBe(
          ramp[mode === 'light' ? 85 : 25],
        );
        expect(tokens[`--color-icon-${family}`]).toBe(
          ramp[mode === 'light' ? 30 : 90],
        );
        expect(tokens[`--color-text-${family}`]).toBe(
          ramp[mode === 'light' ? 30 : 90],
        );
      }
    },
  );
});
