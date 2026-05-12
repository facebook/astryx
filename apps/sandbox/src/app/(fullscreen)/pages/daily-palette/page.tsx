'use client';

import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {dailyTheme} from '@xds/theme-daily/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const TONAL_COLORS: TonalColor[] = [
  {name: 'Daily Neutral', sourceHex: '#E6E3DE', note: 'warm cream-gray'},
  {name: 'Blue', sourceHex: '#2E3968', note: 'deep navy'},
  {name: 'Cyan', sourceHex: '#3a95a1', note: 'ocean teal'},
  {name: 'Green', sourceHex: '#4a672d', note: 'olive'},
  {name: 'Teal', sourceHex: '#367d62', note: 'forest'},
  {name: 'Yellow', sourceHex: '#fddf72', note: 'warm gold'},
  {name: 'Orange', sourceHex: '#bf661d', note: 'warm amber'},
  {name: 'Red', sourceHex: '#BE491D', note: 'terracotta'},
  {name: 'Pink', sourceHex: '#bc4997', note: 'magenta rose'},
  {name: 'Purple', sourceHex: '#8B49BC', note: 'violet'},
  {name: 'Error', sourceHex: '#FD0000', semantic: 'Error'},
  {name: 'Warning', sourceHex: '#FFB600', semantic: 'Warning'},
  {name: 'Success', sourceHex: '#009936', semantic: 'Success'},
];

const CORE = [
  {hex: '#292724', name: 'Daily 900'},
  {hex: '#85817A', name: 'Daily 500'},
  {hex: '#E6E3DE', name: 'Daily 300'},
  {hex: '#F8F4ED', name: 'Daily 100'},
  {hex: '#FFFFFF', name: 'White'},
];

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  margin: 0,
  marginBottom: 12,
};

function DisplayTextSection() {
  return (
    <div>
      <h3 style={sectionTitle}>Display Text (PT Serif Italic)</h3>
      <XDSVStack gap={2}>
        <XDSText type="display-1">Display 1</XDSText>
        <XDSText type="display-2">Display 2</XDSText>
        <XDSText type="display-3">Display 3</XDSText>
      </XDSVStack>
    </div>
  );
}

export default function DailyPalettePage() {
  return (
    <ThemePalettePreview
      theme={dailyTheme}
      title="Daily Theme Palette"
      subtitle="A warm, productivity-focused theme with earthy cream tones. PT Serif italic for display, Figtree for headings and body, pill-shaped buttons."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
      leadingExtras={<DisplayTextSection />}
    />
  );
}
