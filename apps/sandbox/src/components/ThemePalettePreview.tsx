'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSCard} from '@xds/core/Card';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTheme} from '@xds/core/theme';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {XDSLayerProvider} from '@xds/core/Layer';

// === HCT color space helpers for tonal palettes ===

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').slice(0, 6);
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function linearToSrgb(c: number): number {
  const s = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.min(255, Math.max(0, s * 255)));
}
function linearRgbToXyz(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  return [
    0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    0.2126729 * r + 0.7151522 * g + 0.072175 * b,
    0.0193339 * r + 0.119192 * g + 0.9503041 * b,
  ];
}
function xyzToLinearRgb(
  x: number,
  y: number,
  z: number,
): [number, number, number] {
  return [
    3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
    -0.969266 * x + 1.8760108 * y + 0.041556 * z,
    0.0556434 * x - 0.2040259 * y + 1.0572252 * z,
  ];
}
const D65: [number, number, number] = [0.95047, 1.0, 1.08883];
function labF(t: number): number {
  const d = 6 / 29;
  return t > d * d * d ? Math.cbrt(t) : t / (3 * d * d) + 4 / 29;
}
function labFInv(t: number): number {
  const d = 6 / 29;
  return t > d ? t * t * t : 3 * d * d * (t - 4 / 29);
}
function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  const fx = labF(x / D65[0]),
    fy = labF(y / D65[1]),
    fz = labF(z / D65[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function labToXyz(L: number, a: number, b: number): [number, number, number] {
  const fy = (L + 16) / 116,
    fx = a / 500 + fy,
    fz = fy - b / 200;
  return [labFInv(fx) * D65[0], labFInv(fy) * D65[1], labFInv(fz) * D65[2]];
}

interface HCT {
  hue: number;
  chroma: number;
  tone: number;
}

function hexToHct(hex: string): HCT {
  const [r, g, b] = hexToRgb(hex);
  const [x, y, z] = linearRgbToXyz(
    srgbToLinear(r),
    srgbToLinear(g),
    srgbToLinear(b),
  );
  const [L, a, bL] = xyzToLab(x, y, z);
  let hue = (Math.atan2(bL, a) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return {
    hue,
    chroma: Math.sqrt(a * a + bL * bL),
    tone: Math.max(0, Math.min(100, L)),
  };
}

function hctToHex({hue, chroma, tone}: HCT): string {
  if (tone <= 0) return '#000000';
  if (tone >= 100) return '#ffffff';
  if (chroma < 0.5) {
    const y = labFInv((tone + 16) / 116);
    const g = linearToSrgb(y);
    return '#' + [g, g, g].map(c => c.toString(16).padStart(2, '0')).join('');
  }
  let lo = 0,
    hi = chroma,
    best = '#000000';
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const hRad = (hue * Math.PI) / 180;
    const a = Math.cos(hRad) * mid,
      b = Math.sin(hRad) * mid;
    const [x, y, z] = labToXyz(tone, a, b);
    const [lr, lg, lb] = xyzToLinearRgb(x, y, z);
    const r = linearToSrgb(lr),
      g = linearToSrgb(lg),
      bv = linearToSrgb(lb);
    const ok =
      Math.abs(srgbToLinear(r) - lr) < 0.02 &&
      Math.abs(srgbToLinear(g) - lg) < 0.02 &&
      Math.abs(srgbToLinear(bv) - lb) < 0.02 &&
      r >= 0 &&
      r <= 255 &&
      g >= 0 &&
      g <= 255 &&
      bv >= 0 &&
      bv <= 255;
    if (ok) {
      best =
        '#' + [r, g, bv].map(c => c.toString(16).padStart(2, '0')).join('');
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

const TONE_STEPS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100,
];

function tonalPalette(hue: number, chroma: number): Record<number, string> {
  const result: Record<number, string> = {};
  const maxChroma = chroma * 1.8;
  for (const t of TONE_STEPS) {
    const boost = t < 50 ? 1 + (50 - t) / 40 : 1;
    result[t] = hctToHex({
      hue,
      chroma: Math.min(chroma * boost, maxChroma),
      tone: t,
    });
  }
  return result;
}

// =============================================================================
// Types & data
// =============================================================================

export interface TonalColor {
  name: string;
  sourceHex: string;
  semantic?: string;
  note?: string;
}

export interface CoreSwatch {
  hex: string;
  name: string;
}

export interface ThemePalettePreviewProps {
  /** The XDS theme object */
  theme: XDSDefinedTheme;
  /** Theme display name for the page title */
  title: string;
  /** Description subtitle */
  subtitle: string;
  /** Tonal color data for ramp display */
  tonalColors: TonalColor[];
  /** Core palette swatches */
  coreSwatches: CoreSwatch[];
  /** Additional sections to render at the end of each mode column */
  extraSections?: React.ReactNode;
}

type Mode = 'light' | 'dark';

const VAR_SURFACES = {
  body: 'var(--color-background-body)',
  surface: 'var(--color-background-surface)',
  card: 'var(--color-background-card)',
  border: 'var(--color-border)',
  borderEmphasized: 'var(--color-border-emphasized)',
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  accent: 'var(--color-accent)',
  onAccent: 'var(--color-on-accent)',
};

// =============================================================================
// Styles
// =============================================================================

const MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";

const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-body)',
    padding: '40px 32px',
  } as React.CSSProperties,
  inner: {
    maxWidth: 1280,
    margin: '0 auto',
  } as React.CSSProperties,
  title: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: 0,
    marginBottom: 8,
    fontFamily: 'var(--font-family-heading)',
  } as React.CSSProperties,
  subtitle: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    margin: 0,
    marginBottom: 32,
  } as React.CSSProperties,
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  } as React.CSSProperties,
  modeCol: (bg: string, fg: string) =>
    ({
      background: bg,
      color: fg,
      border: '1px solid var(--color-border)',
      borderRadius: 16,
      padding: 24,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 28,
    }) as React.CSSProperties,
  modeLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    margin: 0,
    marginBottom: 16,
    opacity: 0.6,
  } as React.CSSProperties,
  section: {} as React.CSSProperties,
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    margin: 0,
    marginBottom: 12,
  } as React.CSSProperties,
  coreRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 10,
  } as React.CSSProperties,
  coreSwatch: (bg: string) =>
    ({
      background: bg,
      borderRadius: 10,
      border: '1px solid rgba(0,0,0,0.08)',
      height: 88,
    }) as React.CSSProperties,
  coreMeta: {
    marginTop: 6,
    fontFamily: MONO,
    fontSize: 10,
    lineHeight: 1.4,
    opacity: 0.7,
  } as React.CSSProperties,
  surfacesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 8,
  } as React.CSSProperties,
  surfaceCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  } as React.CSSProperties,
  surfaceSwatch: (bg: string, ring: string) =>
    ({
      height: 56,
      background: bg,
      borderRadius: 8,
      border: `1px solid ${ring}`,
    }) as React.CSSProperties,
  surfaceMeta: {
    fontFamily: MONO,
    fontSize: 9.5,
    lineHeight: 1.3,
    opacity: 0.7,
  } as React.CSSProperties,
  tonalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  } as React.CSSProperties,
  tonalLabel: {
    width: 80,
    flexShrink: 0,
    fontSize: 10,
    fontFamily: MONO,
    opacity: 0.7,
  } as React.CSSProperties,
  tonalStrip: {
    display: 'flex',
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.06)',
  } as React.CSSProperties,
  tonalCell: (bg: string) =>
    ({
      flex: 1,
      height: 36,
      background: bg,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: 2,
    }) as React.CSSProperties,
  tonalNum: (tone: number) =>
    ({
      fontSize: 7,
      fontFamily: MONO,
      color: tone >= 50 ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)',
      pointerEvents: 'none' as const,
    }) as React.CSSProperties,
  tonalHct: {
    width: 60,
    flexShrink: 0,
    fontSize: 9,
    fontFamily: MONO,
    opacity: 0.5,
    textAlign: 'right' as const,
  } as React.CSSProperties,
  markerDot: (tone: number) =>
    ({
      position: 'absolute' as const,
      top: 2,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 6,
      height: 6,
      borderRadius: '50%',
      border: `1.5px solid ${tone >= 50 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'}`,
      background: tone >= 50 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)',
    }) as React.CSSProperties,
};

// =============================================================================
// Section components
// =============================================================================

function CoreSection({swatches}: {swatches: CoreSwatch[]}) {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Core Palette</h3>
      <div style={S.coreRow}>
        {swatches.map(c => (
          <div key={c.hex}>
            <div style={S.coreSwatch(c.hex)} />
            <div style={S.coreMeta}>
              <div>{c.name}</div>
              <div>{c.hex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextRampSection() {
  const base = 14;
  const ratio = 1.25;
  const sizes = {
    h1: (base * ratio ** 4).toFixed(1),
    h2: (base * ratio ** 3).toFixed(1),
    h3: (base * ratio ** 2).toFixed(1),
    h4: (base * ratio ** 1).toFixed(1),
    body: base.toFixed(1),
    supporting: '12.0',
  };
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Text Hierarchy (1.25 scale, 14px base)</h3>
      <XDSVStack gap={2}>
        <XDSHStack gap={2} vAlign="end">
          <XDSHeading level={1}>Heading 1</XDSHeading>
          <XDSText type="supporting" color="secondary">
            {sizes.h1}px
          </XDSText>
        </XDSHStack>
        <XDSHStack gap={2} vAlign="end">
          <XDSHeading level={2}>Heading 2</XDSHeading>
          <XDSText type="supporting" color="secondary">
            {sizes.h2}px
          </XDSText>
        </XDSHStack>
        <XDSHStack gap={2} vAlign="end">
          <XDSHeading level={3}>Heading 3</XDSHeading>
          <XDSText type="supporting" color="secondary">
            {sizes.h3}px
          </XDSText>
        </XDSHStack>
        <XDSHStack gap={2} vAlign="end">
          <XDSHeading level={4}>Heading 4</XDSHeading>
          <XDSText type="supporting" color="secondary">
            {sizes.h4}px
          </XDSText>
        </XDSHStack>
        <XDSHStack gap={2} vAlign="end">
          <XDSText type="body">Body — primary</XDSText>
          <XDSText type="supporting" color="secondary">
            {sizes.body}px
          </XDSText>
        </XDSHStack>
        <XDSHStack gap={2} vAlign="end">
          <XDSText type="body" color="secondary">
            Body — secondary
          </XDSText>
          <XDSText type="supporting" color="secondary">
            {sizes.body}px
          </XDSText>
        </XDSHStack>
        <XDSHStack gap={2} vAlign="end">
          <XDSText type="supporting">Supporting</XDSText>
          <XDSText type="supporting" color="secondary">
            {sizes.supporting}px
          </XDSText>
        </XDSHStack>
        <XDSHStack gap={2} vAlign="end">
          <XDSText type="body" color="disabled">
            Disabled
          </XDSText>
          <XDSText type="supporting" color="secondary">
            {sizes.body}px
          </XDSText>
        </XDSHStack>
      </XDSVStack>
    </div>
  );
}

function SemanticBadgeSection() {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Semantic Badges</h3>
      <XDSHStack gap={2} wrap="wrap">
        <XDSBadge variant="success" label="Success" />
        <XDSBadge variant="error" label="Error" />
        <XDSBadge variant="warning" label="Warning" />
        <XDSBadge variant="info" label="Info" />
        <XDSBadge variant="neutral" label="Neutral" />
      </XDSHStack>
    </div>
  );
}

function CategoricalBadgeSection() {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Categorical Badges</h3>
      <XDSHStack gap={2} wrap="wrap">
        <XDSBadge variant="blue" label="Blue" />
        <XDSBadge variant="cyan" label="Cyan" />
        <XDSBadge variant="green" label="Green" />
        <XDSBadge variant="orange" label="Orange" />
        <XDSBadge variant="pink" label="Pink" />
        <XDSBadge variant="purple" label="Purple" />
        <XDSBadge variant="red" label="Red" />
        <XDSBadge variant="teal" label="Teal" />
        <XDSBadge variant="yellow" label="Yellow" />
      </XDSHStack>
    </div>
  );
}

function ButtonSection() {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Buttons</h3>
      <XDSVStack gap={4}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO,
              opacity: 0.6,
              marginBottom: 6,
            }}>
            Default
          </div>
          <XDSHStack gap={3} vAlign="center">
            <XDSButton label="Primary" variant="primary" />
            <XDSButton label="Secondary" variant="secondary" />
            <XDSButton label="Ghost" variant="ghost" />
            <XDSButton label="Destructive" variant="destructive" />
          </XDSHStack>
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO,
              opacity: 0.6,
              marginBottom: 6,
            }}>
            Disabled
          </div>
          <XDSHStack gap={3} vAlign="center">
            <XDSButton label="Primary" variant="primary" isDisabled />
            <XDSButton label="Secondary" variant="secondary" isDisabled />
            <XDSButton label="Ghost" variant="ghost" isDisabled />
            <XDSButton label="Destructive" variant="destructive" isDisabled />
          </XDSHStack>
        </div>
      </XDSVStack>
    </div>
  );
}

function SpinnerSection() {
  return (
    <div>
      <h3 style={S.sectionTitle}>Spinners</h3>
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
      <h3 style={S.sectionTitle}>Progress</h3>
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
        <XDSProgressBar isIndeterminate label="Loading..." />
      </XDSVStack>
    </div>
  );
}

function CheckboxRadioSwitchSection() {
  return (
    <div>
      <h3 style={S.sectionTitle}>Controls</h3>
      <XDSVStack gap={4}>
        <XDSVStack gap={2}>
          <XDSCheckboxInput
            label="Enable notifications"
            value={true}
            onChange={() => {}}
          />
          <XDSCheckboxInput
            label="Auto-save drafts"
            value={false}
            onChange={() => {}}
          />
          <XDSCheckboxInput
            label="Show previews"
            value={true}
            onChange={() => {}}
            isDisabled
          />
        </XDSVStack>
        <XDSRadioList
          label="Display mode"
          value="comfortable"
          onChange={() => {}}>
          <XDSRadioListItem value="compact" label="Compact" />
          <XDSRadioListItem value="comfortable" label="Comfortable" />
          <XDSRadioListItem value="spacious" label="Spacious" />
        </XDSRadioList>
        <XDSVStack gap={2}>
          <XDSSwitch label="Dark mode" value={true} onChange={() => {}} />
          <XDSSwitch label="Reduce motion" value={false} onChange={() => {}} />
          <XDSSwitch
            label="High contrast"
            value={false}
            onChange={() => {}}
            isDisabled
          />
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}

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

function CardVariantsSection() {
  return (
    <div>
      <h3 style={S.sectionTitle}>Card Variants</h3>
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

function SurfacesSection({mode}: {mode: Mode}) {
  const ring = mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  const cells = [
    {label: 'border', hex: VAR_SURFACES.border},
    {label: 'border-emp', hex: VAR_SURFACES.borderEmphasized},
    {label: 'surface', hex: VAR_SURFACES.surface},
    {label: 'body', hex: VAR_SURFACES.body},
    {label: 'card', hex: VAR_SURFACES.card},
  ];
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Borders & Surfaces</h3>
      <div style={S.surfacesGrid}>
        {cells.map(c => (
          <div key={c.label} style={S.surfaceCell}>
            <div style={S.surfaceSwatch(c.hex, ring)} />
            <div style={S.surfaceMeta}>
              <div>{c.label}</div>
              <div>{c.hex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BannerSection() {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Banners</h3>
      <XDSVStack gap={2}>
        <XDSBanner
          status="info"
          title="Info banner title"
          description="Description text for the info state."
        />
        <XDSBanner
          status="success"
          title="Success banner title"
          description="Description text for the success state."
        />
        <XDSBanner
          status="warning"
          title="Warning banner title"
          description="Description text for the warning state."
        />
        <XDSBanner
          status="error"
          title="Error banner title"
          description="Description text for the error state."
        />
      </XDSVStack>
    </div>
  );
}

function InputSection() {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Inputs</h3>
      <XDSVStack gap={3}>
        <XDSTextInput
          label="Default"
          placeholder="Placeholder text"
          value=""
          onChange={() => {}}
        />
        <XDSTextInput
          label="Success"
          value="Valid input"
          onChange={() => {}}
          status={{type: 'success', message: 'Looks good!'}}
        />
        <XDSTextInput
          label="Error"
          value="Invalid input"
          onChange={() => {}}
          status={{type: 'error', message: 'This field is required.'}}
        />
        <XDSTextInput
          label="Warning"
          value="Risky value"
          onChange={() => {}}
          status={{type: 'warning', message: 'This value may cause issues.'}}
        />
        <XDSTextInput
          label="Disabled"
          value="Cannot edit"
          onChange={() => {}}
          isDisabled
        />
      </XDSVStack>
    </div>
  );
}

function TonalSection({colors}: {colors: TonalColor[]}) {
  const usedTones = [15, 25, 80, 90];
  return (
    <div style={{marginBottom: 40}}>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          margin: 0,
          marginBottom: 6,
          fontFamily: 'var(--font-family-heading)',
        }}>
        Tonal Palettes
      </h2>
      <p
        style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          margin: 0,
          marginBottom: 20,
        }}>
        Full HCT tonal ramps — 21 perceptually uniform steps from black (T0) to
        white (T100). Badge tokens use T90/T30 (light) and T70/T15 (dark).
      </p>
      {colors.map(({name, sourceHex, semantic, note}) => {
        const hct = hexToHct(sourceHex);
        const tones = tonalPalette(hct.hue, hct.chroma);
        return (
          <div key={name} style={S.tonalRow}>
            <span style={S.tonalLabel}>
              {name}
              {semantic && (
                <span style={{display: 'block', fontSize: 8, opacity: 0.5}}>
                  = {semantic}
                </span>
              )}
              {note && (
                <span style={{display: 'block', fontSize: 8, opacity: 0.5}}>
                  {note}
                </span>
              )}
            </span>
            <div style={S.tonalStrip}>
              {TONE_STEPS.map(t => (
                <div
                  key={t}
                  style={{
                    ...S.tonalCell(tones[t]),
                    position: 'relative' as const,
                  }}
                  title={`${name} T${t}: ${tones[t]}`}>
                  <span style={S.tonalNum(t)}>{t}</span>
                  {usedTones.includes(t) && <div style={S.markerDot(t)} />}
                </div>
              ))}
            </div>
            <span style={S.tonalHct}>
              H:{hct.hue.toFixed(0)} C:{hct.chroma.toFixed(0)}
            </span>
          </div>
        );
      })}
      <p
        style={{
          fontSize: 10,
          color: 'var(--color-text-secondary)',
          margin: 0,
          marginTop: 10,
          fontFamily: MONO,
        }}>
        ● = token in use (T15 dark bg · T25 light text · T80 dark text · T90
        light bg)
      </p>
    </div>
  );
}

function ModeColumn({
  theme,
  mode,
  coreSwatches,
  extraSections,
}: {
  theme: XDSDefinedTheme;
  mode: Mode;
  coreSwatches: CoreSwatch[];
  extraSections?: React.ReactNode;
}) {
  return (
    <XDSTheme theme={theme} mode={mode}>
      <XDSLayerProvider>
        <div style={S.modeCol(VAR_SURFACES.body, VAR_SURFACES.textPrimary)}>
          <p style={S.modeLabel}>
            {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
          </p>
          <CoreSection swatches={coreSwatches} />
          <TextRampSection />
          <SemanticBadgeSection />
          <CategoricalBadgeSection />
          <BannerSection />
          <InputSection />
          <ButtonSection />
          <SpinnerSection />
          <ProgressBarSection />
          <CheckboxRadioSwitchSection />
          <CardVariantsSection />
          <SurfacesSection mode={mode} />
          {extraSections}
        </div>
      </XDSLayerProvider>
    </XDSTheme>
  );
}

// =============================================================================
// Public component
// =============================================================================

export function ThemePalettePreview({
  theme,
  title,
  subtitle,
  tonalColors,
  coreSwatches,
  extraSections,
}: ThemePalettePreviewProps) {
  return (
    <XDSTheme theme={theme} mode="light">
      <XDSLayerProvider>
        <div style={{...S.page, margin: -0, position: 'relative', zIndex: 1}}>
          <div style={S.inner}>
            <h1 style={S.title}>{title}</h1>
            <p style={S.subtitle}>{subtitle}</p>
            <TonalSection colors={tonalColors} />
            <div style={S.twoCol}>
              <ModeColumn
                theme={theme}
                mode="light"
                coreSwatches={coreSwatches}
                extraSections={extraSections}
              />
              <ModeColumn
                theme={theme}
                mode="dark"
                coreSwatches={coreSwatches}
                extraSections={extraSections}
              />
            </div>
          </div>
        </div>
      </XDSLayerProvider>
    </XDSTheme>
  );
}
