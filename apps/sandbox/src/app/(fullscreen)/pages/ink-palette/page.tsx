'use client';

import {XDSVStack} from '@xds/core/Layout';
import {inkTheme} from '@xds/theme-ink/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const INK_DISPLAY =
  '"Manufacturing Consent", "UnifrakturMaguntia", "Old English Text MT", serif';

const TONAL_COLORS: TonalColor[] = [
  {name: 'Ink Neutral', sourceHex: '#96A0AB', note: 'cool blue-gray'},
  {name: 'Green', sourceHex: '#b3c79a', semantic: 'Success / sage moss'},
  {name: 'Red', sourceHex: '#c6a6a2', semantic: 'Error / dusty rose'},
  {name: 'Yellow', sourceHex: '#d3c490', semantic: 'Warning / aged gold'},
  {name: 'Blue', sourceHex: '#a3b5d6', note: 'periwinkle midnight'},
  {name: 'Purple', sourceHex: '#b29bc4', note: 'muted plum'},
  {name: 'Pink', sourceHex: '#c89aab', note: 'dusty rose'},
  {name: 'Cyan', sourceHex: '#a3c2cf', note: 'cathedral mist'},
  {name: 'Orange', sourceHex: '#d3b89a', note: 'warm tan'},
  {name: 'Teal', sourceHex: '#a3c2b6', note: 'sage verdigris'},
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
      <XDSVStack gap={2}>
        <span
          style={{
            fontFamily: INK_DISPLAY,
            fontSize: 72,
            fontWeight: 400,
            lineHeight: 1.1,
          }}>
          Display 1
        </span>
        <span
          style={{
            fontFamily: INK_DISPLAY,
            fontSize: 56,
            fontWeight: 400,
            lineHeight: 1.15,
          }}>
          Display 2
        </span>
        <span
          style={{
            fontFamily: INK_DISPLAY,
            fontSize: 44,
            fontWeight: 400,
            lineHeight: 1.2,
          }}>
          Display 3
        </span>
        <span
          style={{
            fontFamily: INK_DISPLAY,
            fontSize: 36,
            fontWeight: 400,
            lineHeight: 1.25,
            color: 'var(--color-text-secondary)',
            marginTop: 12,
          }}>
          Little joys, everywhere you go
        </span>
      </XDSVStack>
    </div>
  );
}

export default function InkPalettePage() {
  return (
    <ThemePalettePreview
      theme={inkTheme}
      title="Ink Theme Palette"
      subtitle="Dark-only theme — deep blue-gray surfaces, distressed display heading, dusty pastel categorical accents that read as illuminated panels against the dark page."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
      singleMode="dark"
      leadingExtras={<DisplayTextSection />}
    />
  );
}
