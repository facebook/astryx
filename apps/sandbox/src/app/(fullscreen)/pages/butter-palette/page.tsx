// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSVStack} from '@xds/core/Layout';
import {butterTheme} from '@xds/theme-butter/built';
import {butterPalettes} from '@xds/theme-butter';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';

const SARINA = "'Sarina', cursive";

// 14 brand palettes shown in the design spec. Tonal ramps come straight
// from the theme's pre-computed palette so the displayed strip exactly
// matches the card / badge / banner tokens.
const TONAL_COLORS = [
  {name: 'Accent', sourceHex: '#225BFF', tones: butterPalettes.accent, dark: {sourceHex: '#FDEE8C', tones: butterPalettes.yellow}},
  {name: 'Gray', sourceHex: '#868B99', tones: butterPalettes.neutral},
  {name: 'Red', sourceHex: '#FF7553', tones: butterPalettes.red},
  {name: 'Orange', sourceHex: '#FFA347', tones: butterPalettes.orange},
  {name: 'Yellow', sourceHex: '#EDD64B', tones: butterPalettes.yellow, dark: {sourceHex: '#EDD64B', tones: {0:'#000000',5:'#161100',10:'#211b00',15:'#2c2600',20:'#383100',25:'#443c00',30:'#504700',35:'#5d5300',40:'#6a5f00',45:'#786b00',50:'#867800',55:'#948500',60:'#a29200',65:'#b19f00',70:'#bfac1a',75:'#ceba2c',80:'#ddc73c',85:'#ecd54a',90:'#fbe358',95:'#fff1bd',100:'#ffffff'}}},
  {name: 'Green', sourceHex: '#5DCE5F', tones: butterPalettes.green},
  {name: 'Cyan', sourceHex: '#60CFD3', tones: butterPalettes.cyan},
  {name: 'Teal', sourceHex: '#6CD9A8', tones: butterPalettes.teal},
  {name: 'Blue', sourceHex: '#5681FF', tones: butterPalettes.blue},
  {name: 'Purple', sourceHex: '#B780F6', tones: butterPalettes.purple},
  {name: 'Pink', sourceHex: '#F680E8', tones: butterPalettes.pink},
  {
    name: 'Error',
    sourceHex: '#FF5947',
    tones: butterPalettes.error,
    semantic: 'Error',
  },
  {
    name: 'Warning',
    sourceHex: '#F8C726',
    tones: butterPalettes.warning,
    semantic: 'Warning',
  },
  {
    name: 'Success',
    sourceHex: '#91D143',
    tones: butterPalettes.success,
    semantic: 'Success',
  },
];

const CORE = [
  {hex: '#225BFF', name: '#225BFF', dark: {hex: '#FDEE8C', name: '#FDEE8C'}},
  {hex: '#5681FF', name: '#5681FF', dark: {hex: '#EDD64B', name: '#EDD64B'}},
  {hex: '#FDEE8C', name: '#FDEE8C', dark: {hex: '#725538', name: '#725538'}},
  {hex: '#FDFBE4', name: '#FDFBE4', dark: {hex: '#36261C', name: '#36261C'}},
  {hex: '#FFFFFF', name: '#FFFFFF', dark: {hex: '#261A13', name: '#261A13'}},
];

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  margin: 0,
  marginBottom: 12,
};

function DisplayTextSection() {
  // Brand-blue in light mode, butter yellow in dark mode.
  const displayColor = 'light-dark(#225BFF, #FDEE8C)';
  return (
    <div>
      <h3 style={sectionTitle}>Display Text (Sarina)</h3>
      <XDSVStack gap={2}>
        <span
          style={{
            fontFamily: SARINA,
            fontSize: 83,
            fontWeight: 400,
            lineHeight: 1.15,
            color: displayColor,
          }}>
          Display 1
        </span>
        <span
          style={{
            fontFamily: SARINA,
            fontSize: 67,
            fontWeight: 400,
            lineHeight: 1.15,
            color: displayColor,
          }}>
          Display 2
        </span>
        <span
          style={{
            fontFamily: SARINA,
            fontSize: 53,
            fontWeight: 400,
            lineHeight: 1.2,
            color: displayColor,
          }}>
          Display 3
        </span>
      </XDSVStack>
    </div>
  );
}

export default function ButterPalettePage() {
  return (
    <ThemePalettePreview
      theme={butterTheme}
      title="Butter Theme Palette"
      subtitle="Golden buttery theme with blue accents. Sarina for Display, Outfit for headings and body."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
      leadingExtras={<DisplayTextSection />}
    />
  );
}
