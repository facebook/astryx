// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {generateThemeCSS, resolveThemeTokens} from '@astryxdesign/core/theme';
import {palette as stoneModePalettes} from './stonePalettes.generated';
import {stoneTheme} from './stoneTheme';

function channels(color: string): [number, number, number] {
  return [1, 3, 5].map(index =>
    Number.parseInt(color.slice(index, index + 2), 16),
  ) as [number, number, number];
}

function luminance(color: string): number {
  const [red, green, blue] = channels(color).map(channel => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function blend(foreground: string, background: string, alpha: number): string {
  const front = channels(foreground);
  const back = channels(background);
  return `#${front
    .map((channel, index) =>
      Math.round(channel * alpha + back[index] * (1 - alpha))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

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

describe('stone secondary ComplexSelector', () => {
  it('keeps the hover fill off a disabled trigger in either form', () => {
    expect(generateThemeCSS(stoneTheme).component).toMatch(
      /:hover:not\(:has\(> ?:is\(:disabled, ?\[aria-disabled="true"\]\)\)\)/,
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
      const ramp = stoneModePalettes.neutral[mode];

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
        const ramp = stoneModePalettes[family][mode];
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

  it('keeps light input rims and syntax attributes above their thresholds', () => {
    const {green, neutral, red, yellow} = stoneModePalettes;
    const surface = neutral.light[100];
    const syntaxBackground = neutral.light[95];
    const diffAlpha = 0x40 / 255;
    const addedRow = blend(green.light[90], syntaxBackground, diffAlpha);
    const removedRow = blend(red.light[90], syntaxBackground, diffAlpha);

    expect(contrast(green.light[55], surface)).toBeGreaterThanOrEqual(3);
    expect(contrast(yellow.light[55], surface)).toBeGreaterThanOrEqual(3);
    for (const background of [syntaxBackground, addedRow, removedRow]) {
      expect(contrast(yellow.light[40], background)).toBeGreaterThanOrEqual(
        4.5,
      );
    }

    expect(stoneTheme.components?.['text-input']?.['status:success']).toEqual({
      '--color-success': `light-dark(${green.light[55]}, ${green.dark[70]})`,
    });
    expect(stoneTheme.components?.['text-input']?.['status:warning']).toEqual({
      '--color-warning': `light-dark(${yellow.light[55]}, ${yellow.dark[70]})`,
    });
  });
});
