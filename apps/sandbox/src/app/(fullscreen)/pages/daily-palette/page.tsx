'use client';

import {dailyTheme} from '@xds/theme-daily/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const TONAL_COLORS: TonalColor[] = [
  {name: 'Daily Neutral', sourceHex: '#E6E3DE', note: 'warm cream-gray'},
  {name: 'Blue', sourceHex: '#3a5e8c', note: 'muted navy'},
  {name: 'Cyan', sourceHex: '#3a7c7c', note: 'deep teal'},
  {name: 'Green', sourceHex: '#009936', semantic: 'Success'},
  {name: 'Teal', sourceHex: '#2e6b5a', note: 'earthy teal'},
  {name: 'Yellow', sourceHex: '#FFB600', semantic: 'Warning'},
  {name: 'Orange', sourceHex: '#c47620', note: 'warm amber'},
  {name: 'Red', sourceHex: '#FD0000', semantic: 'Error'},
  {name: 'Pink', sourceHex: '#c44a70', note: 'dusty rose'},
  {name: 'Purple', sourceHex: '#6b4a8c', note: 'muted plum'},
];

const CORE = [
  {hex: '#292724', name: 'Daily 900'},
  {hex: '#85817A', name: 'Daily 500'},
  {hex: '#E6E3DE', name: 'Daily 300'},
  {hex: '#F8F4ED', name: 'Daily 100'},
  {hex: '#FFFFFF', name: 'White'},
];

export default function DailyPalettePage() {
  return (
    <ThemePalettePreview
      theme={dailyTheme}
      title="Daily Theme Palette"
      subtitle="A warm, productivity-focused theme with earthy cream tones. PT Serif headings, Figtree body, pill-shaped buttons."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
    />
  );
}
