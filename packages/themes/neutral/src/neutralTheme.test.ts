// Copyright (c) Meta Platforms, Inc. and affiliates.

import {TONAL_PALETTE_TONES} from '@astryxdesign/core/theme';
import {describe, expect, it} from 'vitest';
import {neutralPalettes, neutralTheme} from './neutralTheme';

describe('neutral theme palette contract', () => {
  it('ships every approved palette with the theme', () => {
    expect(neutralTheme.palettes).toBe(neutralPalettes);
    expect(Object.keys(neutralPalettes)).toEqual([
      'neutral',
      'red',
      'orange',
      'yellow',
      'green',
      'teal',
      'cyan',
      'blue',
      'purple',
      'pink',
    ]);

    for (const family of Object.values(neutralPalettes)) {
      for (const stop of TONAL_PALETTE_TONES) {
        expect(family.light[stop]).toMatch(/^#[0-9a-f]{6}$/i);
        expect(family.dark[stop]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('maps representative semantic tokens to numbered palette stops', () => {
    expect(neutralTheme.tokens['--color-background-body']).toBe(
      `light-dark(${neutralPalettes.neutral.light[95]}, ${neutralPalettes.neutral.dark[5]})`,
    );
    expect(neutralTheme.tokens['--color-background-blue']).toBe(
      `light-dark(${neutralPalettes.blue.light[85]}, ${neutralPalettes.blue.dark[70]}3D)`,
    );
  });

  it('keeps semantic status colors mapped independently of status icon shapes', () => {
    expect(neutralTheme.tokens['--color-success']).toBe(
      `light-dark(${neutralPalettes.green.light[30]}, ${neutralPalettes.green.dark[80]})`,
    );
    expect(neutralTheme.tokens['--color-warning']).toBe(
      `light-dark(${neutralPalettes.yellow.light[30]}, ${neutralPalettes.yellow.dark[80]})`,
    );
    expect(neutralTheme.tokens['--color-error']).toBe(
      `light-dark(${neutralPalettes.red.light[25]}, ${neutralPalettes.red.dark[85]})`,
    );
  });

  it('keeps the roomier segmented-control inset height-neutral', () => {
    expect(neutralTheme.components?.['segmented-control']).toEqual({
      base: {padding: 'var(--spacing-1)'},
    });
    expect(neutralTheme.components?.['segmented-control-item']).toEqual({
      'size:sm': {height: 'calc(var(--size-element-sm) - 8px)'},
      'size:md': {height: 'calc(var(--size-element-md) - 8px)'},
      'size:lg': {height: 'calc(var(--size-element-lg) - 8px)'},
      selected: {boxShadow: 'none'},
    });
  });
});
