// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {resolveThemeTokens} from '@astryxdesign/core/theme';
import {gothicPalettes} from './gothicPalettes';
import {gothicTheme} from './gothicTheme';

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

describe('gothic palette mapping', () => {
  it('keeps the theme dark-only and maps its neutral surface ladder', () => {
    const tokens = resolveThemeTokens(gothicTheme, {mode: 'dark'});

    expect(tokens['--color-background-body']).toBe(gothicPalettes.neutral[10]);
    expect(tokens['--color-background-surface']).toBe(
      gothicPalettes.neutral[10],
    );
    expect(tokens['--color-background-card']).toBe(gothicPalettes.neutral[15]);
    expect(tokens['--color-background-popover']).toBe(
      gothicPalettes.neutral[20],
    );
    expect(tokens['--color-text-primary']).toBe(gothicPalettes.neutral[95]);
    expect(tokens['--color-text-secondary']).toBe(gothicPalettes.neutral[75]);
  });

  it('maps syntax roles to the reviewed jewel-tone anchors', () => {
    const tokens = resolveThemeTokens(gothicTheme, {mode: 'dark'});
    expect(tokens).toMatchObject({
      '--color-syntax-keyword': gothicPalettes.purple[80],
      '--color-syntax-string': gothicPalettes.green[70],
      '--color-syntax-number': gothicPalettes.yellow[70],
      '--color-syntax-function': gothicPalettes.blue[65],
      '--color-syntax-type': gothicPalettes.purple[80],
      '--color-syntax-constant': gothicPalettes.yellow[65],
      '--color-syntax-tag': gothicPalettes.pink[65],
      '--color-syntax-attribute': gothicPalettes.yellow[70],
      '--color-syntax-property': gothicPalettes.teal[70],
      '--color-syntax-added-marker': gothicPalettes.green[70],
      '--color-syntax-removed-marker': gothicPalettes.pink[65],
    });
  });

  it('maps every categorical role to the reviewed four-stop pattern', () => {
    const tokens = resolveThemeTokens(gothicTheme, {mode: 'dark'});
    for (const family of categoricalFamilies) {
      const palette = gothicPalettes[family];
      expect(tokens[`--color-background-${family}`]).toBe(palette[75]);
      expect(tokens[`--color-border-${family}`]).toBe(palette[60]);
      expect(tokens[`--color-icon-${family}`]).toBe(palette[30]);
      expect(tokens[`--color-text-${family}`]).toBe(palette[20]);
    }
  });
});
