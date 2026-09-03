// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  TONAL_PALETTE_STOPS,
  validateTonalPalettes,
  type ThemePalettes,
  type TonalPaletteRamp,
} from './palettes';

function ramp(color = '#123456'): TonalPaletteRamp {
  return Object.fromEntries(
    TONAL_PALETTE_STOPS.map(stop => [stop, color]),
  ) as unknown as TonalPaletteRamp;
}

describe('validateTonalPalettes', () => {
  it('uses canonical numeric stop labels from 0 through 100', () => {
    expect(TONAL_PALETTE_STOPS).toEqual([
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
      95, 100,
    ]);
  });

  it('accepts a complete approved palette without changing it', () => {
    const palettes = {
      blue: {semantic: 'info', light: ramp('#0068cc'), dark: ramp('#529fff')},
    } satisfies ThemePalettes;

    expect(validateTonalPalettes(palettes)).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
    expect(palettes.blue.light[45]).toBe('#0068cc');
    expect(palettes.blue.dark[45]).toBe('#529fff');
  });

  it('accepts light-only, dark-only, and explicitly shared ramps', () => {
    const shared = ramp('#777777');
    const palettes = {
      lightOnly: {light: ramp('#777777')},
      darkOnly: {dark: ramp('#222222')},
      shared: {light: shared, dark: shared},
    } satisfies ThemePalettes;

    expect(validateTonalPalettes(palettes).valid).toBe(true);
    expect('dark' in palettes.lightOnly).toBe(false);
    expect('light' in palettes.darkOnly).toBe(false);
    expect(palettes.shared.dark).toBe(shared);
  });

  it('returns all structural errors without throwing', () => {
    const result = validateTonalPalettes({
      blue: {
        light: {...ramp(), 42: '#123456', 50: '#12345680'},
        semantic: 42,
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        {path: 'blue.light.42', message: 'Unknown stop or metadata key "42".'},
        {
          path: 'blue.light.50',
          message: 'Must be an opaque six-digit hex color.',
        },
        {path: 'blue.semantic', message: 'Must be a string; received 42.'},
      ]),
    );
  });

  it('reports incomplete and out-of-order ramps precisely', () => {
    const incomplete = validateTonalPalettes({
      blue: {light: {0: '#000000', 100: '#ffffff'}},
    });
    expect(incomplete.errors).toContainEqual({
      path: 'blue.light.5',
      message: 'Must be an opaque six-digit hex color.',
    });

    const outOfOrder = validateTonalPalettes({
      blue: {light: {...ramp('#123456'), 0: '#ffffff', 5: '#000000'}},
    });
    expect(outOfOrder.errors).toContainEqual({
      path: 'blue.light.5',
      message: 'Must not be darker than the previous stop.',
    });
  });

  it('reports malformed containers and families', () => {
    expect(validateTonalPalettes(null).errors).toContainEqual({
      path: 'palettes',
      message: 'Must be a named palette map.',
    });
    expect(validateTonalPalettes({}).errors).toContainEqual({
      path: 'palettes',
      message: 'Must contain at least one named palette family.',
    });
    expect(validateTonalPalettes({blue: {}}).errors).toContainEqual({
      path: 'blue',
      message: 'Must define at least one light or dark tonal ramp.',
    });
    expect(validateTonalPalettes({blue: {light: null}}).errors).toContainEqual({
      path: 'blue.light',
      message: 'Must be a tonal ramp.',
    });
  });

  it('reports unknown keys and invalid metadata', () => {
    const result = validateTonalPalettes({
      blue: {
        light: {...ramp(), hue: 360, chroma: -0.1},
        aliases: ['info'],
        description: false,
      },
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        {path: 'blue.aliases', message: 'Unknown family key.'},
        {
          path: 'blue.light.hue',
          message:
            'Must be a finite number from 0 up to but not including 360; received 360.',
        },
        {
          path: 'blue.light.chroma',
          message: 'Must be a finite non-negative number; received -0.1.',
        },
        {
          path: 'blue.description',
          message: 'Must be a string; received false.',
        },
      ]),
    );
  });
});
