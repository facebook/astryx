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

const CORE = [
  {hex: palettes.neutral.light[100], name: 'Surface (T100)'},
  {hex: palettes.neutral.light[95], name: 'Body (T95)'},
  {hex: palettes.neutral.light[90], name: 'Neutral T90'},
  {hex: palettes.neutral.light[50], name: 'Neutral T50'},
  {hex: palettes.neutral.light[15], name: 'Accent (T15)'},
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
