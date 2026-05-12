'use client';

import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {dailyTheme} from '@xds/theme-daily/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const TONAL_COLORS: TonalColor[] = [
  {name: 'Daily Neutral', sourceHex: '#E6E3DE', note: 'warm cream-gray'},
  {name: 'Blue', sourceHex: '#5a7a99', note: 'T90: #BBDBFE · T25: #192973'},
  {name: 'Cyan', sourceHex: '#497f8b', note: 'T90: #ACE3F0 · T25: #003C4F'},
  {name: 'Green', sourceHex: '#5f7f60', note: 'T90: #C0E3C0 · T25: #006410'},
  {name: 'Teal', sourceHex: '#4b8176', note: 'T90: #ADE6D9 · T25: #0D4C3E'},
  {name: 'Yellow', sourceHex: '#8a7533', note: 'T90: #FDE29A · T25: #634F19'},
  {name: 'Orange', sourceHex: '#947056', note: 'T90: #F8CEB2 · T25: #590801'},
  {name: 'Red', sourceHex: '#996b6a', note: 'T90: #FDC9C7 · T25: #A1211D'},
  {name: 'Pink', sourceHex: '#966b7b', note: 'T90: #F9C8DA · T25: #8E2149'},
  {name: 'Purple', sourceHex: '#896d91', note: 'T90: #EACBF2 · T25: #6A218E'},
  {name: 'Info', sourceHex: '#1779FA', semantic: 'Info'},
  {name: 'Error', sourceHex: '#FD0000', semantic: 'Error'},
  {name: 'Warning', sourceHex: '#F8C722', semantic: 'Warning'},
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
