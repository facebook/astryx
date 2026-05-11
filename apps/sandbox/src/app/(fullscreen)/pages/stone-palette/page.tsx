'use client';

import {stoneTheme} from '@xds/theme-stone/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';

const TONAL_COLORS = [
  {name: 'Stone Neutral', sourceHex: '#e2e2e2'},
  {name: 'Blue', sourceHex: '#d7e4f5'},
  {name: 'Cyan', sourceHex: '#cce8e5'},
  {name: 'Green', sourceHex: '#d0e9ce', semantic: 'Success'},
  {name: 'Teal', sourceHex: '#d4e7dc'},
  {name: 'Yellow', sourceHex: '#f4e1b7', semantic: 'Warning'},
  {name: 'Orange', sourceHex: '#ffdcbb'},
  {name: 'Red', sourceHex: '#f9dcd7', semantic: 'Error'},
  {name: 'Pink', sourceHex: '#f0dde8'},
  {name: 'Purple', sourceHex: '#e8dff3'},
];

const CORE = [
  {hex: '#28282A', name: 'Stone 900'},
  {hex: '#84848B', name: 'Stone 500'},
  {hex: '#D8D8DB', name: 'Stone 300'},
  {hex: '#f3f3f5', name: 'Stone 100'},
  {hex: '#FFFFFF', name: 'White'},
];

export default function StonePalettePage() {
  return (
    <ThemePalettePreview
      theme={stoneTheme}
      title="Stone Theme Palette"
      subtitle="A warm, earthy neutral theme inspired by natural stone and sandstone."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
    />
  );
}
