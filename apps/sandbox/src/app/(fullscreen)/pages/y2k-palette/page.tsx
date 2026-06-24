// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

// =============================================================================
// Y2K Theme Palette Preview
// =============================================================================

import {VStack} from '@astryxdesign/core/Layout';
import {y2kTheme} from '@astryxdesign/theme-y2k/built';
// `y2kPalettes` is only exported from the source entry, not /built.
import {y2kPalettes} from '@astryxdesign/theme-y2k';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const CRIMSON = "'Crimson Text', Georgia, 'Times New Roman', serif";

const TONAL_COLORS: TonalColor[] = [
  {name: 'Y2K Neutral', sourceHex: '#c3b7ab', note: 'H=75 C=8', tones: y2kPalettes.neutral},
  {name: 'Green', sourceHex: '#C5E17A', semantic: 'Success', tones: y2kPalettes.green},
  {name: 'Red', sourceHex: '#FF9E9A', semantic: 'Error', tones: y2kPalettes.red},
  {name: 'Yellow', sourceHex: '#FFCC55', semantic: 'Warning', tones: y2kPalettes.yellow},
  {name: 'Blue', sourceHex: '#8ECFFF', tones: y2kPalettes.blue},
  {name: 'Pink', sourceHex: '#FFA0C8', tones: y2kPalettes.pink},
  {name: 'Purple', sourceHex: '#C0AAFF', tones: y2kPalettes.purple},
  {name: 'Cyan', sourceHex: '#70E8D0', tones: y2kPalettes.cyan},
  {name: 'Orange', sourceHex: '#FFAA66', tones: y2kPalettes.orange},
  {name: 'Teal', sourceHex: '#78E0B0', tones: y2kPalettes.teal},
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
      <VStack gap={2}>
        <span style={{fontFamily: CRIMSON, fontSize: 83, fontWeight: 400, lineHeight: 1.15}}>Display 1</span>
        <span style={{fontFamily: CRIMSON, fontSize: 67, fontWeight: 400, lineHeight: 1.15}}>Display 2</span>
        <span style={{fontFamily: CRIMSON, fontSize: 53, fontWeight: 400, lineHeight: 1.2}}>Display 3</span>
      </VStack>
    </div>
  );
}

export default function Y2kPalettePage() {
  return (
    <ThemePalettePreview
      theme={y2kTheme}
      title="Y2K Theme Palette"
      subtitle="A bubbly, playful pop theme: hot pink body, lime green accents, Crimson Text headings + Poppins body."
      tonalColors={TONAL_COLORS}
      leadingExtras={<DisplayTextSection />}
    />
  );
}
