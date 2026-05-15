'use client';

import {XDSVStack} from '@xds/core/Layout';
import {stoneTheme} from '@xds/theme-stone/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';

const MONTSERRAT =
  '"Montserrat", "Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const TONAL_COLORS: TonalColor[] = [
  {name: 'Stone Neutral', sourceHex: '#e2e2e2'},
  {name: 'Blue', sourceHex: '#d7e4f5'},
  {name: 'Cyan', sourceHex: '#cce8e5'},
  {name: 'Green', sourceHex: '#d0e9ce', semantic: 'Success'},
  {name: 'Teal', sourceHex: '#d4e7dc'},
  {name: 'Yellow', sourceHex: '#f4e1b7', semantic: 'Warning'},
  {name: 'Orange', sourceHex: '#ffdcbb'},
  {name: 'Red', sourceHex: '#f9dcd7', semantic: 'Error'},
  {name: 'Pink', sourceHex: '#f0dde8'},
  {name: 'Purple', sourceHex: '#e8dff3'},
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
