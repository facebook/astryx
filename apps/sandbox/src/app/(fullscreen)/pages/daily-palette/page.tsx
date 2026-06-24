// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {dailyTheme} from '@astryxdesign/theme-daily/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const TONAL_COLORS: TonalColor[] = [
  {name: 'Neutral', sourceHex: '#E6E3DE'},
  {name: 'Blue', sourceHex: '#BBDBFE'},
  {name: 'Cyan', sourceHex: '#ACE3F0'},
  {name: 'Green', sourceHex: '#C0E3C0'},
  {name: 'Teal', sourceHex: '#ADE6D9'},
  {name: 'Yellow', sourceHex: '#FDE29A'},
  {name: 'Orange', sourceHex: '#F8CEB2'},
  {name: 'Red', sourceHex: '#FDC9C7'},
  {name: 'Pink', sourceHex: '#F9C8DA'},
  {name: 'Purple', sourceHex: '#EACBF2'},
  {name: 'Info', sourceHex: '#1779FA', semantic: 'Info'},
  {name: 'Error', sourceHex: '#FD0000', semantic: 'Error'},
  {name: 'Warning', sourceHex: '#F8C722', semantic: 'Warning'},
  {name: 'Success', sourceHex: '#009936', semantic: 'Success'},
];

const CORE = [
  {hex: '#292724', name: 'Astryx 900'},
  {hex: '#85817A', name: 'Astryx 500'},
  {hex: '#E6E3DE', name: 'Astryx 300'},
  {hex: '#F8F4ED', name: 'Astryx 100'},
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
      <VStack gap={2}>
        <Text type="display-1">Display 1</Text>
        <Text type="display-2">Display 2</Text>
        <Text type="display-3">Display 3</Text>
      </VStack>
    </div>
  );
}

export default function DailyPalettePage() {
  return (
    <ThemePalettePreview
      theme={dailyTheme}
      title="Astryx Theme Palette"
      subtitle="A warm, productivity-focused theme with earthy cream tones. PT Serif italic for display, Figtree for headings and body, pill-shaped buttons."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
      leadingExtras={<DisplayTextSection />}
    />
  );
}
