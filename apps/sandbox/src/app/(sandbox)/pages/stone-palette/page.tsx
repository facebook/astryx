'use client';

// =============================================================================
// Stone Theme Palette Preview
// Uses real XDS components to render the theme as it would appear in production.
// =============================================================================

import {XDSBanner} from '@xds/core/Banner';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTheme} from '@xds/core/theme';
import {XDSLayerProvider} from '@xds/core/Layer';
import {stoneTheme} from '@xds/theme-stone/built';

// === WCAG contrast helpers ===

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').slice(0, 6);
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function _contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function _passesAA(ratio: number): boolean {
  return ratio >= 4.5;
}

// === HCT color space helpers for tonal palettes ===

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function linearToSrgb(c: number): number {
  const s =
    c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
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
function xyzToLab(
  x: number,
  y: number,
  z: number,
): [number, number, number] {
  const fx = labF(x / D65[0]),
    fy = labF(y / D65[1]),
    fz = labF(z / D65[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function labToXyz(
  L: number,
  a: number,
  b: number,
): [number, number, number] {
  const fy = (L + 16) / 116,
    fx = a / 500 + fy,
    fz = fy - b / 200;
  return [
    labFInv(fx) * D65[0],
    labFInv(fy) * D65[1],
    labFInv(fz) * D65[2],
  ];
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
    return (
      '#' +
      [g, g, g].map(c => c.toString(16).padStart(2, '0')).join('')
    );
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
        '#' +
        [r, g, bv].map(c => c.toString(16).padStart(2, '0')).join('');
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

const TONE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

function tonalPalette(
  hue: number,
  chroma: number,
): Record<number, string> {
  const result: Record<number, string> = {};
  for (const t of TONE_STEPS)
    result[t] = hctToHex({hue, chroma, tone: t});
  return result;
}

const TONAL_COLORS = [
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

// === Hardcoded Stone palette (mirror of packages/themes/stone/src/stoneTheme.ts) ===

const CORE = [
  {hex: '#28282A', name: 'Stone 900'},
  {hex: '#84848B', name: 'Stone 500'},
  {hex: '#D8D8DB', name: 'Stone 300'},
  {hex: '#f3f3f5', name: 'Stone 100'},
  {hex: '#FFFFFF', name: 'White'},
];

type Mode = 'light' | 'dark';

type Surfaces = typeof VAR_SURFACES;

// Surface colors read from CSS variables — no hardcoded hex values to drift.
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

interface BadgePair {
  label: string;
  bg: string;
  fg: string;
}

const _SEMANTIC: Record<Mode, BadgePair[]> = {
  light: [
    {label: 'Success', bg: '#d0e9ce', fg: '#374c36'},
    {label: 'Error', bg: '#f9dcd7', fg: '#58413e'},
    {label: 'Warning', bg: '#f4e1b7', fg: '#524622'},
    {label: 'Info', bg: '#d7e4f5', fg: '#3c4856'},
    {label: 'Neutral', bg: '#e3e2e0', fg: '#474745'},
  ],
  dark: [
    {label: 'Success', bg: '#2a4f2b', fg: '#a7d1a6'},
    {label: 'Error', bg: '#613d38', fg: '#e9bcb5'},
    {label: 'Warning', bg: '#554502', fg: '#dec47f'},
    {label: 'Info', bg: '#33485f', fg: '#b3c8e4'},
    {label: 'Neutral', bg: '#484744', fg: '#c8c6c3'},
  ],
};

const _CATEGORICAL: Record<Mode, BadgePair[]> = {
  light: [
    {label: 'Blue', bg: '#d7e4f5', fg: '#3c4856'},
    {label: 'Cyan', bg: '#cce8e5', fg: '#334b49'},
    {label: 'Gray', bg: '#e3e2e0', fg: '#474745'},
    {label: 'Green', bg: '#d0e9ce', fg: '#374c36'},
    {label: 'Orange', bg: '#ffdcbb', fg: '#5b4227'},
    {label: 'Pink', bg: '#f0dde8', fg: '#52424c'},
    {label: 'Purple', bg: '#e8dff3', fg: '#4b4454'},
    {label: 'Red', bg: '#f9dcd7', fg: '#58413e'},
    {label: 'Teal', bg: '#d4e7dc', fg: '#3b4a41'},
    {label: 'Yellow', bg: '#f4e1b7', fg: '#524622'},
  ],
  dark: [
    {label: 'Blue', bg: '#33485f', fg: '#b3c8e4'},
    {label: 'Cyan', bg: '#234e4b', fg: '#a2cfcb'},
    {label: 'Gray', bg: '#484744', fg: '#c8c6c3'},
    {label: 'Green', bg: '#2a4f2b', fg: '#a7d1a6'},
    {label: 'Orange', bg: '#643e0f', fg: '#f1bd88'},
    {label: 'Pink', bg: '#593f4f', fg: '#ddbed0'},
    {label: 'Purple', bg: '#4d425d', fg: '#cec1e1'},
    {label: 'Red', bg: '#613d38', fg: '#e9bcb5'},
    {label: 'Teal', bg: '#324c3e', fg: '#afcebb'},
    {label: 'Yellow', bg: '#554502', fg: '#dec47f'},
  ],
};

// =============================================================================
// Styles
// =============================================================================

const _FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
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
  badgeGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 12,
  } as React.CSSProperties,
  badgeCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: 4,
    minWidth: 110,
  } as React.CSSProperties,
  badge: (bg: string, fg: string) =>
    ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: 9999,
      background: bg,
      color: fg,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.5,
    }) as React.CSSProperties,
  contrastNote: (pass: boolean) =>
    ({
      fontFamily: MONO,
      fontSize: 10,
      opacity: 0.85,
      color: pass ? undefined : '#b5463a',
    }) as React.CSSProperties,
  buttonRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  primaryBtn: (s: Surfaces) =>
    ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 20px',
      borderRadius: 9999,
      background: s.accent,
      color: s.onAccent,
      border: 'none',
      fontSize: 13,
      fontWeight: 500,
      fontFamily: 'inherit',
      cursor: 'default',
    }) as React.CSSProperties,
  secondaryBtn: (s: Surfaces) =>
    ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6.5px 18.5px',
      borderRadius: 9999,
      background: 'transparent',
      color: s.textPrimary,
      border: `1.5px solid ${s.borderEmphasized}`,
      fontSize: 13,
      fontWeight: 500,
      fontFamily: 'inherit',
      cursor: 'default',
    }) as React.CSSProperties,
  ghostBtn: (s: Surfaces) =>
    ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 20px',
      borderRadius: 9999,
      background: 'transparent',
      color: s.textPrimary,
      border: 'none',
      fontSize: 13,
      fontWeight: 500,
      fontFamily: 'inherit',
      cursor: 'default',
    }) as React.CSSProperties,
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
// Component
// =============================================================================

function CoreSection({mode: _mode}: {mode: Mode}) {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Core Palette</h3>
      <div style={S.coreRow}>
        {CORE.map(c => (
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
        <XDSHStack gap={2} vAlign="end"><XDSHeading level={1}>Heading 1</XDSHeading><XDSText type="supporting" color="secondary">{sizes.h1}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="end"><XDSHeading level={2}>Heading 2</XDSHeading><XDSText type="supporting" color="secondary">{sizes.h2}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="end"><XDSHeading level={3}>Heading 3</XDSHeading><XDSText type="supporting" color="secondary">{sizes.h3}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="end"><XDSHeading level={4}>Heading 4</XDSHeading><XDSText type="supporting" color="secondary">{sizes.h4}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="end"><XDSText type="body">Body — primary</XDSText><XDSText type="supporting" color="secondary">{sizes.body}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="end"><XDSText type="body" color="secondary">Body — secondary</XDSText><XDSText type="supporting" color="secondary">{sizes.body}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="end"><XDSText type="supporting">Supporting</XDSText><XDSText type="supporting" color="secondary">{sizes.supporting}px</XDSText></XDSHStack>
        <XDSHStack gap={2} vAlign="end"><XDSText type="body" color="disabled">Disabled</XDSText><XDSText type="supporting" color="secondary">{sizes.body}px</XDSText></XDSHStack>
      </XDSVStack>
    </div>
  );
}

function SemanticBadgeSection() {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Semantic Badges</h3>
      <XDSHStack gap={2} wrap>
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
      <XDSHStack gap={2} wrap>
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
          <div style={{fontSize: 10, fontFamily: MONO, opacity: 0.6, marginBottom: 6}}>Default</div>
          <XDSHStack gap={3} vAlign="center">
            <XDSButton label="Primary" variant="primary" />
            <XDSButton label="Secondary" variant="secondary" />
            <XDSButton label="Ghost" variant="ghost" />
            <XDSButton label="Destructive" variant="destructive" />
          </XDSHStack>
        </div>
        <div>
          <div style={{fontSize: 10, fontFamily: MONO, opacity: 0.6, marginBottom: 6}}>Disabled</div>
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

function SurfacesSection({mode}: {mode: Mode}) {
  const ring =
    mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
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

function TonalSection() {
  const usedTones = [15, 25, 75, 80];
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
        Full HCT tonal ramps — 16 perceptually uniform steps from black (T0) to
        white (T100). Badge tokens use T75/T25 (light) and T15/T80 (dark).
      </p>
      {TONAL_COLORS.map(({name, sourceHex, semantic}) => {
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
                  {usedTones.includes(t) && (
                    <div style={S.markerDot(t)} />
                  )}
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
        ● = token in use (T15 dark bg · T25 light text · T75 light bg · T80
        dark text)
      </p>
    </div>
  );
}

function BannerSection() {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Banners</h3>
      <XDSVStack gap={2}>
        <XDSBanner status="info" title="Info banner title" description="Description text for the info state." />
        <XDSBanner status="success" title="Success banner title" description="Description text for the success state." />
        <XDSBanner status="warning" title="Warning banner title" description="Description text for the warning state." />
        <XDSBanner status="error" title="Error banner title" description="Description text for the error state." />
      </XDSVStack>
    </div>
  );
}

function InputSection() {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Inputs</h3>
      <XDSVStack gap={3}>
        <XDSTextInput label="Default" placeholder="Placeholder text" value="" onChange={() => {}} />
        <XDSTextInput label="Success" value="Valid input" onChange={() => {}} status={{type: 'success', message: 'Looks good!'}} />
        <XDSTextInput label="Error" value="Invalid input" onChange={() => {}} status={{type: 'error', message: 'This field is required.'}} />
        <XDSTextInput label="Warning" value="Risky value" onChange={() => {}} status={{type: 'warning', message: 'This value may cause issues.'}} />
        <XDSTextInput label="Disabled" value="Cannot edit" onChange={() => {}} isDisabled />
      </XDSVStack>
    </div>
  );
}

function ModeColumn({mode}: {mode: Mode}) {
  return (
    <XDSTheme theme={stoneTheme} mode={mode}>
      <XDSLayerProvider>
        <div style={S.modeCol(VAR_SURFACES.body, VAR_SURFACES.textPrimary)}>
          <p style={S.modeLabel}>{mode === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
          <CoreSection mode={mode} />
          <TextRampSection />
          <SemanticBadgeSection />
          <CategoricalBadgeSection />
          <BannerSection />
          <InputSection />
          <ButtonSection />
          <SurfacesSection mode={mode} />
        </div>
      </XDSLayerProvider>
    </XDSTheme>
  );
}

export default function StonePalettePage() {
  return (
    <XDSTheme theme={stoneTheme} mode="light">
      <XDSLayerProvider>
        <div style={S.page}>
          <div style={S.inner}>
            <h1 style={S.title}>Stone Theme Palette</h1>
            <p style={S.subtitle}>
              A snapshot of the warm, earthy Stone theme — every token rendered
              alongside its dark-mode counterpart.
            </p>
            <TonalSection />
            <div style={S.twoCol}>
              <ModeColumn mode="light" />
              <ModeColumn mode="dark" />
            </div>
          </div>
        </div>
      </XDSLayerProvider>
    </XDSTheme>
  );
}
