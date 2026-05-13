'use client';

import {butterTheme} from '@xds/theme-butter/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';

const TONAL_COLORS = [
  {name: 'Butter Neutral', sourceHex: '#e5e3d4'},
  {name: 'Blue', sourceHex: '#5681FF'},
  {name: 'Cyan', sourceHex: '#60CFD3'},
  {name: 'Green', sourceHex: '#AAC515', semantic: 'Success'},
  {name: 'Teal', sourceHex: '#6CD9A8'},
  {name: 'Yellow', sourceHex: '#F8C726', semantic: 'Warning'},
  {name: 'Butter', sourceHex: '#FDEE8C'},
  {name: 'Orange', sourceHex: '#FFA347'},
  {name: 'Red', sourceHex: '#FF5947', semantic: 'Error'},
  {name: 'Pink', sourceHex: '#F680E8'},
  {name: 'Purple', sourceHex: '#B780F6'},
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
      subtitle="A warm, golden theme inspired by fresh butter and sunlight. OKLCH-derived tonal ramps from source #FDEE8C. Accent: #225BFF."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
    />
  );
}
