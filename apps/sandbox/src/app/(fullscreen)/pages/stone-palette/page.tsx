// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSVStack} from '@xds/core/Layout';
import {stoneTheme} from '@xds/theme-stone/built';
// `stonePalettes` is only exported from the source entry, not /built.
import {stonePalettes} from '@xds/theme-stone';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const MONTSERRAT =
  '"Montserrat", "Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Pass the canonical hand-tuned `stonePalettes` ramps to the audit
// drawer so its snap-to-ramp detector matches against the actual
// stone palette values. Without this, tokens whose values come from
// the canonical ramp show up as "off-ramp" against the pure HCT
// generator's slightly different ramp.
const TONAL_COLORS: TonalColor[] = [
  {name: 'Stone Neutral', sourceHex: '#e2e2e2', tones: stonePalettes.neutral},
  {name: 'Blue', sourceHex: '#d7e4f5', tones: stonePalettes.blue},
  {name: 'Cyan', sourceHex: '#cce8e5', tones: stonePalettes.cyan},
  {name: 'Green', sourceHex: '#d0e9ce', semantic: 'Success', tones: stonePalettes.green},
  {name: 'Teal', sourceHex: '#d4e7dc', tones: stonePalettes.teal},
  {name: 'Yellow', sourceHex: '#f4e1b7', semantic: 'Warning', tones: stonePalettes.yellow},
  {name: 'Orange', sourceHex: '#ffdcbb', tones: stonePalettes.orange},
  {name: 'Red', sourceHex: '#f9dcd7', semantic: 'Error', tones: stonePalettes.red},
  {name: 'Pink', sourceHex: '#f0dde8', tones: stonePalettes.pink},
  {name: 'Purple', sourceHex: '#e8dff3', tones: stonePalettes.purple},
];

const CORE = [
  {hex: '#28282A', name: 'Stone 900'},
  {hex: '#84848B', name: 'Stone 500'},
  {hex: '#D8D8DB', name: 'Stone 300'},
  {hex: '#f3f3f5', name: 'Stone 100'},
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
      <h3 style={sectionTitle}>Display Text (Montserrat)</h3>
      <XDSVStack gap={2}>
        <span
          style={{
            fontFamily: MONTSERRAT,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
          Display 1
        </span>
        <span
          style={{
            fontFamily: MONTSERRAT,
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}>
          Display 2
        </span>
        <span
          style={{
            fontFamily: MONTSERRAT,
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}>
          Display 3
        </span>
        <span
          style={{
            fontFamily: MONTSERRAT,
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.3,
            color: 'var(--color-text-secondary)',
            marginTop: 12,
          }}>
          Quietly hewn from sand and time
        </span>
      </XDSVStack>
    </div>
  );
}

export default function StonePalettePage() {
  return (
    <ThemePalettePreview
      theme={stoneTheme}
      title="Stone Theme Palette"
      subtitle="A warm, earthy neutral theme inspired by natural stone and sandstone. Light mode uses pastel T90 surfaces with T30 text; dark mode uses T35 surfaces with T90 text — same hex as the light-mode pastel, clean palette symmetry. Montserrat for headings and display, Figtree for body, JetBrains Mono for code."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
      leadingExtras={<DisplayTextSection />}
      shadowDescription="Three shadow levels — warm, low-alpha drop shadow stack using Stone 900. Plain drops in both modes (no inset bezel); dark surfaces lift via a slightly lighter card token rather than a shadow rim."
    />
  );
}
