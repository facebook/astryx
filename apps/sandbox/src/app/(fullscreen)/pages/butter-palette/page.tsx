'use client';

import {butterTheme} from '@xds/theme-butter/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';

const TONAL_COLORS = [
  {name: 'Butter Neutral', sourceHex: '#f4e6be'},
  {name: 'Blue', sourceHex: '#dbe8f5'},
  {name: 'Cyan', sourceHex: '#d4f0ee'},
  {name: 'Green', sourceHex: '#d4f0d4', semantic: 'Success'},
  {name: 'Teal', sourceHex: '#d4ede4'},
  {name: 'Yellow', sourceHex: '#FFF3CC', semantic: 'Warning'},
  {name: 'Orange', sourceHex: '#ffe8cc'},
  {name: 'Red', sourceHex: '#fde0e0', semantic: 'Error'},
  {name: 'Pink', sourceHex: '#f5ddf0'},
  {name: 'Purple', sourceHex: '#e8ddf5'},
];

const CORE = [
  {hex: '#4A3800', name: 'Butter 900'},
  {hex: '#8B7230', name: 'Butter 500'},
  {hex: '#C4A84D', name: 'Butter 300'},
  {hex: '#FDEE8C', name: 'Butter 100'},
  {hex: '#FFFDF5', name: 'Cream'},
];

export default function ButterThemesPage() {
  return (
    <ThemePalettePreview
      theme={butterTheme}
      title="Butter Theme Palette"
      subtitle="A warm, golden theme inspired by fresh butter and sunlight. Creamy yellows with soft, inviting tones."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
    />
  );
}
