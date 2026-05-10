'use client';

// =============================================================================
// Y2K Theme Palette Preview
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
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {y2kTheme} from '@xds/theme-y2k';

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

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function passesAA(ratio: number): boolean {
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

// === Y2K palette data (mirrors packages/themes/y2k/src/y2kTheme.ts) ===

const TONAL_COLORS = [
  {name: 'Y2K Neutral', sourceHex: '#e7e1e4', note: 'H=340 C=3'},
  {name: 'Green', sourceHex: '#d7eaa8', semantic: 'Success'},
  {name: 'Red', sourceHex: '#ffd9d7', semantic: 'Error'},
  {name: 'Yellow', sourceHex: '#ffde9b', semantic: 'Warning'},
  {name: 'Blue', sourceHex: '#c4e7ff'},
  {name: 'Pink', sourceHex: '#ffd7e9'},
  {name: 'Purple', sourceHex: '#e6deff'},
  {name: 'Cyan', sourceHex: '#b9ede5'},
  {name: 'Orange', sourceHex: '#ffdbc3'},
  {name: 'Teal', sourceHex: '#c7eada'},
];

const CORE = [
  {hex: '#292427', name: 'Y2K 900'},
  {hex: '#625d60', name: 'Y2K 500'},
  {hex: '#d9d3d6', name: 'Y2K 300'},
  {hex: '#FFF6ED', name: 'Body Cream'},
  {hex: '#FFFFFF', name: 'White'},
];

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
const CRIMSON = "'Crimson Text', Georgia, 'Times New Roman', serif";

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
// Components
// =============================================================================

function CoreSection() {
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

function DisplayTextSection() {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Display Text (Crimson Text)</h3>
      <XDSVStack gap={2}>
        <span style={{fontFamily: CRIMSON, fontSize: 83, fontWeight: 400, lineHeight: 1.15}}>Display 1</span>
        <span style={{fontFamily: CRIMSON, fontSize: 67, fontWeight: 400, lineHeight: 1.15}}>Display 2</span>
        <span style={{fontFamily: CRIMSON, fontSize: 53, fontWeight: 400, lineHeight: 1.2}}>Display 3</span>
      </XDSVStack>
      <div style={{
        marginTop: 20,
        padding: 24,
        background: 'var(--color-background-card)',
        borderRadius: 16,
        border: '1px solid var(--color-border)',
      }}>
        <p style={{fontFamily: CRIMSON, fontSize: 67, fontWeight: 700, lineHeight: 1.15, margin: 0}}>
          Little <em style={{fontWeight: 400}}>joys,</em>
          <br />
          <em style={{fontWeight: 400}}>everywhere</em> you go
        </p>
        <XDSText type="body" color="secondary" as="p" style={{marginTop: 12, maxWidth: 340}}>
          The smallest details are the ones that matter most. Turn an
          ordinary day into something worth remembering.
        </XDSText>
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

const Y2K_COLORS = [
  {hex: '#2F292E', name: 'Charcoal'},
  {hex: '#605F65', name: 'Gray'},
  {hex: '#FDFCB8', name: 'Butter'},
  {hex: '#FFF6ED', name: 'Cream'},
  {hex: '#FFFFFF', name: 'White'},
  {hex: '#7B9900', name: 'Lime'},
  {hex: '#FFB600', name: 'Gold'},
  {hex: '#FD0000', name: 'Red'},
];

function ColorCardsSection() {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Colors</h3>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10}}>
        {Y2K_COLORS.map(c => (
          <div key={c.hex}>
            <div style={{
              background: c.hex,
              height: 72,
              border: '1px solid rgba(0,0,0,0.08)',
            }} />
            <div style={{fontFamily: MONO, fontSize: 10, lineHeight: 1.4, opacity: 0.7, marginTop: 6}}>
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
    <div style={S.section}>
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
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Progress</h3>
      <XDSVStack gap={3}>
        <XDSProgressBar value={75} label="Progress" hasValueLabel />
        <XDSProgressBar value={40} label="Upload" variant="success" hasValueLabel />
        <XDSProgressBar value={90} label="Storage" variant="warning" hasValueLabel />
        <XDSProgressBar value={20} label="Errors" variant="error" hasValueLabel />
        <XDSProgressBar isIndeterminate label="Loading..." />
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

function TonalSection() {
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
      {TONAL_COLORS.map(({name, sourceHex, semantic, note}) => {
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
        ● = token in use (T15 dark bg · T25 light text · T80 dark text · T90
        light bg)
      </p>
    </div>
  );
}

function ModeColumn({mode}: {mode: Mode}) {
  return (
    <XDSTheme theme={y2kTheme} mode={mode}>
      <XDSLayerProvider>
        <div style={S.modeCol(VAR_SURFACES.body, VAR_SURFACES.textPrimary)}>
          <p style={S.modeLabel}>{mode === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
          <ColorCardsSection />
          <CoreSection />
          <DisplayTextSection />
          <TextRampSection />
          <SemanticBadgeSection />
          <CategoricalBadgeSection />
          <BannerSection />
          <InputSection />
          <ButtonSection />
          <SpinnerSection />
          <ProgressBarSection />
          <SurfacesSection mode={mode} />
        </div>
      </XDSLayerProvider>
    </XDSTheme>
  );
}

export default function Y2kPalettePage() {
  return (
    <XDSTheme theme={y2kTheme} mode="light">
      <XDSLayerProvider>
        <div style={{...S.page, margin: -0, position: 'relative', zIndex: 1}}>
          <div style={S.inner}>
            <h1 style={S.title}>Y2K Theme Palette</h1>
            <p style={S.subtitle}>
              A bubbly, playful pop theme — hot pink body, lime green accents,
              Crimson Text headings + Poppins body.
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
