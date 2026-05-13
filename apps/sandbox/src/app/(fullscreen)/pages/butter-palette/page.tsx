'use client';

import {butterTheme} from '@xds/theme-butter/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';

const TONAL_COLORS = [
  {name: 'Accent', sourceHex: '#225BFF'},
  {name: 'Gray', sourceHex: '#868B99'},
  {name: 'Red', sourceHex: '#FF7553'},
  {name: 'Orange', sourceHex: '#FFA347'},
  {name: 'Yellow', sourceHex: '#fdee8c'},
  {name: 'Green', sourceHex: '#5DCE5F'},
  {name: 'Cyan', sourceHex: '#60CFD3'},
  {name: 'Teal', sourceHex: '#6CD9A8'},
  {name: 'Blue', sourceHex: '#5681FF'},
  {name: 'Purple', sourceHex: '#B780F6'},
  {name: 'Pink', sourceHex: '#F680E8'},
  {name: 'Error', sourceHex: '#FF5947', semantic: 'Error'},
  {name: 'Warning', sourceHex: '#F8C726', semantic: 'Warning'},
  {name: 'Success', sourceHex: '#AAC515', semantic: 'Success'},
];

const CORE = [
  {hex: '#225BFF', name: 'Butter 900'},
  {hex: '#5681FF', name: 'Butter 700'},
  {hex: '#FDEE8C', name: 'Butter 300'},
  {hex: '#FDFBE4', name: 'Butter 100'},
  {hex: '#FFFFFF', name: 'White'},
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
