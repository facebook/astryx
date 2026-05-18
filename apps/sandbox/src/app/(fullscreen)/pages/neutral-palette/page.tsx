// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

// =============================================================================
// Neutral Theme Palette Preview
// =============================================================================

import {neutralTheme} from '@xds/theme-neutral/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const TONAL_COLORS: TonalColor[] = [
  {name: 'Neutral', sourceHex: '#e5e5e5', note: 'C=0'},
  {name: 'Red', sourceHex: '#eb183a', semantic: 'Error'},
  {name: 'Orange', sourceHex: '#d57113'},
  {name: 'Yellow', sourceHex: '#f8c723', semantic: 'Warning'},
  {name: 'Green', sourceHex: '#358a3a', semantic: 'Success'},
  {name: 'Teal', sourceHex: '#0c7365'},
  {name: 'Cyan', sourceHex: '#0c6f82'},
  {name: 'Blue', sourceHex: '#1679fa', semantic: 'Info'},
  {name: 'Purple', sourceHex: '#980fb2'},
  {name: 'Pink', sourceHex: '#b10e69'},
];

const CORE = [
  {hex: '#fafafa', name: 'Neutral 50'},
  {hex: '#f5f5f5', name: 'Neutral 100 (body)'},
  {hex: '#e5e5e5', name: 'Neutral 200'},
  {hex: '#737373', name: 'Neutral 500'},
  {hex: '#262626', name: 'Neutral 800 (accent)'},
];

export default function NeutralPalettePage() {
  return (
    <ThemePalettePreview
      theme={neutralTheme}
      title="Neutral Theme Palette"
      subtitle="Pure grayscale spine with an OKLCH-derived palette. Semantic badges use vivid T60 saturated pills (Material You / Linear style); categorical badges and banners use soft T85 pastels. Figtree across body and headings."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
    />
  );
}
