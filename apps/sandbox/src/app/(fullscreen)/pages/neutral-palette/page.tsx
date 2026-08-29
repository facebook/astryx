// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';
import {NeutralContrastComponents} from './NeutralContrastComponents';

const palettes = neutralTheme.palettes;
if (!palettes) {
  throw new Error('The Neutral theme must ship its approved tonal palettes.');
}

const PALETTE_ORDER = [
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
] as const;

const TONAL_COLORS: TonalColor[] = PALETTE_ORDER.map(name => {
  const family = palettes[name];
  const dark = family.dark ?? family.light;
  const metadata = family.light.chroma
    ? `OKLCH H${family.light.hue} · pastel C${family.light.chroma}`
    : 'C=0';
  return {
    name: name[0].toUpperCase() + name.slice(1),
    sourceHex: family.light[50],
    semantic: family.semantic
      ? family.semantic[0].toUpperCase() + family.semantic.slice(1)
      : undefined,
    note: metadata,
    tones: family.light,
    dark: {sourceHex: dark[50], tones: dark},
  };
});

const darkNeutral = palettes.neutral.dark ?? palettes.neutral.light;
const CORE = [
  {
    hex: palettes.neutral.light[100],
    name: 'Surface · tone 100',
    dark: {hex: darkNeutral[10], name: 'Surface · tone 10'},
  },
  {
    hex: palettes.neutral.light[95],
    name: 'Body · tone 95',
    dark: {hex: darkNeutral[5], name: 'Body · tone 5'},
  },
  {
    hex: palettes.neutral.light[90],
    name: 'Neutral · tone 90',
    dark: {hex: darkNeutral[30], name: 'Neutral · tone 30'},
  },
  {
    hex: palettes.neutral.light[50],
    name: 'Neutral · tone 50',
    dark: {hex: darkNeutral[45], name: 'Neutral · tone 45'},
  },
  {
    hex: palettes.neutral.light[15],
    name: 'Accent · tone 15',
    dark: {hex: darkNeutral[90], name: 'Accent · tone 90'},
  },
];

export default function NeutralPalettePage() {
  return (
    <ThemePalettePreview
      theme={neutralTheme}
      title="Neutral Theme Palette"
      subtitle="Approved balanced OKLCH palette applied to the neutral theme. The component sections below use the real theme tokens in light and dark mode; the audit drawer reports token usage and contrast."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
      extraSections={<NeutralContrastComponents />}
    />
  );
}
