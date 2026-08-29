// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  defineTonalPalettes,
  getTonalPaletteRamp,
  TONAL_PALETTE_TONES,
  type ThemePalettes,
  type TonalPaletteRamp,
} from './palettes';

function ramp(color = '#123456'): TonalPaletteRamp {
  return Object.fromEntries(
    TONAL_PALETTE_TONES.map(tone => [tone, color]),
  ) as unknown as TonalPaletteRamp;
}

describe('defineTonalPalettes', () => {
  it('uses numeric HCT tone keys from black through white', () => {
    expect(TONAL_PALETTE_TONES).toEqual([
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
      95, 100,
    ]);
  });

  it('preserves a complete approved palette with exact key inference', () => {
    const palettes = defineTonalPalettes({
      blue: {semantic: 'info', light: ramp('#0068cc'), dark: ramp('#529fff')},
    });

    expect(palettes.blue.light[45]).toBe('#0068cc');
    expect(getTonalPaletteRamp(palettes.blue, 'dark')[45]).toBe('#529fff');
  });

  it('falls back to the light ramp when no separate dark ramp exists', () => {
    const palettes = defineTonalPalettes({neutral: {light: ramp('#777777')}});

    expect(getTonalPaletteRamp(palettes.neutral, 'dark')).toBe(
      palettes.neutral.light,
    );
  });

  it('rejects an incomplete ramp', () => {
    const palettes = {
      blue: {light: {0: '#000000', 100: '#ffffff'}},
    } as unknown as ThemePalettes;

    expect(() => defineTonalPalettes(palettes)).toThrow(
      'Palette "blue" light tone 5 must be an opaque six-digit hex color',
    );
  });

  it('rejects non-opaque or malformed colors', () => {
    const invalid = {...ramp(), 50: '#12345680'} as TonalPaletteRamp;

    expect(() => defineTonalPalettes({blue: {light: invalid}})).toThrow(
      'must be an opaque six-digit hex color',
    );
  });

  it('rejects unknown ramp keys', () => {
    const invalid = {...ramp(), 42: '#123456'} as TonalPaletteRamp;

    expect(() => defineTonalPalettes({blue: {light: invalid}})).toThrow(
      'Palette "blue" light contains unknown tone or metadata key "42".',
    );
  });

  it('rejects malformed palette containers', () => {
    expect(() => defineTonalPalettes(null as unknown as ThemePalettes)).toThrow(
      'Theme palettes must be a named palette map.',
    );
    expect(() => defineTonalPalettes([] as unknown as ThemePalettes)).toThrow(
      'Theme palettes must be a named palette map.',
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

  it('rejects a present but null dark ramp', () => {
    expect(() =>
      defineTonalPalettes({
        blue: {light: ramp(), dark: null},
      } as unknown as ThemePalettes),
    ).toThrow('Palette "blue" dark must be a tonal ramp when provided.');
  });
});
