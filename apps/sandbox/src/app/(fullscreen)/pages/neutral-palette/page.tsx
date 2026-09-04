// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {neutralPalettes} from '../../../../../../../packages/themes/neutral/src/neutralPalettes';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';
import {NeutralContrastComponents} from './NeutralContrastComponents';

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
  const family = neutralPalettes[name];
  return {
    name: name[0].toUpperCase() + name.slice(1),
    sourceHex: family.light[50],
    tones: family.light,
    dark: {sourceHex: family.dark[50], tones: family.dark},
  };
});

const darkNeutral = neutralPalettes.neutral.dark;
const CORE = [
  {
    hex: neutralPalettes.neutral.light[100],
    name: 'Surface · tone 100',
    dark: {hex: darkNeutral[10], name: 'Surface · tone 10'},
  },
  {
    hex: neutralPalettes.neutral.light[95],
    name: 'Body · tone 95',
    dark: {hex: darkNeutral[5], name: 'Body · tone 5'},
  },
  {
    hex: neutralPalettes.neutral.light[90],
    name: 'Neutral · tone 90',
    dark: {hex: darkNeutral[30], name: 'Neutral · tone 30'},
  },
  {
    hex: neutralPalettes.neutral.light[50],
    name: 'Neutral · tone 50',
    dark: {hex: darkNeutral[45], name: 'Neutral · tone 45'},
  },
  {
    hex: neutralPalettes.neutral.light[15],
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
