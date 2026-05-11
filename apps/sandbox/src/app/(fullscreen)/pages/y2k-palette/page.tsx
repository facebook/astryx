'use client';

// =============================================================================
// Y2K Theme Palette Preview
// =============================================================================

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSCard} from '@xds/core/Card';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {y2kTheme} from '@xds/theme-y2k/built';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor, CoreSwatch} from '@/components/ThemePalettePreview';

const MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";
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

const CORE: CoreSwatch[] = [
  {hex: '#2d241b', name: 'Y2K 900'},
  {hex: '#675d52', name: 'Y2K 500'},
  {hex: '#d1c5b8', name: 'Y2K 300'},
  {hex: '#FFF6ED', name: 'Body Cream'},
  {hex: '#FFFFFF', name: 'White'},
];

const Y2K_COLORS = [
  {hex: '#C5E17A', name: 'Green'},
  {hex: '#FF9E9A', name: 'Red'},
  {hex: '#FFCC55', name: 'Yellow'},
  {hex: '#8ECFFF', name: 'Blue'},
  {hex: '#FFA0C8', name: 'Pink'},
  {hex: '#C0AAFF', name: 'Purple'},
  {hex: '#70E8D0', name: 'Cyan'},
  {hex: '#FFAA66', name: 'Orange'},
  {hex: '#78E0B0', name: 'Teal'},
  {hex: '#ede0d4', name: 'Gray'},
];

const CARD_VARIANTS = [
  'default',
  'muted',
  'blue',
  'cyan',
  'gray',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
] as const;

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
        <span
          style={{
            fontFamily: CRIMSON,
            fontSize: 83,
            fontWeight: 400,
            lineHeight: 1.15,
          }}>
          Display 1
        </span>
        <span
          style={{
            fontFamily: CRIMSON,
            fontSize: 67,
            fontWeight: 400,
            lineHeight: 1.15,
          }}>
          Display 2
        </span>
        <span
          style={{
            fontFamily: CRIMSON,
            fontSize: 53,
            fontWeight: 400,
            lineHeight: 1.2,
          }}>
          Display 3
        </span>
      </XDSVStack>
      <div
        style={{
          marginTop: 20,
          padding: 24,
          background: 'var(--color-background-card)',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
        }}>
        <p
          style={{
            fontFamily: CRIMSON,
            fontSize: 67,
            fontWeight: 700,
            lineHeight: 1.15,
            margin: 0,
          }}>
          Little <em style={{fontWeight: 400}}>joys,</em>
          <br />
          <em style={{fontWeight: 400}}>everywhere</em> you go
        </p>
        <XDSText
          type="body"
          color="secondary"
          as="p"
          style={{marginTop: 12, maxWidth: 340}}>
          The smallest details are the ones that matter most. Turn an ordinary
          day into something worth remembering.
        </XDSText>
      </div>
    </div>
  );
}

function ColorCardsSection() {
  return (
    <div>
      <h3 style={sectionTitle}>Colors</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
        }}>
        {Y2K_COLORS.map(c => (
          <div key={c.hex}>
            <div
              style={{
                background: c.hex,
                height: 72,
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            />
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                lineHeight: 1.4,
                opacity: 0.7,
                marginTop: 6,
              }}>
              <div>{c.name}</div>
              <div>{c.hex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpinnerSection() {
  return (
    <div>
      <h3 style={sectionTitle}>Spinners</h3>
      <XDSHStack gap={4} vAlign="center">
        <XDSSpinner size="sm" />
        <XDSSpinner size="md" />
        <XDSSpinner size="lg" />
      </XDSHStack>
    </div>
  );
}

function ProgressBarSection() {
  return (
    <div>
      <h3 style={sectionTitle}>Progress</h3>
      <XDSVStack gap={3}>
        <XDSProgressBar value={75} label="Progress" hasValueLabel />
        <XDSProgressBar
          value={40}
          label="Upload"
          variant="positive"
          hasValueLabel
        />
        <XDSProgressBar
          value={90}
          label="Storage"
          variant="warning"
          hasValueLabel
        />
        <XDSProgressBar
          value={20}
          label="Errors"
          variant="negative"
          hasValueLabel
        />
        <XDSProgressBar isIndeterminate label="Loading..." />
      </XDSVStack>
    </div>
  );
}

function ColorVariantsSection() {
  return (
    <div>
      <h3 style={sectionTitle}>Color Variants</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}>
        {CARD_VARIANTS.map(v => (
          <XDSCard key={v} variant={v} padding={2}>
            <XDSText type="supporting" weight="bold">
              {v}
            </XDSText>
          </XDSCard>
        ))}
      </div>
    </div>
  );
}

function Y2kExtras() {
  return (
    <>
      <ColorCardsSection />
      <DisplayTextSection />
      <SpinnerSection />
      <ProgressBarSection />
      <ColorVariantsSection />
    </>
  );
}

export default function Y2kPalettePage() {
  return (
    <ThemePalettePreview
      theme={y2kTheme}
      title="Y2K Theme Palette"
      subtitle="A bubbly, playful pop theme — hot pink body, lime green accents, Crimson Text headings + Poppins body."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
      extraSections={<Y2kExtras />}
    />
  );
}
