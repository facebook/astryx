'use client';

// =============================================================================
// Y2K Theme Palette Preview
// =============================================================================

import {XDSVStack} from '@xds/core/Layout';
import {y2kTheme} from '@xds/theme-y2k/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const CRIMSON = "'Crimson Text', Georgia, 'Times New Roman', serif";

const TONAL_COLORS: TonalColor[] = [
  {name: 'Y2K Neutral', sourceHex: '#c3b7ab', note: 'H=75 C=8'},
  {name: 'Green', sourceHex: '#C5E17A', semantic: 'Success'},
  {name: 'Red', sourceHex: '#FF9E9A', semantic: 'Error'},
  {name: 'Yellow', sourceHex: '#FFCC55', semantic: 'Warning'},
  {name: 'Blue', sourceHex: '#8ECFFF'},
  {name: 'Pink', sourceHex: '#FFA0C8'},
  {name: 'Purple', sourceHex: '#C0AAFF'},
  {name: 'Cyan', sourceHex: '#70E8D0'},
  {name: 'Orange', sourceHex: '#FFAA66'},
  {name: 'Teal', sourceHex: '#78E0B0'},
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
      <h3 style={sectionTitle}>Display Text (Crimson Text)</h3>
      <XDSVStack gap={2}>
        <span style={{fontFamily: CRIMSON, fontSize: 83, fontWeight: 400, lineHeight: 1.15}}>Display 1</span>
        <span style={{fontFamily: CRIMSON, fontSize: 67, fontWeight: 400, lineHeight: 1.15}}>Display 2</span>
        <span style={{fontFamily: CRIMSON, fontSize: 53, fontWeight: 400, lineHeight: 1.2}}>Display 3</span>
      </XDSVStack>
    </div>
  );
}

export default function Y2kPalettePage() {
  return (
    <ThemePalettePreview
      theme={y2kTheme}
      title="Y2K Theme Palette"
      subtitle="A bubbly, playful pop theme — hot pink body, lime green accents, Crimson Text headings + Poppins body."
      tonalColors={TONAL_COLORS}
      leadingExtras={<DisplayTextSection />}
    />
  );
}
