// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {VStack} from '@xds/core/Layout';
import {gothicTheme} from '@xds/theme-gothic/built';
// `gothicPalettes` is only exported from the source entry, not /built.
import {gothicPalettes} from '@xds/theme-gothic';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const GOTHIC =
  '"Manufacturing Consent", "UnifrakturMaguntia", "Old English Text MT", serif';

const TONAL_COLORS: TonalColor[] = [
  {name: 'Gothic Neutral', sourceHex: '#96A0AB', note: 'cool blue-gray', tones: gothicPalettes.neutral},
  {name: 'Green', sourceHex: '#b3c79a', semantic: 'Success / sage moss', tones: gothicPalettes.green},
  {name: 'Red', sourceHex: '#c6a6a2', semantic: 'Error / dusty rose', tones: gothicPalettes.red},
  {name: 'Yellow', sourceHex: '#d3c490', semantic: 'Warning / aged gold', tones: gothicPalettes.yellow},
  {name: 'Blue', sourceHex: '#a3b5d6', note: 'periwinkle midnight', tones: gothicPalettes.blue},
  {name: 'Purple', sourceHex: '#b29bc4', note: 'muted plum', tones: gothicPalettes.purple},
  {name: 'Pink', sourceHex: '#c89aab', note: 'dusty rose', tones: gothicPalettes.pink},
  {name: 'Cyan', sourceHex: '#a3c2cf', note: 'cathedral mist', tones: gothicPalettes.cyan},
  {name: 'Orange', sourceHex: '#d3b89a', note: 'warm tan', tones: gothicPalettes.orange},
  {name: 'Teal', sourceHex: '#a3c2b6', note: 'sage verdigris', tones: gothicPalettes.teal},
];

const CORE = [
  {hex: '#101314', name: 'Body / Surface'},
  {hex: '#1a1d20', name: 'Card'},
  {hex: '#24292D', name: 'Popover'},
  {hex: '#495056', name: 'Border emp.'},
  {hex: '#96A0AB', name: 'Text secondary'},
  {hex: '#E8F1F6', name: 'Text primary'},
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
      <h3 style={sectionTitle}>Display Text (Manufacturing Consent)</h3>
      <VStack gap={2}>
        <span
          style={{
            fontFamily: GOTHIC,
            fontSize: 72,
            fontWeight: 400,
            lineHeight: 1.1,
          }}>
          Display 1
        </span>
        <span
          style={{
            fontFamily: GOTHIC,
            fontSize: 56,
            fontWeight: 400,
            lineHeight: 1.15,
          }}>
          Display 2
        </span>
        <span
          style={{
            fontFamily: GOTHIC,
            fontSize: 44,
            fontWeight: 400,
            lineHeight: 1.2,
          }}>
          Display 3
        </span>
        <span
          style={{
            fontFamily: GOTHIC,
            fontSize: 36,
            fontWeight: 400,
            lineHeight: 1.25,
            color: 'var(--color-text-secondary)',
            marginTop: 12,
          }}>
          Little joys, everywhere you go
        </span>
      </VStack>
    </div>
  );
}

export default function GothicPalettePage() {
  return (
    <ThemePalettePreview
      theme={gothicTheme}
      title="Gothic Theme Palette"
      subtitle="Dark-only theme — deep blue-gray surfaces, distressed display heading, pastel categorical accents that glow against the dark page like illuminated panels."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
      singleMode="dark"
      leadingExtras={<DisplayTextSection />}
    />
  );
}
