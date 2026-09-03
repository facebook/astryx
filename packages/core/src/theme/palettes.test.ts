// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  defineTonalPalettes,
  getTonalPaletteRamp,
  TONAL_PALETTE_STOPS,
  type ThemePalettes,
  type TonalPaletteRamp,
} from './palettes';

function ramp(color = '#123456'): TonalPaletteRamp {
  return Object.fromEntries(
    TONAL_PALETTE_STOPS.map(stop => [stop, color]),
  ) as unknown as TonalPaletteRamp;
}

describe('defineTonalPalettes', () => {
  it('uses canonical numeric stop labels from 0 through 100', () => {
    expect(TONAL_PALETTE_STOPS).toEqual([
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
      95, 100,
    ]);
  });

  it('preserves a complete approved palette with exact key inference', () => {
    const palettes = defineTonalPalettes({
      blue: {semantic: 'info', light: ramp('#0068cc'), dark: ramp('#529fff')},
    });

    expect(palettes.blue.light[45]).toBe('#0068cc');
    expect(getTonalPaletteRamp(palettes.blue, 'dark')?.[45]).toBe('#529fff');
  });

  it('accepts light-only and dark-only palette families', () => {
    const palettes = defineTonalPalettes({
      lightOnly: {light: ramp('#777777')},
      darkOnly: {dark: ramp('#222222')},
    });

    expect(getTonalPaletteRamp(palettes.lightOnly, 'light')).toBe(
      palettes.lightOnly.light,
    );
    expect(getTonalPaletteRamp(palettes.lightOnly, 'dark')).toBeUndefined();
    expect(getTonalPaletteRamp(palettes.darkOnly, 'dark')).toBe(
      palettes.darkOnly.dark,
    );
    expect(getTonalPaletteRamp(palettes.darkOnly, 'light')).toBeUndefined();
  });

  it('uses an explicitly shared ramp only when both modes declare it', () => {
    const shared = ramp('#777777');
    const palettes = defineTonalPalettes({
      neutral: {light: shared, dark: shared},
    });

    expect(getTonalPaletteRamp(palettes.neutral, 'light')).toBe(shared);
    expect(getTonalPaletteRamp(palettes.neutral, 'dark')).toBe(
      shared,
    );
  });

  it('rejects an incomplete ramp', () => {
    const palettes = {
      blue: {light: {0: '#000000', 100: '#ffffff'}},
    } as unknown as ThemePalettes;

    expect(() => defineTonalPalettes(palettes)).toThrow(
      'Palette "blue" light stop 5 must be an opaque six-digit hex color',
    );
  });

  it('rejects non-opaque or malformed colors', () => {
    const invalid = {...ramp(), 50: '#12345680'} as TonalPaletteRamp;

    expect(() => defineTonalPalettes({blue: {light: invalid}})).toThrow(
      'must be an opaque six-digit hex color',
    );
  });

  it('rejects ramps whose luminance decreases as stop labels increase', () => {
    const invalid = {
      ...ramp('#123456'),
      0: '#ffffff',
      5: '#000000',
    } as TonalPaletteRamp;

    expect(() => defineTonalPalettes({blue: {light: invalid}})).toThrow(
      'stops must be ordered from darker to lighter',
    );
  });

  it('rejects unknown ramp keys', () => {
    const invalid = {...ramp(), 42: '#123456'} as TonalPaletteRamp;

    expect(() => defineTonalPalettes({blue: {light: invalid}})).toThrow(
      'Palette "blue" light contains unknown stop or metadata key "42".',
    );
  });

  it('rejects malformed palette containers', () => {
    expect(() => defineTonalPalettes(null as unknown as ThemePalettes)).toThrow(
      'Theme palettes must be a named palette map.',
    );
    expect(() => defineTonalPalettes([] as unknown as ThemePalettes)).toThrow(
      'Theme palettes must be a named palette map.',
    );
    expect(() => defineTonalPalettes({})).toThrow(
      'Theme palettes must contain at least one named palette family.',
    );
    expect(() =>
      defineTonalPalettes({blue: {}} as unknown as ThemePalettes),
    ).toThrow(
      'Palette "blue" must define at least one light or dark tonal ramp.',
    );
  });

  it('rejects invalid family metadata', () => {
    expect(() =>
      defineTonalPalettes({
        blue: {light: ramp(), semantic: 42},
      } as unknown as ThemePalettes),
    ).toThrow('Palette "blue" semantic must be a string, got 42.');

    expect(() =>
      defineTonalPalettes({
        blue: {light: ramp(), description: false},
      } as unknown as ThemePalettes),
    ).toThrow('Palette "blue" description must be a string, got false.');
  });

  it('rejects unknown family keys', () => {
    expect(() =>
      defineTonalPalettes({
        blue: {light: ramp(), aliases: ['info']},
      } as unknown as ThemePalettes),
    ).toThrow('Palette "blue" contains unknown family key "aliases".');
  });

  it('rejects hue and chroma values outside their valid ranges', () => {
    expect(() =>
      defineTonalPalettes({
        blue: {light: {...ramp(), hue: 360}},
      }),
    ).toThrow('hue must be a finite number from 0 up to but not including 360');

    expect(() =>
      defineTonalPalettes({
        blue: {light: {...ramp(), chroma: -0.1}},
      }),
    ).toThrow('chroma must be a finite non-negative number');
  });

  it('rejects a present but null mode ramp', () => {
    expect(() =>
      defineTonalPalettes({
        blue: {light: null, dark: ramp()},
      } as unknown as ThemePalettes),
    ).toThrow('Palette "blue" light must be a tonal ramp when provided.');

    expect(() =>
      defineTonalPalettes({
        blue: {light: ramp(), dark: null},
      } as unknown as ThemePalettes),
    ).toThrow('Palette "blue" dark must be a tonal ramp when provided.');
  });
});
