// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wcag.test.ts
 * @input The color math in wcag.ts
 * @output Edge-case coverage for the WCAG audit's parsing/compositing/ratio math
 * @position Guards the harness that gates CI for every theme (issue #3654)
 */

import {describe, expect, it} from 'vitest';

import {
  composite,
  contrastRatio,
  flattenBackground,
  parseColor,
  relativeLuminance,
  resolveColor,
  splitTopLevelComma,
  toHex,
} from './wcag';

describe('parseColor', () => {
  it('parses 3/4/6/8-digit hex', () => {
    expect(parseColor('#fff')).toEqual({r: 255, g: 255, b: 255, a: 1});
    expect(parseColor('#f008')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 136 / 255,
    });
    expect(parseColor('#0A1317')).toEqual({r: 10, g: 19, b: 23, a: 1});
    expect(parseColor('#0000000F')).toEqual({r: 0, g: 0, b: 0, a: 15 / 255});
  });

  it('rejects malformed hex', () => {
    expect(parseColor('#12345')).toBeNull();
    expect(parseColor('#1234567')).toBeNull();
    expect(parseColor('#ggg')).toBeNull();
    expect(parseColor('#')).toBeNull();
  });

  it('parses rgb()/rgba() in comma and space syntax', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({r: 255, g: 0, b: 0, a: 1});
    expect(parseColor('rgba(5, 54, 89, 0.1)')).toEqual({
      r: 5,
      g: 54,
      b: 89,
      a: 0.1,
    });
    expect(parseColor('rgb(255 0 0 / 50%)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    });
    expect(parseColor('rgb(100%, 0%, 50%)')).toEqual({
      r: 255,
      g: 0,
      b: 127.5,
      a: 1,
    });
  });

  it('clamps out-of-range rgb()/rgba() values like CSS does', () => {
    expect(parseColor('rgb(300, -20, 0)')).toEqual({r: 255, g: 0, b: 0, a: 1});
    expect(parseColor('rgba(0, 0, 0, 4)')).toEqual({r: 0, g: 0, b: 0, a: 1});
    expect(parseColor('rgba(0, 0, 0, -1)')).toEqual({r: 0, g: 0, b: 0, a: 0});
  });

  it('rejects rgb() with missing or non-numeric channels', () => {
    expect(parseColor('rgb(1, 2)')).toBeNull();
    expect(parseColor('rgb(a, b, c)')).toBeNull();
  });

  it('handles keywords case-insensitively and returns fresh objects', () => {
    expect(parseColor('WHITE')).toEqual({r: 255, g: 255, b: 255, a: 1});
    expect(parseColor('transparent')?.a).toBe(0);
    const first = parseColor('black')!;
    first.r = 99;
    expect(parseColor('black')!.r).toBe(0);
  });

  it('returns null for unsupported color spaces instead of guessing', () => {
    expect(parseColor('oklch(0.5 0.1 200)')).toBeNull();
    expect(parseColor('color-mix(in srgb, red, blue)')).toBeNull();
    expect(parseColor('')).toBeNull();
  });
});

describe('composite', () => {
  it('is identity for opaque foregrounds and backdrop for a=0', () => {
    const backdrop = {r: 10, g: 20, b: 30, a: 1};
    expect(composite({r: 1, g: 2, b: 3, a: 1}, backdrop)).toEqual({
      r: 1,
      g: 2,
      b: 3,
      a: 1,
    });
    expect(composite({r: 255, g: 255, b: 255, a: 0}, backdrop)).toEqual({
      ...backdrop,
    });
  });

  it('source-over blends per channel', () => {
    const result = composite(
      {r: 0, g: 0, b: 0, a: 0.5},
      {r: 255, g: 255, b: 255, a: 1},
    );
    expect(result.r).toBeCloseTo(127.5, 5);
    expect(result.a).toBe(1);
  });
});

describe('relativeLuminance / contrastRatio', () => {
  it('matches the WCAG anchor values', () => {
    expect(relativeLuminance({r: 255, g: 255, b: 255, a: 1})).toBeCloseTo(1, 6);
    expect(relativeLuminance({r: 0, g: 0, b: 0, a: 1})).toBeCloseTo(0, 6);
    expect(
      contrastRatio({r: 255, g: 255, b: 255, a: 1}, {r: 0, g: 0, b: 0, a: 1}),
    ).toBeCloseTo(21, 5);
  });

  it('reproduces the Colour Contrast Analyser readings from issue #3654', () => {
    const ratio = (fg: string, bg: string) =>
      contrastRatio(parseColor(fg)!, parseColor(bg)!);
    expect(ratio('#737373', '#F1F1F1')).toBeCloseTo(4.2, 1);
    expect(ratio('#A3A3A3', '#FFFFFF')).toBeCloseTo(2.5, 1);
    expect(ratio('#CBCBCB', '#F1F1F1')).toBeCloseTo(1.4, 1);
    expect(ratio('#737373', '#C4DDFB')).toBeCloseTo(3.4, 1);
  });

  it('is symmetric', () => {
    const a = parseColor('#4E606F')!;
    const b = parseColor('#F1F4F7')!;
    expect(contrastRatio(a, b)).toBe(contrastRatio(b, a));
  });
});

describe('splitTopLevelComma', () => {
  it('ignores commas nested in function calls', () => {
    expect(
      splitTopLevelComma('rgba(5, 54, 89, 0.1), rgba(223, 226, 229, 0.2)'),
    ).toEqual(['rgba(5, 54, 89, 0.1)', 'rgba(223, 226, 229, 0.2)']);
    expect(splitTopLevelComma('var(--a, #fff), #000')).toEqual([
      'var(--a, #fff)',
      '#000',
    ]);
  });

  it('returns null when there is no top-level comma', () => {
    expect(splitTopLevelComma('rgba(1, 2, 3, 0.5)')).toBeNull();
  });
});

describe('resolveColor', () => {
  const tokens = {
    '--solid': '#112233',
    '--alias': 'var(--solid)',
    '--dual': 'light-dark(#111111, #222222)',
    '--nested-dual': 'light-dark(rgba(5, 54, 89, 0.1), rgba(0, 0, 0, 0.2))',
    '--cycle-a': 'var(--cycle-b)',
    '--cycle-b': 'var(--cycle-a)',
    '--self': 'var(--self)',
    '--to-dual': 'var(--dual)',
  };

  it('resolves tokens, aliases, and literals', () => {
    expect(toHex(resolveColor(tokens, '--solid')!)).toBe('#112233');
    expect(toHex(resolveColor(tokens, '--alias')!)).toBe('#112233');
    expect(toHex(resolveColor(tokens, '#abc')!)).toBe('#aabbcc');
  });

  it('picks the mode side of light-dark(), including through var()', () => {
    expect(toHex(resolveColor(tokens, '--dual', 'light')!)).toBe('#111111');
    expect(toHex(resolveColor(tokens, '--dual', 'dark')!)).toBe('#222222');
    expect(toHex(resolveColor(tokens, '--to-dual', 'dark')!)).toBe('#222222');
    expect(resolveColor(tokens, '--nested-dual', 'dark')!.a).toBeCloseTo(
      0.2,
      6,
    );
  });

  it('uses var() fallbacks when the reference is missing', () => {
    expect(toHex(resolveColor(tokens, 'var(--missing, #ff0000)')!)).toBe(
      '#ff0000',
    );
    expect(toHex(resolveColor(tokens, 'var(--missing, var(--solid))')!)).toBe(
      '#112233',
    );
    expect(resolveColor(tokens, 'var(--missing)')).toBeNull();
  });

  it('breaks reference cycles instead of recursing forever', () => {
    expect(resolveColor(tokens, '--cycle-a')).toBeNull();
    expect(resolveColor(tokens, '--self')).toBeNull();
    expect(toHex(resolveColor(tokens, 'var(--cycle-a, #00ff00)')!)).toBe(
      '#00ff00',
    );
  });
});

describe('flattenBackground', () => {
  const tokens = {
    '--surface': '#ffffff',
    '--wash': '#0000000F',
    '--transparent': 'transparent',
    '--broken': 'oklch(0.5 0.1 200)',
  };

  it('composites translucent layers bottom-up over the stack', () => {
    // #0000000F over #ffffff — the exact composite behind issue #3654's
    // measured #F0F0F0 avatar/segmented-control background.
    expect(toHex(flattenBackground(tokens, ['--surface', '--wash'])!)).toBe(
      '#f0f0f0',
    );
  });

  it('assumes a white page canvas under a translucent bottom layer', () => {
    expect(toHex(flattenBackground(tokens, ['#00000080'])!)).toBe('#7f7f7f');
    expect(toHex(flattenBackground(tokens, ['--transparent'])!)).toBe(
      '#ffffff',
    );
  });

  it('propagates unresolvable layers as null', () => {
    expect(flattenBackground(tokens, ['--surface', '--broken'])).toBeNull();
    expect(flattenBackground(tokens, ['--missing'])).toBeNull();
  });
});
