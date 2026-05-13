'use client';

import {butterTheme} from '@xds/theme-butter/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';

const TONAL_COLORS = [
  {name: 'Butter Neutral', sourceHex: '#e5e3d4'},
  {name: 'Blue', sourceHex: '#d2e4ff'},
  {name: 'Cyan', sourceHex: '#96f5fa'},
  {name: 'Green', sourceHex: '#bdf3be', semantic: 'Success'},
  {name: 'Teal', sourceHex: '#a5f6df'},
  {name: 'Yellow', sourceHex: '#ffe088', semantic: 'Warning'},
  {name: 'Orange', sourceHex: '#ffdac2'},
  {name: 'Red', sourceHex: '#ffd8d4', semantic: 'Error'},
  {name: 'Pink', sourceHex: '#ffd5e7'},
  {name: 'Purple', sourceHex: '#e7dcff'},
];

const CORE = [
  {hex: '#1d1c11', name: 'Butter 900'},
  {hex: '#605f52', name: 'Butter 500'},
  {hex: '#c9c7b9', name: 'Butter 300'},
  {hex: '#FDEE8C', name: 'Butter 100'},
  {hex: '#fffdee', name: 'Cream'},
];

export default function ButterPalettePage() {
  return (
    <ThemePalettePreview
      theme={butterTheme}
      title="Butter Theme Palette"
      subtitle="A warm, golden theme inspired by fresh butter and sunlight. OKLCH-derived tonal ramps from source #FDEE8C."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
    />
  );
}
