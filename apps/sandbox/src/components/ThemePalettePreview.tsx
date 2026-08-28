// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useMemo, useReducer, type CSSProperties} from 'react';

import {Banner, type BannerStatus} from '@astryxdesign/core/Banner';
import {ChatComposer} from '@astryxdesign/core/Chat';
import {Spinner} from '@astryxdesign/core/Spinner';
import {
  ProgressBar,
  type ProgressBarVariant,
} from '@astryxdesign/core/ProgressBar';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Switch} from '@astryxdesign/core/Switch';
import {Card} from '@astryxdesign/core/Card';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {TextInput} from '@astryxdesign/core/TextInput';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Theme} from '@astryxdesign/core/theme';
import {tokenDefaults, type DefinedTheme} from '@astryxdesign/core/theme';
import {LayerProvider} from '@astryxdesign/core/Layer';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

import {ThemeAuditDrawer, useThemeAudit} from './themePreview/ThemeAuditDrawer';
import {
  buildTonalUsageMap,
  tonalUsageKey,
  type TonalUsageMap,
} from './themePreview/themeAudit';
import {
  buildOverrideCSSVars,
  countOverrides,
  overridesReducer,
  type OverridesMap,
  type SerializeContext,
} from './themePreview/themeOverrides';

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
  if (hue < 0) {
    hue += 360;
  }
  return {
    hue,
    chroma: Math.sqrt(a * a + bL * bL),
    tone: Math.max(0, Math.min(100, L)),
  };
}

function hctToHex({hue, chroma, tone}: HCT): string {
  if (tone <= 0) {
    return '#000000';
  }
  if (tone >= 100) {
    return '#ffffff';
  }
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

/**
 * Dark-mode tonal palette per the audit rubric in issue #2150 §4:
 *   "Dark palette: chroma reduced ~15% across the ramp"
 *
 * Two transforms vs the canonical light ramp:
 *
 *   1. Tone lift: every stop shifts up by +5 tone units so mid-tones land
 *      brighter against the dark canvas. The lift tapers off between tone 80
 *      and tone 95 and is zero at tone 95+ so the top of the ramp does not
 *      collapse into pure white.
 *
 *   2. Chroma reduction: chroma multiplied by 0.85 across the whole ramp
 *      so saturated stops don't vibrate against the dark body — full
 *      saturation reads as neon at low surrounding luminance.
 *
 * Same low-tone chroma boost as the light ramp (low tones get extra
 * chroma so dark colored text stays visibly hued), gamut-clamped per-tone
 * via the binary search inside `hctToHex`.
 */
const DARK_TONE_LIFT = 5;
const DARK_LIFT_TAPER_START = 80;
const DARK_LIFT_TAPER_END = 95;
const DARK_CHROMA_FACTOR = 0.85;
function darkTonalPalette(hue: number, chroma: number): Record<number, string> {
  const adjustedChroma = chroma * DARK_CHROMA_FACTOR;
  const maxChroma = adjustedChroma * 1.8;
  const result: Record<number, string> = {};
  for (const t of TONE_STEPS) {
    let lift = DARK_TONE_LIFT;
    if (t >= DARK_LIFT_TAPER_END) {
      lift = 0;
    } else if (t > DARK_LIFT_TAPER_START) {
      const ratio =
        (DARK_LIFT_TAPER_END - t) /
        (DARK_LIFT_TAPER_END - DARK_LIFT_TAPER_START);
      lift = DARK_TONE_LIFT * ratio;
    }
    const liftedTone = Math.min(100, t + lift);
    const boost = liftedTone < 50 ? 1 + (50 - liftedTone) / 40 : 1;
    result[t] = hctToHex({
      hue,
      chroma: Math.min(adjustedChroma * boost, maxChroma),
      tone: liftedTone,
    });
  }
  return result;
}

/** Pick the per-mode ramp generator. Light keeps the canonical ramp. */
function tonalPaletteForMode(
  hue: number,
  chroma: number,
  mode: Mode,
): Record<number, string> {
  return mode === 'dark'
    ? darkTonalPalette(hue, chroma)
    : tonalPalette(hue, chroma);
}

// =============================================================================
// Types & data
// =============================================================================

export interface TonalColor {
  name: string;
  sourceHex: string;
  semantic?: string;
  note?: string;
  /**
   * Optional pre-computed canonical ramp keyed by palette stop (0-100).
   *
   * Two purposes, both served by the same field:
   *
   *   1. **Visible ramp accuracy** — when provided, the preview renders
   *      these exact values instead of deriving them from `sourceHex`
   *      via the built-in HCT algorithm, so the displayed strip stays
   *      in sync with the theme's own hand-tuned palette (card/badge
   *      variants visually match).
   *
   *   2. **Audit snap accuracy** — themes with hand-tuned palettes
   *      (stone, gothic, y2k, butter) export `*Palettes` objects whose
   *      values drift from the pure HCT generator by a couple of \u0394E
   *      units. The audit drawer uses these canonical values for
   *      snap-to-ramp matching so tokens whose values come from the
   *      canonical ramp don't show up as "off-ramp".
   *
   * Numeric keys are interpreted as palette stop labels; non-numeric keys
   * (e.g. `hue`, `chroma`) are ignored. This permissive shape matches
   * theme palette exports like `stonePalettes.red` (which carry both).
   *
   * Omit for themes that don't carry a custom-tuned ramp — the audit
   * + preview both fall back to generating the ramp from `sourceHex`
   * via HCT, which is correct for those themes (their tokens were
   * generated the same way).
   */
  tones?: Readonly<Record<string | number, string | number>>;
  /**
   * Optional dark-mode overrides. When present, these values replace
   * `sourceHex` and `tones` in the dark mode column — allowing fully
   * curated per-mode tonal ramps without duplicating the full array.
   */
  dark?: {
    sourceHex?: string;
    tones?: Readonly<Record<string | number, string | number>>;
  };
}

export interface CoreSwatch {
  hex: string;
  name: string;
  /** Optional dark-mode override. When present, replaces hex and name in the dark column. */
  dark?: {hex: string; name: string};
}

type Mode = 'light' | 'dark';
type ModeSection = React.ReactNode | ((mode: Mode) => React.ReactNode);

export interface ThemePalettePreviewProps {
  /** The Astryx theme object */
  theme: DefinedTheme;
  /** Theme display name for the page title */
  title: string;
  /** Description subtitle */
  subtitle: string;
  /** Tonal color data for ramp display */
  tonalColors: TonalColor[];
  /** Core palette swatches. When omitted, the Core Palette section is hidden. */
  coreSwatches?: CoreSwatch[];
  /** Additional sections to render at the end of each mode column */
  extraSections?: ModeSection;
  /** Additional sections to render before the headers (TextRampSection) in each mode column */
  leadingExtras?: ModeSection;
  /** Hide the title, subtitle, and tonal section (useful when embedded in another layout) */
  componentPreviewOnly?: boolean;
  /**
   * Render only one mode column instead of side-by-side light + dark.
   * Useful for single-mode themes (e.g. dark-only) where both columns
   * would render identically.
   */
  singleMode?: Mode;
  /**
   * Optional theme-specific paragraph rendered under the "Elevations"
   * section heading. Use this to describe the shadow design (e.g. "deepened
   * drop with all-around 1px white inset for a Figma-style bezel" for
   * neutral; "warm, low-alpha drop shadow stack" for stone). Defaults to a
   * generic description that's accurate for any theme.
   */
  shadowDescription?: string;
}

const VAR_SURFACES = {
  body: 'var(--color-background-body)',
  surface: 'var(--color-background-surface)',
  card: 'var(--color-background-card)',
  popover: 'var(--color-background-popover)',
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
    padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 32px)',
  } satisfies React.CSSProperties,
  inner: {
    width: '100%',
    minWidth: 0,
    maxWidth: 1280,
    margin: '0 auto',
  } satisfies React.CSSProperties,
  title: {
    fontSize: 'clamp(24px, 5vw, 32px)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: 0,
    marginBottom: 8,
    fontFamily: 'var(--font-family-heading)',
  } satisfies React.CSSProperties,
  subtitle: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    margin: 0,
    marginBottom: 32,
  } satisfies React.CSSProperties,
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))',
    gap: 'clamp(16px, 2vw, 24px)',
  } satisfies React.CSSProperties,
  modeCol: (bg: string, fg: string): React.CSSProperties => ({
    background: bg,
    color: fg,
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    padding: 'clamp(16px, 2vw, 24px)',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 28,
  }),
  modeLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    margin: 0,
    marginBottom: 16,
    opacity: 0.6,
  } satisfies React.CSSProperties,
  section: {} satisfies React.CSSProperties,
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    margin: 0,
    marginBottom: 12,
  } satisfies React.CSSProperties,
  coreRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 112px), 1fr))',
    gap: 10,
  } satisfies React.CSSProperties,
  coreSwatch: (bg: string): React.CSSProperties => ({
    background: bg,
    borderRadius: 10,
    border: '1px solid light-dark(rgba(0,0,0,0.08), rgba(255,255,255,0.15))',
    height: 88,
  }),
  coreMeta: {
    marginTop: 6,
    fontFamily: MONO,
    fontSize: 10,
    lineHeight: 1.4,
    opacity: 0.7,
  } satisfies React.CSSProperties,
  surfacesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 104px), 1fr))',
    gap: 8,
  } satisfies React.CSSProperties,
  surfaceCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  } satisfies React.CSSProperties,
  surfaceSwatch: (bg: string, ring: string): React.CSSProperties => ({
    height: 56,
    background: bg,
    borderRadius: 8,
    border: `1px solid ${ring}`,
  }),
  surfaceMeta: {
    fontFamily: MONO,
    fontSize: 9.5,
    lineHeight: 1.3,
    opacity: 0.7,
  } satisfies React.CSSProperties,
  tonalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  } satisfies React.CSSProperties,
  tonalLabel: {
    width: 80,
    flexShrink: 0,
    fontSize: 10,
    fontFamily: MONO,
    opacity: 0.7,
  } satisfies React.CSSProperties,
  tonalStrip: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    borderRadius: 6,
    overflowX: 'auto',
    overflowY: 'hidden',
    border: '1px solid rgba(0,0,0,0.06)',
  } satisfies React.CSSProperties,
  tonalCell: (bg: string): React.CSSProperties => ({
    flex: 1,
    minWidth: 24,
    height: 36,
    background: bg,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 2,
  }),
  tonalNum: (tone: number): React.CSSProperties => ({
    fontSize: 7,
    fontFamily: MONO,
    color: tone >= 50 ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)',
    pointerEvents: 'none' as const,
  }),
  tonalHct: {
    width: 60,
    flexShrink: 0,
    fontSize: 9,
    fontFamily: MONO,
    opacity: 0.5,
    textAlign: 'right' as const,
  } satisfies React.CSSProperties,
  markerDot: (tone: number): React.CSSProperties => ({
    position: 'absolute' as const,
    top: 2,
    left: '50%',
    transform: 'translateX(-50%)',
    minWidth: 8,
    height: 8,
    paddingInline: 2,
    borderRadius: 999,
    border: `1.5px solid ${tone >= 50 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)'}`,
    background: tone >= 50 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  }),
  // Pill shows the token count when more than one token snaps to the same
  // palette stop. Stays inside the marker dot so the strip layout is unchanged.
  markerCount: (tone: number): React.CSSProperties => ({
    fontSize: 7.5,
    fontWeight: 700,
    fontFamily: MONO,
    color: tone >= 50 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
    pointerEvents: 'none' as const,
  }),
};

// =============================================================================
// Section components
// =============================================================================

function CoreSection({swatches, mode}: {swatches: CoreSwatch[]; mode?: Mode}) {
  const isDark = mode === 'dark';
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Core Palette</h3>
      <div style={S.coreRow}>
        {swatches.map(c => {
          const hex = (isDark && c.dark?.hex) || c.hex;
          const name = (isDark && c.dark?.name) || c.name;
          return (
            <div key={hex}>
              <div style={S.coreSwatch(hex)} />
              <div style={S.coreMeta}>{name && <div>{name}</div>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TextRampSection({theme}: {theme: DefinedTheme}) {
  const sizes = {
    h1: theme.tokens['--text-heading-1-size'],
    h2: theme.tokens['--text-heading-2-size'],
    h3: theme.tokens['--text-heading-3-size'],
    h4: theme.tokens['--text-heading-4-size'],
    body: theme.tokens['--text-body-size'],
    supporting: theme.tokens['--text-supporting-size'],
  };
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Text Hierarchy</h3>
      <VStack gap={2}>
        <HStack gap={2} vAlign="end">
          <Heading level={1}>Heading 1</Heading>
          <Text type="supporting" color="secondary">
            {sizes.h1}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="end">
          <Heading level={2}>Heading 2</Heading>
          <Text type="supporting" color="secondary">
            {sizes.h2}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="end">
          <Heading level={3}>Heading 3</Heading>
          <Text type="supporting" color="secondary">
            {sizes.h3}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="end">
          <Heading level={4}>Heading 4</Heading>
          <Text type="supporting" color="secondary">
            {sizes.h4}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="end">
          <Text type="body">Body — primary</Text>
          <Text type="supporting" color="secondary">
            {sizes.body}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="end">
          <Text type="body" color="secondary">
            Body — secondary
          </Text>
          <Text type="supporting" color="secondary">
            {sizes.body}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="end">
          <Text type="supporting">Supporting</Text>
          <Text type="supporting" color="secondary">
            {sizes.supporting}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="end">
          <Text type="body" color="disabled">
            Disabled
          </Text>
          <Text type="supporting" color="secondary">
            {sizes.body}
          </Text>
        </HStack>
      </VStack>
    </div>
  );
}

const SEMANTIC_BADGE_VARIANTS = [
  'info',
  'success',
  'warning',
  'error',
  'neutral',
] as const satisfies readonly BadgeVariant[];

const CATEGORICAL_BADGE_VARIANTS = [
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
] as const satisfies readonly BadgeVariant[];

const TOKEN_COLORS = [
  'default',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
  'pink',
  'gray',
] as const satisfies readonly TokenColor[];

function BadgeContrastSection({
  title,
  variants,
  theme,
  mode,
}: {
  title: string;
  variants: readonly BadgeVariant[];
  theme: DefinedTheme;
  mode: Mode;
}) {
  const audit = getBadgeContrast(theme, mode, variants);
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>{title}</h3>
      <div style={{overflowX: 'auto'}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {[
                'Variant',
                'Rendered examples',
                'Worst placement',
                'Contrast',
                'Label',
                'Icon',
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign:
                      label === 'Contrast' ||
                      label === 'Label' ||
                      label === 'Icon'
                        ? 'right'
                        : 'left',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map(row => {
              const labelPasses = row.ratio != null && row.ratio >= 4.5;
              const iconPasses = row.ratio != null && row.ratio >= 3;
              return (
                <tr key={row.variant}>
                  <td style={{padding: '8px'}}>{row.name}</td>
                  <td style={{padding: '8px'}}>
                    <HStack gap={1} wrap="wrap">
                      <Badge variant={row.variant} label={row.name} />
                      <Badge
                        variant={row.variant}
                        icon={
                          <Icon
                            icon={row.variant === 'error' ? 'close' : 'check'}
                            size="xsm"
                          />
                        }
                        label={row.name}
                      />
                    </HStack>
                  </td>
                  <td style={{padding: '8px'}}>{row.surface ?? '—'}</td>
                  <td style={{padding: '8px', textAlign: 'right'}}>
                    {row.ratio == null ? '—' : `${row.ratio.toFixed(2)}:1`}
                  </td>
                  {[
                    {passes: labelPasses, requirement: '4.5:1'},
                    {passes: iconPasses, requirement: '3:1'},
                  ].map(({passes, requirement}) => (
                    <td
                      key={requirement}
                      style={{
                        padding: '8px',
                        textAlign: 'right',
                        color:
                          row.ratio == null
                            ? 'var(--color-text-secondary)'
                            : passes
                              ? 'var(--color-success)'
                              : 'var(--color-error)',
                        fontWeight: 700,
                      }}>
                      {row.ratio == null
                        ? 'Not measured'
                        : passes
                          ? `Pass ≥${requirement}`
                          : `Fail <${requirement}`}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        Badge labels require 4.5:1. Meaningful icons require 3:1. Icon defaults
        to the badge foreground, so both use the measured ratio shown here. The
        example icon is decorative because its visible label repeats the same
        meaning. If a consumer overrides the icon color, that color needs its
        own audit. The pill boundary is not measured separately because the
        visible label identifies the badge.
      </p>
    </div>
  );
}

function TokenContrastSection({
  theme,
  mode,
}: {
  theme: DefinedTheme;
  mode: Mode;
}) {
  const audit = getTokenContrast(theme, mode);
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Tokens</h3>
      <div style={{overflowX: 'auto'}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {[
                'Color',
                'Rendered examples',
                'Rest',
                'Hover',
                'Pressed',
                'WCAG',
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign:
                      label === 'Color' || label === 'Rendered examples'
                        ? 'left'
                        : 'right',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map(row => {
              const ratios = [row.rest, row.hover, row.pressed];
              const measured = ratios.every(
                (ratio): ratio is number => ratio != null,
              );
              const passes = measured && Math.min(...ratios) >= 4.5;
              return (
                <tr key={row.color}>
                  <td style={{padding: '8px'}}>{row.name}</td>
                  <td style={{padding: '8px'}}>
                    <HStack gap={1} wrap="wrap">
                      <Token color={row.color} label={row.name} />
                      <Token
                        color={row.color}
                        label={row.name}
                        icon={<Icon icon="check" size="xsm" />}
                        onClick={() => {}}
                        onRemove={() => {}}
                      />
                    </HStack>
                  </td>
                  {ratios.map((ratio, index) => (
                    <td
                      key={index}
                      style={{padding: '8px', textAlign: 'right'}}>
                      {ratio == null ? '—' : `${ratio.toFixed(2)}:1`}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: '8px',
                      textAlign: 'right',
                      color: !measured
                        ? 'var(--color-text-secondary)'
                        : passes
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {!measured ? 'Not measured' : passes ? 'Pass' : 'Fail'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        Colored Tokens use the same background/text pairs as categorical Badges;
        default and gray match the neutral Badge. Labels require 4.5:1 through
        rest, hover, and pressed states. Leading and remove icons inherit the
        same foreground and clear their 3:1 requirement whenever the label
        passes. Disabled Tokens are contrast-exempt.
      </p>
    </div>
  );
}

function StatusConsumerTable() {
  const getStatus = useCallback(
    (row: StatusAuditRow) => ({
      color: row.color,
      icon: row.icon,
      label: row.label,
    }),
    [],
  );
  const rowStatus = useTableRowStatus<StatusAuditRow>({getStatus});
  return (
    <Table
      data={STATUS_AUDIT_ROWS}
      columns={STATUS_AUDIT_COLUMNS}
      idKey="id"
      density="compact"
      plugins={{rowStatus}}
    />
  );
}

function StatusIndicatorSection({
  theme,
  mode,
}: {
  theme: DefinedTheme;
  mode: Mode;
}) {
  const audit = getStatusIndicatorContrast(theme, mode);
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Status indicators</h3>
      <p
        style={{
          margin: '0 0 20px',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        The same semantic hue families appear as standalone dots, Avatar
        presence, table-row signifiers, Stepper states, and chat delivery
        metadata. Filled indicators use Badge fill colors; glyphs and text use
        darker or lighter foreground stops chosen for their adjacent surface.
      </p>

      <h4 style={{margin: '0 0 10px', fontSize: 14}}>Semantic color roles</h4>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
          marginBottom: 24,
        }}>
        {[
          {
            role: 'Fill',
            consumers: 'Badge, StatusDot, filled AvatarStatusDot',
            rule: 'The semantic color is the component’s solid plate.',
          },
          {
            role: 'Foreground',
            consumers: 'Banner, Stepper, Table icons, chat status',
            rule: 'A darker or lighter semantic stop sits directly on a surface.',
          },
          {
            role: 'Surface',
            consumers: 'Banner and FieldStatus containers',
            rule: 'A low-emphasis tint supports semantic foreground content.',
          },
        ].map(item => (
          <div
            key={item.role}
            style={{
              padding: 12,
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              background: 'var(--color-background-card)',
            }}>
            <div style={{fontSize: 12, fontWeight: 700, marginBottom: 4}}>
              {item.role}
            </div>
            <div
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 10,
                lineHeight: 1.45,
              }}>
              {item.consumers}
              <br />
              {item.rule}
            </div>
          </div>
        ))}
      </div>

      <h4 style={{margin: '0 0 10px', fontSize: 14}}>Component previews</h4>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 12,
          alignItems: 'start',
        }}>
        <div
          style={{
            padding: 16,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
            minWidth: 0,
          }}>
          <div style={buttonRowLabelStyle}>StatusDot — default</div>
          <HStack gap={3} vAlign="center" wrap="wrap">
            {audit.statusDots.map(row => (
              <StatusDot
                key={row.variant}
                variant={row.variant}
                label={row.name}
              />
            ))}
          </HStack>
        </div>

        <div
          style={{
            padding: 16,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
            minWidth: 0,
          }}>
          <div style={buttonRowLabelStyle}>AvatarStatusDot</div>
          <HStack gap={3} wrap="wrap">
            {(['success', 'neutral', 'error'] as const).map(variant => (
              <VStack key={variant} gap={1} hAlign="center">
                <Avatar
                  name={variant}
                  size="lg"
                  status={<AvatarStatusDot variant={variant} label={variant} />}
                />
                <Text type="supporting">{variant}</Text>
              </VStack>
            ))}
          </HStack>
        </div>

        <div
          style={{
            gridColumn: '1 / -1',
            padding: 16,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
            minWidth: 0,
            overflowX: 'auto',
          }}>
          <div style={buttonRowLabelStyle}>Stepper status glyphs</div>
          <Stepper activeStep={3} orientation="horizontal">
            <Step step={0} label="Done" status="success" />
            <Step step={1} label="Review" status="warning" />
            <Step step={2} label="Blocked" status="error" />
            <Step step={3} label="Current" status="accent" />
          </Stepper>
        </div>

        <div
          style={{
            gridColumn: '1 / -1',
            padding: 16,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
            minWidth: 0,
            overflowX: 'auto',
          }}>
          <div style={buttonRowLabelStyle}>Table row status</div>
          <StatusConsumerTable />
        </div>

        <div
          style={{
            padding: 16,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
            minWidth: 0,
          }}>
          <div style={buttonRowLabelStyle}>ChatMessageMetadata</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
            {(['sending', 'sent', 'delivered', 'read', 'error'] as const).map(
              status => (
                <ChatMessage key={status} sender="assistant">
                  <ChatMessageMetadata status={status} />
                </ChatMessage>
              ),
            )}
          </div>
        </div>

        <div
          style={{
            padding: 16,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
            minWidth: 0,
          }}>
          <div style={buttonRowLabelStyle}>ChatToolCalls</div>
          <ChatToolCalls
            calls={[
              {name: 'search', target: 'status consumers', status: 'pending'},
              {name: 'audit', target: 'contrast pairs', status: 'running'},
              {
                name: 'test',
                target: 'neutral theme',
                status: 'complete',
              },
              {
                name: 'publish',
                target: 'preview',
                status: 'error',
                errorMessage: 'Example failure state',
              },
            ]}
          />
        </div>
      </div>

      <h4 style={{margin: '28px 0 6px', fontSize: 14}}>
        Existing standalone usage patterns
      </h4>
      <p
        style={{
          margin: '0 0 10px',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        These recreate current repository examples where nearby text identifies
        the object, but the dot is the only visible cue for its status.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 10,
        }}>
        <div
          style={{
            padding: 12,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
          }}>
          <div style={buttonRowLabelStyle}>Grouped table status cell</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '16px 64px minmax(0, 1fr)',
              gap: 8,
              alignItems: 'center',
            }}>
            <StatusDot variant="warning" label="In review" />
            <Text type="supporting" color="secondary">
              TASK-184
            </Text>
            <Text>Review palette</Text>
          </div>
        </div>

        <div
          style={{
            padding: 12,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
          }}>
          <div style={buttonRowLabelStyle}>Side navigation end content</div>
          <HStack gap={2} vAlign="center" hAlign="between">
            <Text>Design system</Text>
            <StatusDot variant="warning" label="Degraded" />
          </HStack>
        </div>

        <div
          style={{
            padding: 12,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
          }}>
          <div style={buttonRowLabelStyle}>Messaging header</div>
          <HStack gap={2} vAlign="center">
            <Text weight="bold"># product</Text>
            <div style={{flex: 1}} />
            <StatusDot variant="success" label="12 online" />
          </HStack>
        </div>

        <div
          style={{
            padding: 12,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
          }}>
          <div style={buttonRowLabelStyle}>Incident severity</div>
          <HStack gap={2} vAlign="center">
            <StatusDot variant="error" label="SEV1" isPulsing />
            <Text>Checkout latency</Text>
            <div style={{flex: 1}} />
            <Badge variant="warning" label="Investigating" />
          </HStack>
        </div>

        <div
          style={{
            padding: 12,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
          }}>
          <div style={buttonRowLabelStyle}>Monitoring tile</div>
          <HStack gap={2} vAlign="center">
            <StatusDot variant="error" label="Critical" isPulsing />
            <Text type="label" color="secondary">
              API latency
            </Text>
          </HStack>
          <div style={{fontSize: 22, fontWeight: 700, marginTop: 8}}>2.8s</div>
        </div>

        <div
          style={{
            padding: 12,
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            background: 'var(--color-background-card)',
          }}>
          <div style={buttonRowLabelStyle}>Tab end content</div>
          <HStack gap={4} vAlign="center" wrap="wrap">
            <HStack gap={1} vAlign="center">
              <Text>Production</Text>
              <StatusDot variant="success" label="Healthy" />
            </HStack>
            <HStack gap={1} vAlign="center">
              <Text>Staging</Text>
              <StatusDot variant="warning" label="Degraded" />
            </HStack>
          </HStack>
        </div>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-warning)',
          fontSize: 10,
          lineHeight: 1.5,
          fontWeight: 700,
        }}>
        In every example above, the status name is hidden from sighted users.
        Add visible status text or a distinct shape when the state matters.
      </p>

      <h4 style={{margin: '28px 0 6px', fontSize: 14}}>Contrast evaluation</h4>
      <p
        style={{
          margin: '0 0 10px',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        Measurements are listed separately from the rendered components so the
        visual review and the WCAG decision do not compete for space.
      </p>

      <div style={{overflowX: 'auto'}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {[
                'StatusDot',
                'Plate / parent',
                'Custom mark / plate',
                'Standalone use',
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign:
                      label === 'Plate / parent' ||
                      label === 'Custom mark / plate'
                        ? 'right'
                        : 'left',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.statusDots.map(row => {
              const standalonePasses =
                row.plateRatio != null && row.plateRatio >= 3;
              return (
                <tr key={row.variant}>
                  <td style={{padding: '8px'}}>{row.name}</td>
                  <td style={{padding: '8px', textAlign: 'right'}}>
                    {row.plateRatio == null
                      ? '—'
                      : `${row.plateRatio.toFixed(2)}:1`}
                  </td>
                  <td style={{padding: '8px', textAlign: 'right'}}>
                    {row.markRatio == null
                      ? '—'
                      : `${row.markRatio.toFixed(2)}:1`}
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      color: standalonePasses
                        ? 'var(--color-success)'
                        : 'var(--color-warning)',
                      fontWeight: 700,
                    }}>
                    {standalonePasses
                      ? 'Passes as a binary cue'
                      : 'Needs a label or custom mark'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p
        style={{
          margin: '8px 0 18px',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        StatusDot does not add an icon by default. With adjacent visible text,
        the plate is redundant and the text carries the status. The custom-icon
        slot is audited separately by the “custom mark / plate” ratio. A plain
        standalone dot is only sufficient for a binary present/absent cue and
        then its plate must reach 3:1 against the parent; an accessible name
        alone does not fix color-only meaning for sighted users.
      </p>

      <h4 style={{margin: '22px 0 6px', fontSize: 14}}>
        Consumer requirements
      </h4>
      <div style={{overflowX: 'auto'}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {[
                'Consumer',
                'Meaningful relationship',
                'Worst ratio',
                'Contrast',
                'Semantics',
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: label === 'Worst ratio' ? 'right' : 'left',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.consumers.map(row => {
              const passes = row.ratio != null && row.ratio >= row.minimum;
              return (
                <tr key={row.consumer}>
                  <td style={{padding: '8px'}}>{row.consumer}</td>
                  <td style={{padding: '8px'}}>{row.relationship}</td>
                  <td style={{padding: '8px', textAlign: 'right'}}>
                    {row.ratio == null ? '—' : `${row.ratio.toFixed(2)}:1`}
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      color: passes
                        ? 'var(--color-success)'
                        : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {passes ? 'Pass' : 'Fail'} ≥{row.minimum}:1
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      color: row.semanticsPass
                        ? 'var(--color-success)'
                        : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {row.semantics}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        AvatarStatusDot uses fill, ring, and minus shapes so status is not color
        alone. Table row status should use distinct icons when several statuses
        coexist; its required accessible label does not provide a visible
        non-color cue. Stepper status glyphs are visually meaningful even though
        hidden from assistive technology, which receives equivalent status text.
        Chat metadata includes visible text, so its 4.5:1 text result is the
        controlling requirement and the repeated icon is redundant.
        ChatToolCalls currently exposes error detail, while pending, running,
        and complete rely on their icon or generic Spinner name; those states
        need an explicit accessible status in a separate component fix. When a
        StatusDot or Badge is supplied through Button, Tab, SideNavHeading, or
        TopNavHeading end content, remeasure it against every host background
        and interaction state; slot ownership is not a contrast exception. The
        table-row plugin exposes separate dot and icon theme targets: semantic
        dots use the shared fill role, while semantic icons use the shared
        foreground role.
      </p>
    </div>
  );
}

const BUTTON_VARIANTS = [
  'primary',
  'secondary',
  'ghost',
  'destructive',
] as const;

const BUTTON_END_BADGES = {
  primary: 'info',
  secondary: 'neutral',
  ghost: 'info',
  destructive: 'error',
} as const;

function splitColorArgs(input: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;

  for (const char of input) {
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
    }

    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts;
}

function resolveThemeColor(
  theme: DefinedTheme,
  value: string,
  mode: Mode,
  local: Record<string, string | undefined> = {},
): string {
  const expression = value.trim();
  if (expression.startsWith('light-dark(')) {
    const choices = splitColorArgs(expression.slice('light-dark('.length, -1));
    return resolveThemeColor(
      theme,
      choices[mode === 'light' ? 0 : 1],
      mode,
      local,
    );
  }
  if (expression.startsWith('var(')) {
    const [name, fallback] = splitColorArgs(expression.slice(4, -1));
    const token =
      local[name] ?? theme.tokens[name] ?? tokenDefaults[name] ?? fallback;
    if (!token) {
      throw new Error(`Unable to resolve ${name}`);
    }
    return resolveThemeColor(theme, token, mode, local);
  }
  return expression;
}

interface RGBA {
  rgb: [number, number, number];
  alpha: number;
}

function parseColor(value: string): RGBA {
  const color = value.trim().toLowerCase();
  if (color === 'transparent') {
    return {rgb: [0, 0, 0], alpha: 0};
  }
  if (color === 'black') {
    return {rgb: [0, 0, 0], alpha: 1};
  }
  if (color === 'white') {
    return {rgb: [255, 255, 255], alpha: 1};
  }

  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const expanded =
      hex.length === 3 || hex.length === 4
        ? [...hex].map(character => character + character).join('')
        : hex;
    return {
      rgb: [0, 2, 4].map(index =>
        Number.parseInt(expanded.slice(index, index + 2), 16),
      ) as [number, number, number],
      alpha:
        expanded.length === 8
          ? Number.parseInt(expanded.slice(6, 8), 16) / 255
          : 1,
    };
  }

  const rgbMatch = color.match(/^rgba?\((.+)\)$/);
  if (rgbMatch) {
    const channels = rgbMatch[1]
      .replace('/', ' ')
      .split(/[\s,]+/)
      .filter(Boolean);
    return {
      rgb: channels.slice(0, 3).map(Number) as [number, number, number],
      alpha: channels[3] == null ? 1 : Number(channels[3]),
    };
  }

  throw new Error(`Unsupported contrast-audit color: ${value}`);
}

function compositeColor(foreground: string, background: string): string {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  return `#${fg.rgb
    .map((channel, index) =>
      Math.round(channel * fg.alpha + bg.rgb[index] * (1 - fg.alpha))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function mixColors(base: string, tint: string, tintWeight: number): string {
  const baseColor = parseColor(base);
  const tintColor = parseColor(tint);
  return `#${baseColor.rgb
    .map((channel, index) =>
      Math.round(channel * (1 - tintWeight) + tintColor.rgb[index] * tintWeight)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function relativeLuminance(color: string): number {
  const channels = parseColor(color).rgb.map(channel => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
  const values = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function resolveToken(theme: DefinedTheme, name: string, mode: Mode): string {
  const value = theme.tokens[name] ?? tokenDefaults[name];
  if (!value) {
    throw new Error(`Unable to resolve ${name}`);
  }
  return resolveThemeColor(theme, value, mode);
}

const BADGE_DEFAULTS = {
  neutral: {
    backgroundColor: 'var(--color-neutral)',
    color: 'var(--color-text-primary)',
  },
  info: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  success: {
    backgroundColor: 'var(--color-success)',
    color: 'var(--color-on-success)',
  },
  warning: {
    backgroundColor: 'var(--color-warning)',
    color: 'var(--color-on-warning)',
  },
  error: {
    backgroundColor: 'var(--color-error)',
    color: 'var(--color-on-error)',
  },
  blue: {
    backgroundColor: 'var(--color-background-blue)',
    color: 'var(--color-text-blue)',
  },
  cyan: {
    backgroundColor: 'var(--color-background-cyan)',
    color: 'var(--color-text-cyan)',
  },
  green: {
    backgroundColor: 'var(--color-background-green)',
    color: 'var(--color-text-green)',
  },
  orange: {
    backgroundColor: 'var(--color-background-orange)',
    color: 'var(--color-text-orange)',
  },
  pink: {
    backgroundColor: 'var(--color-background-pink)',
    color: 'var(--color-text-pink)',
  },
  purple: {
    backgroundColor: 'var(--color-background-purple)',
    color: 'var(--color-text-purple)',
  },
  red: {
    backgroundColor: 'var(--color-background-red)',
    color: 'var(--color-text-red)',
  },
  teal: {
    backgroundColor: 'var(--color-background-teal)',
    color: 'var(--color-text-teal)',
  },
  yellow: {
    backgroundColor: 'var(--color-background-yellow)',
    color: 'var(--color-text-yellow)',
  },
} as const;

const TOKEN_DEFAULTS = {
  default: {
    backgroundColor: 'var(--color-neutral)',
    color: 'var(--color-text-primary)',
  },
  red: BADGE_DEFAULTS.red,
  orange: BADGE_DEFAULTS.orange,
  yellow: BADGE_DEFAULTS.yellow,
  green: BADGE_DEFAULTS.green,
  teal: BADGE_DEFAULTS.teal,
  cyan: BADGE_DEFAULTS.cyan,
  blue: BADGE_DEFAULTS.blue,
  purple: BADGE_DEFAULTS.purple,
  pink: BADGE_DEFAULTS.pink,
  gray: {
    backgroundColor: 'var(--color-background-gray)',
    color: 'var(--color-text-gray)',
  },
} as const;

function getBadgeContrast(
  theme: DefinedTheme,
  mode: Mode,
  variants: readonly BadgeVariant[],
) {
  const surfaces = [
    ['Body', '--color-background-body'],
    ['Surface', '--color-background-surface'],
    ['Card', '--color-background-card'],
  ] as const;

  return variants.map(variant => {
    try {
      const defaults = BADGE_DEFAULTS[variant as keyof typeof BADGE_DEFAULTS];
      if (!defaults) {
        throw new Error(`No audit defaults for badge variant ${variant}`);
      }
      const badgeBlock = theme.components?.badge ?? {};
      const override = badgeBlock[`variant:${variant}`] ?? {};
      const foreground = resolveThemeColor(
        theme,
        String(override.color ?? badgeBlock.color ?? defaults.color),
        mode,
      );
      const background = resolveThemeColor(
        theme,
        String(
          override.backgroundColor ??
            badgeBlock.backgroundColor ??
            defaults.backgroundColor,
        ),
        mode,
      );
      const placements = surfaces.map(([name, token]) => {
        const parent = resolveToken(theme, token, mode);
        const resolvedBackground = compositeColor(background, parent);
        const resolvedForeground = compositeColor(
          foreground,
          resolvedBackground,
        );
        return {
          name,
          ratio: contrastRatio(resolvedForeground, resolvedBackground),
        };
      });
      const weakest = placements.reduce((minimum, placement) =>
        placement.ratio < minimum.ratio ? placement : minimum,
      );

      return {
        variant,
        name: variant[0].toUpperCase() + variant.slice(1),
        surface: weakest.name,
        ratio: weakest.ratio,
      };
    } catch {
      // Keep unsupported color syntax renderable without reporting a ratio.
      return {
        variant,
        name: variant[0].toUpperCase() + variant.slice(1),
        surface: undefined,
        ratio: undefined,
      };
    }
  });
}

function getTokenContrast(theme: DefinedTheme, mode: Mode) {
  const surfaces = [
    '--color-background-body',
    '--color-background-surface',
    '--color-background-card',
  ] as const;

  return TOKEN_COLORS.map(color => {
    try {
      const defaults = TOKEN_DEFAULTS[color];
      const tokenBlock = theme.components?.token ?? {};
      const override = tokenBlock[`color:${color}`] ?? {};
      const foreground = resolveThemeColor(
        theme,
        String(override.color ?? tokenBlock.color ?? defaults.color),
        mode,
      );
      const background = resolveThemeColor(
        theme,
        String(
          override.backgroundColor ??
            tokenBlock.backgroundColor ??
            defaults.backgroundColor,
        ),
        mode,
      );
      const hover = resolveToken(theme, '--color-overlay-hover', mode);
      const pressed = resolveToken(theme, '--color-overlay-pressed', mode);
      const ratio = (overlay?: string) =>
        Math.min(
          ...surfaces.map(surfaceToken => {
            const parent = resolveToken(theme, surfaceToken, mode);
            const base = compositeColor(background, parent);
            const stateBackground = overlay
              ? compositeColor(overlay, base)
              : base;
            const resolvedForeground = compositeColor(
              foreground,
              stateBackground,
            );
            return contrastRatio(resolvedForeground, stateBackground);
          }),
        );

      return {
        color,
        name: color[0].toUpperCase() + color.slice(1),
        rest: ratio(),
        hover: ratio(hover),
        pressed: ratio(pressed),
      };
    } catch {
      return {
        color,
        name: color[0].toUpperCase() + color.slice(1),
        rest: undefined,
        hover: undefined,
        pressed: undefined,
      };
    }
  });
}

const STATUS_DOT_DEFAULTS = {
  accent: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  success: {
    backgroundColor: 'var(--color-success)',
    color: 'var(--color-on-success)',
  },
  warning: {
    backgroundColor: 'var(--color-warning)',
    color: 'var(--color-on-warning)',
  },
  error: {
    backgroundColor: 'var(--color-error)',
    color: 'var(--color-on-error)',
  },
  neutral: {
    backgroundColor: 'var(--color-icon-secondary)',
    color: 'var(--color-background-surface)',
  },
} as const;

function getStatusIndicatorContrast(theme: DefinedTheme, mode: Mode) {
  const parentTokens = [
    '--color-background-body',
    '--color-background-surface',
    '--color-background-card',
  ] as const;
  const minimumAgainstParents = (foreground: string) =>
    Math.min(
      ...parentTokens.map(parentToken => {
        const parent = resolveToken(theme, parentToken, mode);
        return contrastRatio(compositeColor(foreground, parent), parent);
      }),
    );

  const statusDots = STATUS_DOT_VARIANTS.map(variant => {
    try {
      const statusBlock = theme.components?.['status-dot'] ?? {};
      const base = statusBlock.base ?? {};
      const override = statusBlock[`variant:${variant}`] ?? {};
      const local = Object.fromEntries(
        Object.entries({...base, ...override}).filter(
          (entry): entry is [string, string] =>
            entry[0].startsWith('--') && typeof entry[1] === 'string',
        ),
      );
      const plate = resolveThemeColor(
        theme,
        String(
          override.backgroundColor ??
            base.backgroundColor ??
            STATUS_DOT_DEFAULTS[variant].backgroundColor,
        ),
        mode,
        local,
      );
      const mark = resolveThemeColor(
        theme,
        String(
          override.color ?? base.color ?? STATUS_DOT_DEFAULTS[variant].color,
        ),
        mode,
        local,
      );
      const resolvedParent = resolveToken(
        theme,
        '--color-background-surface',
        mode,
      );
      const resolvedPlate = compositeColor(plate, resolvedParent);
      return {
        variant,
        name: variant[0].toUpperCase() + variant.slice(1),
        plateRatio: minimumAgainstParents(plate),
        markRatio: contrastRatio(
          compositeColor(mark, resolvedPlate),
          resolvedPlate,
        ),
      };
    } catch {
      return {
        variant,
        name: variant[0].toUpperCase() + variant.slice(1),
        plateRatio: undefined,
        markRatio: undefined,
      };
    }
  });

  const avatarVariants = [
    {
      variant: 'success',
      backgroundColor: 'var(--color-success)',
      color: 'var(--color-background-surface)',
      relationship: 'filled plate / separator',
    },
    {
      variant: 'neutral',
      backgroundColor: 'var(--color-background-surface)',
      color: 'var(--color-text-secondary)',
      relationship: 'ring / plate',
    },
    {
      variant: 'error',
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-background-surface)',
      relationship: 'plate / separator and minus / plate',
    },
  ] as const;
  const avatarRatios = avatarVariants.map(item => {
    const block = theme.components?.['avatar-status-dot'] ?? {};
    const base = block.base ?? {};
    const override = block[`variant:${item.variant}`] ?? {};
    const local = Object.fromEntries(
      Object.entries({...base, ...override}).filter(
        (entry): entry is [string, string] =>
          entry[0].startsWith('--') && typeof entry[1] === 'string',
      ),
    );
    const plate = resolveThemeColor(
      theme,
      String(
        override.backgroundColor ??
          base.backgroundColor ??
          item.backgroundColor,
      ),
      mode,
      local,
    );
    const mark = resolveThemeColor(
      theme,
      String(override.color ?? base.color ?? item.color),
      mode,
      local,
    );
    const separator = resolveThemeColor(
      theme,
      String(
        override.borderColor ??
          base.borderColor ??
          'var(--color-background-surface)',
      ),
      mode,
      local,
    );
    const resolvedPlate = compositeColor(plate, separator);
    const plateRatio = contrastRatio(resolvedPlate, separator);
    const markRatio = contrastRatio(
      compositeColor(mark, resolvedPlate),
      resolvedPlate,
    );
    return item.variant === 'neutral'
      ? markRatio
      : item.variant === 'error'
        ? Math.min(plateRatio, markRatio)
        : plateRatio;
  });

  const stepIndicatorBlock = theme.components?.['step-indicator'] ?? {};
  const stepIndicatorRatios = (
    [
      ['accent', '--color-accent'],
      ['success', '--color-success'],
      ['warning', '--color-warning'],
      ['error', '--color-error'],
    ] as const
  ).map(([status, token]) => {
    const local = Object.fromEntries(
      Object.entries({
        ...(stepIndicatorBlock.base ?? {}),
        ...(stepIndicatorBlock[`status:${status}`] ?? {}),
      }).filter(
        (entry): entry is [string, string] =>
          entry[0].startsWith('--') && typeof entry[1] === 'string',
      ),
    );
    return minimumAgainstParents(
      resolveThemeColor(theme, `var(${token})`, mode, local),
    );
  });
  const stepperRatio = Math.min(...stepIndicatorRatios);

  const tableStatusBlock = theme.components?.['table-row-status'] ?? {};
  const tableStatusRatio = Math.min(
    ...(
      [
        ['accent', '--color-accent'],
        ['success', '--color-success'],
        ['warning', '--color-warning'],
        ['error', '--color-error'],
        ['gray', '--color-icon-gray'],
      ] as const
    ).map(([color, token]) => {
      const local = Object.fromEntries(
        Object.entries({
          ...(tableStatusBlock.base ?? {}),
          ...(tableStatusBlock[`color:${color}+presentation:icon`] ?? {}),
        }).filter(
          (entry): entry is [string, string] =>
            entry[0].startsWith('--') && typeof entry[1] === 'string',
        ),
      );
      return minimumAgainstParents(
        resolveThemeColor(theme, `var(${token})`, mode, local),
      );
    }),
  );

  const chatMetadataBlock = theme.components?.['chat-message-metadata'] ?? {};
  const chatMetadataLocal = Object.fromEntries(
    Object.entries(chatMetadataBlock.base ?? {}).filter(
      (entry): entry is [string, string] =>
        entry[0].startsWith('--') && typeof entry[1] === 'string',
    ),
  );
  const chatRatio = Math.min(
    minimumAgainstParents(resolveToken(theme, '--color-text-secondary', mode)),
    minimumAgainstParents(
      resolveThemeColor(theme, 'var(--color-error)', mode, chatMetadataLocal),
    ),
  );

  const chatToolBlock = theme.components?.['chat-tool-calls'] ?? {};
  const chatToolLocal = Object.fromEntries(
    Object.entries(chatToolBlock.base ?? {}).filter(
      (entry): entry is [string, string] =>
        entry[0].startsWith('--') && typeof entry[1] === 'string',
    ),
  );
  const toolStatusRatio = Math.min(
    minimumAgainstParents(resolveToken(theme, '--color-text-secondary', mode)),
    ...(['--color-success', '--color-error'] as const).flatMap(token => {
      const foreground = resolveThemeColor(
        theme,
        `var(${token})`,
        mode,
        chatToolLocal,
      );
      const channels = parseColor(foreground).rgb.join(', ');
      return parentTokens.map(parentToken => {
        const parent = resolveToken(theme, parentToken, mode);
        const plate = compositeColor(`rgba(${channels}, 0.15)`, parent);
        return contrastRatio(foreground, plate);
      });
    }),
  );

  return {
    statusDots,
    consumers: [
      {
        consumer: 'AvatarStatusDot',
        relationship: 'built-in fill, ring, or minus against its plate',
        ratio: Math.min(...avatarRatios),
        minimum: 3,
        semantics: 'Pass when label is supplied',
        semanticsPass: true,
      },
      {
        consumer: 'Stepper',
        relationship: 'semantic status glyph against parent surface',
        ratio: stepperRatio,
        minimum: 3,
        semantics: 'Pass: shape + hidden status text',
        semanticsPass: true,
      },
      {
        consumer: 'Table row status',
        relationship: 'semantic status icon against row surface',
        ratio: tableStatusRatio,
        minimum: 3,
        semantics: 'Pass here with icon + label',
        semanticsPass: true,
      },
      {
        consumer: 'ChatMessageMetadata',
        relationship: 'visible status label against message parent',
        ratio: chatRatio,
        minimum: 4.5,
        semantics: 'Pass: visible + accessible label',
        semanticsPass: true,
      },
      {
        consumer: 'ChatToolCalls',
        relationship: 'status icon / tinted plate or spinner / row surface',
        ratio: toolStatusRatio,
        minimum: 3,
        semantics: 'Gap: non-error status is not named',
        semanticsPass: false,
      },
    ],
  };
}

const BANNER_DEFAULTS = {
  info: {
    backgroundColor: 'var(--color-accent-muted)',
    iconColor: 'var(--color-accent)',
  },
  success: {
    backgroundColor: 'var(--color-success-muted)',
    iconColor: 'var(--color-success)',
  },
  warning: {
    backgroundColor: 'var(--color-warning-muted)',
    iconColor: 'var(--color-warning)',
  },
  error: {
    backgroundColor: 'var(--color-error-muted)',
    iconColor: 'var(--color-error)',
  },
} as const;

const FIELD_STATUS_TYPES = ['success', 'warning', 'error'] as const;

const FIELD_STATUS_DEFAULTS = {
  success: {
    backgroundColor: 'var(--color-success-muted)',
    color: 'var(--color-text-green)',
  },
  warning: {
    backgroundColor: 'var(--color-warning-muted)',
    color: 'var(--color-text-yellow)',
  },
  error: {
    backgroundColor: 'var(--color-error-muted)',
    color: 'var(--color-text-red)',
  },
} as const;

function getFieldStatusContrast(theme: DefinedTheme, mode: Mode) {
  const surfaces = [
    '--color-background-body',
    '--color-background-surface',
    '--color-background-card',
  ] as const;

  return FIELD_STATUS_TYPES.map(status => {
    try {
      const fieldStatusBlock = theme.components?.['field-status'] ?? {};
      const statusOverride = fieldStatusBlock[`type:${status}`] ?? {};
      const local = Object.fromEntries(
        Object.entries({...fieldStatusBlock.base, ...statusOverride}).filter(
          (entry): entry is [string, string] =>
            entry[0].startsWith('--') && typeof entry[1] === 'string',
        ),
      );
      const foreground = resolveThemeColor(
        theme,
        String(
          statusOverride.color ??
            fieldStatusBlock.color ??
            FIELD_STATUS_DEFAULTS[status].color,
        ),
        mode,
        local,
      );
      const background = resolveThemeColor(
        theme,
        String(
          statusOverride.backgroundColor ??
            fieldStatusBlock.backgroundColor ??
            FIELD_STATUS_DEFAULTS[status].backgroundColor,
        ),
        mode,
        local,
      );
      const ratio = Math.min(
        ...surfaces.map(surfaceToken => {
          const parent = resolveToken(theme, surfaceToken, mode);
          const resolvedBackground = compositeColor(background, parent);
          return contrastRatio(
            compositeColor(foreground, resolvedBackground),
            resolvedBackground,
          );
        }),
      );

      const bannerBlock = theme.components?.banner ?? {};
      const bannerOverride = bannerBlock[`status:${status}`] ?? {};
      const bannerLocal = Object.fromEntries(
        Object.entries({...bannerBlock.base, ...bannerOverride}).filter(
          (entry): entry is [string, string] =>
            entry[0].startsWith('--') && typeof entry[1] === 'string',
        ),
      );
      const bannerForeground = resolveThemeColor(
        theme,
        'var(--color-text-primary)',
        mode,
        bannerLocal,
      );
      const bannerBackground = resolveThemeColor(
        theme,
        BANNER_DEFAULTS[status].backgroundColor,
        mode,
        bannerLocal,
      );

      return {
        status,
        name: status[0].toUpperCase() + status.slice(1),
        ratio,
        matchesBanner:
          foreground.toLowerCase() === bannerForeground.toLowerCase() &&
          background.toLowerCase() === bannerBackground.toLowerCase(),
      };
    } catch {
      return {
        status,
        name: status[0].toUpperCase() + status.slice(1),
        ratio: undefined,
        matchesBanner: false,
      };
    }
  });
}

function getInputContrast(theme: DefinedTheme, mode: Mode) {
  try {
    const parentTokens = [
      '--color-background-body',
      '--color-background-surface',
      '--color-background-card',
    ] as const;
    const parents = parentTokens.map(token => resolveToken(theme, token, mode));
    const inputBlock = theme.components?.['text-input'] ?? {};
    const inputLocal = Object.fromEntries(
      Object.entries(inputBlock.base ?? {}).filter(
        (entry): entry is [string, string] =>
          entry[0].startsWith('--') && typeof entry[1] === 'string',
      ),
    );
    const inputBackground = resolveThemeColor(
      theme,
      String(
        inputBlock.base?.backgroundColor ?? 'var(--color-background-surface)',
      ),
      mode,
      inputLocal,
    );
    const labelBlock = theme.components?.['field-label'] ?? {};
    const labelLocal = Object.fromEntries(
      Object.entries(labelBlock.base ?? {}).filter(
        (entry): entry is [string, string] =>
          entry[0].startsWith('--') && typeof entry[1] === 'string',
      ),
    );
    const labelColor = resolveThemeColor(
      theme,
      String(labelBlock.base?.color ?? 'var(--color-text-secondary)'),
      mode,
      labelLocal,
    );
    const valueColor = resolveThemeColor(
      theme,
      'var(--color-text-primary)',
      mode,
      inputLocal,
    );
    const secondaryText = resolveThemeColor(
      theme,
      'var(--color-text-secondary)',
      mode,
      inputLocal,
    );
    const iconColor = resolveThemeColor(
      theme,
      'var(--color-icon-secondary)',
      mode,
      inputLocal,
    );
    const defaultBorder = resolveThemeColor(
      theme,
      String(inputBlock.base?.borderColor ?? 'var(--color-border-emphasized)'),
      mode,
      inputLocal,
    );
    const focusBorder = resolveThemeColor(
      theme,
      'var(--color-accent)',
      mode,
      inputLocal,
    );
    const againstParents = (foreground: string) =>
      Math.min(...parents.map(parent => contrastRatio(foreground, parent)));
    const againstInput = (foreground: string) =>
      contrastRatio(foreground, inputBackground);
    const boundaryRatio = (foreground: string) =>
      Math.min(againstInput(foreground), againstParents(foreground));

    const rows = [
      {
        key: 'label',
        relationship: 'Label, description, optional / required',
        ratio: againstParents(labelColor),
        minimum: 4.5,
        note: 'Text',
      },
      {
        key: 'value',
        relationship: 'Value and read-only value',
        ratio: againstInput(valueColor),
        minimum: 4.5,
        note: 'Text',
      },
      {
        key: 'placeholder',
        relationship: 'Placeholder',
        ratio: againstInput(secondaryText),
        minimum: 4.5,
        note: 'Text',
      },
      {
        key: 'boundary',
        relationship: 'Default control boundary',
        ratio: boundaryRatio(defaultBorder),
        minimum: 3,
        note: 'Non-text',
      },
      {
        key: 'focus',
        relationship: 'Focus border color',
        ratio: boundaryRatio(focusBorder),
        minimum: 3,
        note: 'Color only',
      },
      {
        key: 'icons',
        relationship: 'Start, clear, and label-info icons',
        ratio: Math.min(againstInput(iconColor), againstParents(labelColor)),
        minimum: 3,
        note: 'When meaningful',
      },
      {
        key: 'spinner',
        relationship: 'Loading spinner arc',
        ratio: againstInput(focusBorder),
        minimum: 3,
        note: 'Track is decorative',
      },
    ];

    const statusRows = FIELD_STATUS_TYPES.map(status => {
      const statusBlock = inputBlock[`status:${status}`] ?? {};
      const local = Object.fromEntries(
        Object.entries({...inputBlock.base, ...statusBlock}).filter(
          (entry): entry is [string, string] =>
            entry[0].startsWith('--') && typeof entry[1] === 'string',
        ),
      );
      const color = resolveThemeColor(
        theme,
        String(statusBlock.borderColor ?? `var(--color-${status})`),
        mode,
        local,
      );
      return {
        key: status,
        relationship: `${status[0].toUpperCase() + status.slice(1)} border and status icon`,
        ratio: boundaryRatio(color),
        minimum: 3,
        note: 'Non-text',
      };
    });

    return [...rows, ...statusRows];
  } catch {
    return [
      ['label', 'Label, description, optional / required', 4.5, 'Text'],
      ['value', 'Value and read-only value', 4.5, 'Text'],
      ['placeholder', 'Placeholder', 4.5, 'Text'],
      ['boundary', 'Default control boundary', 3, 'Non-text'],
      ['focus', 'Focus border color', 3, 'Color only'],
      ['icons', 'Start, clear, and label-info icons', 3, 'When meaningful'],
      ['spinner', 'Loading spinner arc', 3, 'Track is decorative'],
      ...FIELD_STATUS_TYPES.map(status => [
        status,
        `${status[0].toUpperCase() + status.slice(1)} border and status icon`,
        3,
        'Non-text',
      ]),
    ].map(([key, relationship, minimum, note]) => ({
      key: String(key),
      relationship: String(relationship),
      ratio: undefined,
      minimum: Number(minimum),
      note: String(note),
    }));
  }
}

function getChatComposerContrast(theme: DefinedTheme, mode: Mode) {
  try {
    const parent = resolveToken(theme, '--color-background-body', mode);
    const background = compositeColor(
      resolveToken(theme, '--color-background-popover', mode),
      parent,
    );
    const primary = resolveToken(theme, '--color-text-primary', mode);
    const placeholder = resolveToken(theme, '--color-text-disabled', mode);
    const warning = resolveToken(theme, '--color-warning', mode);
    const error = resolveToken(theme, '--color-error', mode);
    const warningBackground = compositeColor(
      resolveToken(theme, '--color-warning-muted', mode),
      parent,
    );
    const errorBackground = compositeColor(
      resolveToken(theme, '--color-error-muted', mode),
      parent,
    );
    const primaryButton = getButtonContrast(theme, mode).find(
      row => row.name === 'Primary',
    );

    return [
      {
        key: 'composer-value',
        relationship: 'Composer value text',
        ratio: contrastRatio(primary, background),
        minimum: 4.5,
        note: 'Text',
      },
      {
        key: 'composer-placeholder',
        relationship: 'Composer placeholder',
        ratio: contrastRatio(placeholder, background),
        minimum: 4.5,
        note: 'Text',
      },
      {
        key: 'composer-send',
        relationship: 'Composer enabled send icon',
        ratio: primaryButton?.rest,
        minimum: 3,
        note: 'Icon-only control',
      },
      {
        key: 'composer-warning',
        relationship: 'Composer warning text and icon',
        ratio: contrastRatio(warning, warningBackground),
        minimum: 4.5,
        note: 'Text is the stricter requirement',
      },
      {
        key: 'composer-error',
        relationship: 'Composer error text and icon',
        ratio: contrastRatio(error, errorBackground),
        minimum: 4.5,
        note: 'Text is the stricter requirement',
      },
      {
        key: 'composer-boundary',
        relationship: 'Composer body against page',
        ratio: contrastRatio(background, parent),
        minimum: 0,
        note: 'Decorative when visible content identifies the input',
        exempt: true,
      },
      {
        key: 'composer-focus',
        relationship: 'Composer keyboard focus — elevated',
        ratio: undefined,
        minimum: 3,
        note: 'Shadow-only change is not a reliable contrast indicator',
        forceFail: true,
      },
    ];
  } catch {
    return [];
  }
}

const CONTROL_AUDIT_ROWS = [
  ['checkbox-label', 'Checkbox', 'Label and description', 4.5, 'Text'],
  ['checkbox-off', 'Checkbox', 'Unchecked boundary', 3, 'Control boundary'],
  ['checkbox-on', 'Checkbox', 'Checked fill', 3, 'Control boundary'],
  ['checkbox-mark', 'Checkbox', 'Check / indeterminate mark', 3, 'State'],
  ['checkbox-loading', 'Checkbox', 'Loading spinner arc', 3, 'Busy state'],
  ['checkbox-focus', 'Checkbox', 'Focus indicator', 3, 'Focus'],
  ['radio-label', 'Radio', 'Label and description', 4.5, 'Text'],
  ['radio-off', 'Radio', 'Unchecked boundary', 3, 'Control boundary'],
  ['radio-on', 'Radio', 'Selected fill', 3, 'Control boundary'],
  ['radio-dot', 'Radio', 'Selected dot', 3, 'State'],
  ['radio-focus', 'Radio', 'Focus indicator', 3, 'Focus'],
  ['switch-label', 'Switch', 'Label and description', 4.5, 'Text'],
  ['switch-off', 'Switch', 'Off track', 3, 'Control boundary'],
  ['switch-off-thumb', 'Switch', 'Off thumb', 3, 'State'],
  ['switch-on', 'Switch', 'On track', 3, 'Control boundary'],
  ['switch-on-thumb', 'Switch', 'On thumb', 3, 'State'],
  ['switch-loading', 'Switch', 'Loading spinner arc', 3, 'Busy state'],
  ['switch-focus', 'Switch', 'Focus indicator', 3, 'Focus'],
] as const;

function getControlContrast(theme: DefinedTheme, mode: Mode) {
  try {
    const parents = [
      '--color-background-body',
      '--color-background-surface',
      '--color-background-card',
    ].map(token => resolveToken(theme, token, mode));
    const surface = resolveToken(theme, '--color-background-surface', mode);
    const primary = resolveToken(theme, '--color-text-primary', mode);
    const secondary = resolveToken(theme, '--color-text-secondary', mode);
    const emphasized = resolveToken(theme, '--color-border-emphasized', mode);
    const accent = resolveToken(theme, '--color-accent', mode);
    const onAccent = resolveToken(theme, '--color-on-accent', mode);
    const tint = resolveToken(theme, '--color-tint-hover', mode);
    const focus = resolveToken(theme, '--focus-outline-color', mode);
    const switchBlock = theme.components?.switch ?? {};
    const switchLocal = Object.fromEntries(
      Object.entries(switchBlock.base ?? {}).filter(
        (entry): entry is [string, string] =>
          entry[0].startsWith('--') && typeof entry[1] === 'string',
      ),
    );
    const switchOff = resolveThemeColor(
      theme,
      String(
        switchBlock.base?.backgroundColor ?? 'var(--color-background-gray)',
      ),
      mode,
      switchLocal,
    );
    const switchThumbBlock = theme.components?.['switch-thumb'] ?? {};
    const switchThumb = resolveThemeColor(
      theme,
      String(
        switchThumbBlock.base?.backgroundColor ??
          'var(--color-background-surface)',
      ),
      mode,
      switchLocal,
    );
    const uncheckedHoverFill = mixColors(surface, tint, 0.05);
    const uncheckedHoverBorder = mixColors(emphasized, tint, 0.2);
    const checkedHoverFill = mixColors(accent, tint, 0.15);
    const switchOffHover = mixColors(switchOff, tint, 0.05);
    const againstParents = (foreground: string) =>
      Math.min(...parents.map(parent => contrastRatio(foreground, parent)));
    const boundary = (foreground: string, fill: string) =>
      Math.min(contrastRatio(foreground, fill), againstParents(foreground));

    const values: Record<
      (typeof CONTROL_AUDIT_ROWS)[number][0],
      {rest: number; hover?: number}
    > = {
      'checkbox-label': {rest: againstParents(secondary)},
      'checkbox-off': {
        rest: boundary(emphasized, surface),
        hover: boundary(uncheckedHoverBorder, uncheckedHoverFill),
      },
      'checkbox-on': {
        rest: againstParents(accent),
        hover: againstParents(checkedHoverFill),
      },
      'checkbox-mark': {
        rest: contrastRatio(onAccent, accent),
        hover: contrastRatio(onAccent, checkedHoverFill),
      },
      'checkbox-loading': {
        rest: Math.min(
          contrastRatio(accent, surface),
          contrastRatio(onAccent, accent),
        ),
        hover: Math.min(
          contrastRatio(accent, uncheckedHoverFill),
          contrastRatio(onAccent, checkedHoverFill),
        ),
      },
      'checkbox-focus': {rest: againstParents(focus)},
      'radio-label': {
        rest: Math.min(againstParents(primary), againstParents(secondary)),
      },
      'radio-off': {
        rest: boundary(emphasized, surface),
        hover: boundary(uncheckedHoverBorder, uncheckedHoverFill),
      },
      'radio-on': {
        rest: againstParents(accent),
        hover: againstParents(checkedHoverFill),
      },
      'radio-dot': {
        rest: contrastRatio(onAccent, accent),
        hover: contrastRatio(onAccent, checkedHoverFill),
      },
      'radio-focus': {rest: againstParents(focus)},
      'switch-label': {rest: againstParents(secondary)},
      'switch-off': {
        rest: againstParents(switchOff),
        hover: againstParents(switchOffHover),
      },
      'switch-off-thumb': {
        rest: contrastRatio(switchThumb, switchOff),
        hover: contrastRatio(switchThumb, switchOffHover),
      },
      'switch-on': {
        rest: againstParents(accent),
        hover: againstParents(checkedHoverFill),
      },
      'switch-on-thumb': {
        rest: contrastRatio(switchThumb, accent),
        hover: contrastRatio(switchThumb, checkedHoverFill),
      },
      'switch-loading': {rest: contrastRatio(accent, switchThumb)},
      'switch-focus': {rest: againstParents(focus)},
    };

    return CONTROL_AUDIT_ROWS.map(
      ([key, component, relationship, minimum, note]) => ({
        key,
        component,
        relationship,
        minimum,
        note,
        ...values[key],
      }),
    );
  } catch {
    return CONTROL_AUDIT_ROWS.map(
      ([key, component, relationship, minimum, note]) => ({
        key,
        component,
        relationship,
        minimum,
        note,
        rest: undefined,
        hover: undefined,
      }),
    );
  }
}

const PROGRESS_VARIANTS = [
  'accent',
  'success',
  'warning',
  'error',
  'neutral',
] as const satisfies readonly ProgressBarVariant[];

function getSpinnerContrast(theme: DefinedTheme, mode: Mode) {
  try {
    const parents = [
      '--color-background-body',
      '--color-background-surface',
      '--color-background-card',
    ].map(token => resolveToken(theme, token, mode));
    const minimumOnParents = (foreground: string) =>
      Math.min(...parents.map(parent => contrastRatio(foreground, parent)));
    const primary = resolveToken(theme, '--color-text-primary', mode);
    const label = minimumOnParents(primary);
    const accent = resolveToken(theme, '--color-accent', mode);
    const secondary = resolveToken(theme, '--color-text-secondary', mode);
    const onDark = resolveToken(theme, '--color-on-dark', mode);
    const media = resolveToken(theme, '--color-on-light', mode);
    const onAccent = resolveToken(theme, '--color-on-accent', mode);

    return [
      {
        shade: 'default',
        name: 'Default',
        arc: minimumOnParents(accent),
        label,
        context: 'Body / surface / card',
      },
      {
        shade: 'subtle',
        name: 'Subtle',
        arc: minimumOnParents(secondary),
        label,
        context: 'Body / surface / card',
      },
      {
        shade: 'onMedia',
        name: 'On media',
        arc: contrastRatio(onDark, media),
        label: undefined,
        context: 'Dark media surface',
      },
      {
        shade: 'inherit',
        name: 'Inherit',
        arc: contrastRatio(onAccent, accent),
        label: undefined,
        context: 'Accent context shown',
      },
    ] as const;
  } catch {
    return [
      ['default', 'Default', 'Body / surface / card'],
      ['subtle', 'Subtle', 'Body / surface / card'],
      ['onMedia', 'On media', 'Dark media surface'],
      ['inherit', 'Inherit', 'Accent context shown'],
    ].map(([shade, name, context]) => ({
      shade,
      name,
      arc: undefined,
      label: undefined,
      context,
    }));
  }
}

function getProgressContrast(
  theme: DefinedTheme,
  mode: Mode,
  overrides?: {
    track?: string;
    fills?: Partial<Record<(typeof PROGRESS_VARIANTS)[number], string>>;
  },
) {
  const fallbackRows = PROGRESS_VARIANTS.map(variant => ({
    variant,
    name: variant[0].toUpperCase() + variant.slice(1),
    fillTrack: undefined,
    trackParent: undefined,
    markOnFill: undefined,
    markOnTrack: undefined,
    markFocus: undefined,
  }));

  try {
    const parents = [
      '--color-background-body',
      '--color-background-surface',
      '--color-background-card',
    ].map(token => resolveToken(theme, token, mode));
    const progressBlock =
      theme.components?.['progress-bar'] ?? theme.components?.progressbar ?? {};
    const progressTrackBlock =
      theme.components?.['progress-bar-track'] ??
      theme.components?.['progressbar-track'] ??
      {};
    const progressFillBlock =
      theme.components?.['progress-bar-fill'] ??
      theme.components?.['progressbar-fill'] ??
      {};
    const progressMarkBlock =
      theme.components?.['progress-bar-mark'] ??
      theme.components?.['progressbar-mark'] ??
      {};
    const primary = resolveToken(theme, '--color-text-primary', mode);
    const secondary = resolveToken(theme, '--color-text-secondary', mode);
    const labels = Math.min(
      ...parents.flatMap(parent => [
        contrastRatio(primary, parent),
        contrastRatio(secondary, parent),
      ]),
    );
    const fillDefaults = {
      accent: 'var(--color-accent)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
      neutral: 'var(--color-text-disabled)',
    } as const;
    const markDefaults = {
      accent: 'var(--color-on-accent)',
      success: 'var(--color-on-success)',
      warning: 'var(--color-on-warning)',
      error: 'var(--color-on-error)',
      neutral: 'var(--color-text-primary)',
    } as const;

    return {
      labels,
      rows: PROGRESS_VARIANTS.map(variant => {
        const variantBlock = progressBlock[`variant:${variant}`] ?? {};
        const trackVariantBlock =
          progressTrackBlock[`variant:${variant}`] ?? {};
        const fillVariantBlock = progressFillBlock[`variant:${variant}`] ?? {};
        const markFillVariantBlock =
          progressMarkBlock[`variant:${variant}+placement:fill`] ??
          progressMarkBlock[`variant:${variant}`] ??
          {};
        const local = Object.fromEntries(
          Object.entries({
            ...progressBlock.base,
            ...variantBlock,
            ...progressTrackBlock.base,
            ...trackVariantBlock,
          }).filter(
            (entry): entry is [string, string] =>
              entry[0].startsWith('--') && typeof entry[1] === 'string',
          ),
        );
        const fillLocal = Object.fromEntries(
          Object.entries({...local, ...fillVariantBlock}).filter(
            (entry): entry is [string, string] =>
              entry[0].startsWith('--') && typeof entry[1] === 'string',
          ),
        );
        const markFillLocal = Object.fromEntries(
          Object.entries({...fillLocal, ...markFillVariantBlock}).filter(
            (entry): entry is [string, string] =>
              entry[0].startsWith('--') && typeof entry[1] === 'string',
          ),
        );
        const track =
          overrides?.track ??
          resolveThemeColor(
            theme,
            String(
              trackVariantBlock.backgroundColor ??
                progressTrackBlock.base?.backgroundColor ??
                'var(--color-background-muted)',
            ),
            mode,
            local,
          );
        const fill =
          overrides?.fills?.[variant] ??
          resolveThemeColor(
            theme,
            String(fillVariantBlock.backgroundColor ?? fillDefaults[variant]),
            mode,
            fillLocal,
          );
        const markFill = resolveThemeColor(
          theme,
          String(markFillVariantBlock.backgroundColor ?? markDefaults[variant]),
          mode,
          markFillLocal,
        );
        const markTrack = resolveThemeColor(
          theme,
          'var(--color-text-primary)',
          mode,
          local,
        );
        const focus = resolveThemeColor(
          theme,
          'var(--focus-outline-color)',
          mode,
          local,
        );

        return {
          variant,
          name: variant[0].toUpperCase() + variant.slice(1),
          fillTrack: contrastRatio(fill, track),
          trackParent: Math.min(
            ...parents.map(parent => contrastRatio(track, parent)),
          ),
          markOnFill: contrastRatio(markFill, fill),
          markOnTrack: contrastRatio(markTrack, track),
          markFocus: Math.min(
            contrastRatio(focus, fill),
            contrastRatio(focus, track),
          ),
        };
      }),
    };
  } catch {
    return {labels: undefined, rows: fallbackRows};
  }
}

function getBannerContrast(theme: DefinedTheme, mode: Mode) {
  const surfaces = [
    '--color-background-body',
    '--color-background-surface',
    '--color-background-card',
  ] as const;

  return BANNER_STATUSES.map(status => {
    try {
      const bannerBlock = theme.components?.banner ?? {};
      const statusOverride = bannerBlock[`status:${status}`] ?? {};
      const local = Object.fromEntries(
        Object.entries({...bannerBlock.base, ...statusOverride}).filter(
          (entry): entry is [string, string] =>
            entry[0].startsWith('--') && typeof entry[1] === 'string',
        ),
      );
      const background = resolveThemeColor(
        theme,
        String(
          statusOverride.backgroundColor ??
            bannerBlock.backgroundColor ??
            BANNER_DEFAULTS[status].backgroundColor,
        ),
        mode,
        local,
      );
      const title = resolveThemeColor(
        theme,
        'var(--color-text-primary)',
        mode,
        local,
      );
      const description = resolveThemeColor(
        theme,
        'var(--color-text-secondary)',
        mode,
        local,
      );
      const statusIcon = resolveThemeColor(
        theme,
        BANNER_DEFAULTS[status].iconColor,
        mode,
        local,
      );
      const hover = resolveThemeColor(
        theme,
        theme.tokens['--color-overlay-hover'] ??
          tokenDefaults['--color-overlay-hover'],
        mode,
        local,
      );
      const pressed = resolveThemeColor(
        theme,
        theme.tokens['--color-overlay-pressed'] ??
          tokenDefaults['--color-overlay-pressed'],
        mode,
        local,
      );
      const bannerBackgrounds = surfaces.map(surfaceToken => {
        const parent = resolveToken(theme, surfaceToken, mode);
        return compositeColor(background, parent);
      });
      const contrastOnHeaders = (foreground: string, overlay?: string) =>
        Math.min(
          ...bannerBackgrounds.map(headerBackground => {
            const stateBackground = overlay
              ? compositeColor(overlay, headerBackground)
              : headerBackground;
            return contrastRatio(
              compositeColor(foreground, stateBackground),
              stateBackground,
            );
          }),
        );

      const focusToken =
        theme.tokens['--focus-outline-color'] ??
        tokenDefaults['--focus-outline-color'];
      if (!focusToken) {
        throw new Error('Unable to resolve --focus-outline-color');
      }
      const focusColor = resolveThemeColor(theme, focusToken, mode, local);
      const focus = contrastOnHeaders(focusColor);
      const buttonAudit = (variant: 'secondary' | 'ghost') => {
        const defaults = {
          secondary: {
            backgroundColor: 'var(--color-neutral)',
            color: 'var(--color-text-primary)',
          },
          ghost: {
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
          },
        } as const;
        const override = theme.components?.button?.[`variant:${variant}`] ?? {};
        const foreground = resolveThemeColor(
          theme,
          String(override.color ?? defaults[variant].color),
          mode,
          local,
        );
        const backgroundValue = String(
          override.backgroundColor ?? defaults[variant].backgroundColor,
        );
        const background =
          backgroundValue === 'transparent'
            ? backgroundValue
            : resolveThemeColor(theme, backgroundValue, mode, local);
        const ratio = (overlay?: string) =>
          Math.min(
            ...bannerBackgrounds.map(headerBackground => {
              const base =
                background === 'transparent'
                  ? headerBackground
                  : compositeColor(background, headerBackground);
              const stateBackground = overlay
                ? compositeColor(overlay, base)
                : base;
              return contrastRatio(
                compositeColor(foreground, stateBackground),
                stateBackground,
              );
            }),
          );

        return {
          variant,
          name: variant[0].toUpperCase() + variant.slice(1),
          rest: ratio(),
          hover: ratio(hover),
          pressed: ratio(pressed),
          spinnerOrIcon: ratio(),
          focus,
        };
      };

      return {
        status,
        name: status[0].toUpperCase() + status.slice(1),
        text: Math.min(
          contrastOnHeaders(title),
          contrastOnHeaders(description),
        ),
        statusIcon: contrastOnHeaders(statusIcon),
        buttons: [buttonAudit('secondary'), buttonAudit('ghost')],
      };
    } catch {
      return {
        status,
        name: status[0].toUpperCase() + status.slice(1),
        text: undefined,
        statusIcon: undefined,
        buttons: [
          {
            variant: 'secondary' as const,
            name: 'Secondary',
            rest: undefined,
            hover: undefined,
            pressed: undefined,
            spinnerOrIcon: undefined,
            focus: undefined,
          },
          {
            variant: 'ghost' as const,
            name: 'Ghost',
            rest: undefined,
            hover: undefined,
            pressed: undefined,
            spinnerOrIcon: undefined,
            focus: undefined,
          },
        ],
      };
    }
  });
}

function getButtonContrast(theme: DefinedTheme, mode: Mode) {
  const body = resolveToken(theme, '--color-background-body', mode);
  const surface = resolveToken(theme, '--color-background-surface', mode);
  const hover = resolveToken(theme, '--color-overlay-hover', mode);
  const pressed = resolveToken(theme, '--color-overlay-pressed', mode);
  const surfaces = [body, surface];
  const defaults = {
    primary: {
      backgroundColor: 'var(--color-accent)',
      color: 'var(--color-on-accent)',
    },
    secondary: {
      backgroundColor: 'var(--color-neutral)',
      color: 'var(--color-text-primary)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
    },
    destructive: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-on-error)',
    },
  } as const;
  const badgeDefaults = {
    info: {
      backgroundColor: 'var(--color-accent)',
      color: 'var(--color-on-accent)',
    },
    neutral: {
      backgroundColor: 'var(--color-neutral)',
      color: 'var(--color-text-primary)',
    },
    error: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-on-error)',
    },
  } as const;

  const rows = BUTTON_VARIANTS.map(variant => {
    const override = theme.components?.button?.[`variant:${variant}`] ?? {};
    const foreground = resolveThemeColor(
      theme,
      String(override.color ?? defaults[variant].color),
      mode,
    );
    const backgroundValue = String(
      override.backgroundColor ?? defaults[variant].backgroundColor,
    );
    const background =
      backgroundValue === 'transparent'
        ? backgroundValue
        : resolveThemeColor(theme, backgroundValue, mode);
    const resolvedBackground = (parent: string) =>
      background === 'transparent'
        ? parent
        : compositeColor(background, parent);
    const worst = (overlay?: string) =>
      Math.min(
        ...surfaces.map(parent => {
          const base = resolvedBackground(parent);
          return contrastRatio(
            foreground,
            overlay ? compositeColor(overlay, base) : base,
          );
        }),
      );
    const stateWorst = (
      state: ':hover' | ':active',
      fallbackOverlay: string,
    ) => {
      const stateOverride = (override[state] ?? {}) as Record<string, unknown>;
      const stateLocal = Object.fromEntries(
        Object.entries({...override, ...stateOverride}).filter(
          (entry): entry is [string, string] =>
            entry[0].startsWith('--') && typeof entry[1] === 'string',
        ),
      );
      const stateForeground = resolveThemeColor(
        theme,
        String(stateOverride.color ?? foreground),
        mode,
        stateLocal,
      );
      const stateBackgroundValue = stateOverride.backgroundColor;

      return Math.min(
        ...surfaces.map(parent => {
          const base = resolvedBackground(parent);
          const stateBackground =
            stateBackgroundValue == null
              ? compositeColor(fallbackOverlay, base)
              : String(stateBackgroundValue) === 'transparent'
                ? base
                : compositeColor(
                    resolveThemeColor(
                      theme,
                      String(stateBackgroundValue),
                      mode,
                      stateLocal,
                    ),
                    base,
                  );
          return contrastRatio(stateForeground, stateBackground);
        }),
      );
    };
    const spinner = Math.min(
      ...surfaces.map(parent => {
        const base = resolvedBackground(parent);
        return contrastRatio(foreground, base);
      }),
    );
    const badgeVariant = BUTTON_END_BADGES[variant];
    const badgeOverride =
      theme.components?.badge?.[`variant:${badgeVariant}`] ?? {};
    let badge: number | undefined;
    try {
      const badgeForeground = resolveThemeColor(
        theme,
        String(badgeOverride.color ?? badgeDefaults[badgeVariant].color),
        mode,
      );
      const badgeBackground = resolveThemeColor(
        theme,
        String(
          badgeOverride.backgroundColor ??
            badgeDefaults[badgeVariant].backgroundColor,
        ),
        mode,
      );
      badge = Math.min(
        ...surfaces.map(parent => {
          const buttonBackground = resolvedBackground(parent);
          return contrastRatio(
            badgeForeground,
            compositeColor(badgeBackground, buttonBackground),
          );
        }),
      );
    } catch {
      // Keep unsupported color syntax renderable without reporting a ratio.
      badge = undefined;
    }

    return {
      name: variant[0].toUpperCase() + variant.slice(1),
      rest: worst(),
      hover: stateWorst(':hover', hover),
      pressed: stateWorst(':active', pressed),
      spinner,
      badge,
    };
  });
  return rows;
}

const buttonRowLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontFamily: MONO,
  opacity: 0.6,
  marginBottom: 6,
};

function ButtonSection({theme, mode}: {theme: DefinedTheme; mode: Mode}) {
  const audit = getButtonContrast(theme, mode);
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Buttons</h3>
      <VStack gap={4}>
        <div>
          <div style={buttonRowLabelStyle}>Default</div>
          <HStack gap={3} vAlign="center" wrap="wrap">
            {BUTTON_VARIANTS.map(variant => (
              <Button key={variant} label={variant} variant={variant} />
            ))}
          </HStack>
        </div>
        <div>
          <div style={buttonRowLabelStyle}>Loading — non-interactive</div>
          <HStack gap={3} vAlign="center" wrap="wrap">
            {BUTTON_VARIANTS.map(variant => (
              <Button
                key={variant}
                label={`${variant} loading`}
                variant={variant}
                isLoading
              />
            ))}
          </HStack>
        </div>
        <div>
          <div style={buttonRowLabelStyle}>Icon-only and icon + label</div>
          <HStack gap={3} vAlign="center" wrap="wrap">
            {BUTTON_VARIANTS.map(variant => (
              <Button
                key={variant}
                label={`${variant} icon button`}
                variant={variant}
                icon={
                  <Icon
                    icon={variant === 'destructive' ? 'close' : 'check'}
                    color="inherit"
                  />
                }
                isIconOnly
              />
            ))}
            <Button
              label="Icon and label"
              variant="secondary"
              icon={<Icon icon="check" color="inherit" />}
            />
          </HStack>
        </div>
        <div>
          <div style={buttonRowLabelStyle}>Common end content</div>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <Button
              label="Messages"
              variant="primary"
              endContent={<Badge variant="info" label={3} />}
            />
            <Button
              label="Notifications"
              variant="secondary"
              endContent={<Badge variant="neutral" label="New" />}
            />
            <Button
              label="Updates"
              variant="ghost"
              endContent={<Badge variant="info" label={5} />}
            />
            <Button
              label="Delete"
              variant="destructive"
              endContent={<Badge variant="error" label={5} />}
            />
            <Button
              label="Continue"
              variant="secondary"
              endContent={
                <Icon icon="chevronRight" size="sm" color="inherit" />
              }
            />
          </HStack>
        </div>
        <div>
          <div style={buttonRowLabelStyle}>Sizes and links</div>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <Button label="Small" variant="primary" size="sm" />
            <Button label="Medium" variant="primary" size="md" />
            <Button label="Large" variant="primary" size="lg" />
            <Button
              label="Primary link"
              variant="primary"
              href="/pages/neutral-palette/"
            />
            <Button
              label="Ghost link"
              variant="ghost"
              href="/pages/neutral-palette/"
            />
          </HStack>
        </div>
        <div>
          <div style={buttonRowLabelStyle}>
            Disabled — visual review only; WCAG contrast exempt
          </div>
          <HStack gap={3} vAlign="center" wrap="wrap">
            {BUTTON_VARIANTS.map(variant => (
              <Button
                key={variant}
                label={variant}
                variant={variant}
                isDisabled
              />
            ))}
          </HStack>
        </div>
        <div>
          <div style={buttonRowLabelStyle}>
            Measured text contrast — worst of body and surface
          </div>
          <div style={{overflowX: 'auto'}}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 11,
                fontVariantNumeric: 'tabular-nums',
              }}>
              <thead>
                <tr>
                  {[
                    'Variant',
                    'Rest',
                    'Hover',
                    'Pressed',
                    'Spinner',
                    'End badge',
                    'WCAG',
                  ].map(label => (
                    <th
                      key={label}
                      style={{
                        padding: '7px 8px',
                        borderBottom: '1px solid var(--color-border)',
                        textAlign: label === 'Variant' ? 'left' : 'right',
                      }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {audit.map(row => {
                  const passes =
                    Math.min(row.rest, row.hover, row.pressed) >= 4.5 &&
                    row.spinner >= 3 &&
                    (row.badge == null || row.badge >= 4.5);
                  return (
                    <tr key={row.name}>
                      <td style={{padding: '7px 8px'}}>{row.name}</td>
                      {[
                        row.rest,
                        row.hover,
                        row.pressed,
                        row.spinner,
                        row.badge,
                      ].map((ratio, index) => (
                        <td
                          key={index}
                          style={{padding: '7px 8px', textAlign: 'right'}}>
                          {ratio == null ? '—' : `${ratio.toFixed(2)}:1`}
                        </td>
                      ))}
                      <td
                        style={{
                          padding: '7px 8px',
                          textAlign: 'right',
                          color: passes
                            ? 'var(--color-success)'
                            : 'var(--color-error)',
                          fontWeight: 700,
                        }}>
                        {passes ? 'Pass' : 'Fail'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p
            style={{
              margin: '8px 0 0',
              color: 'var(--color-text-secondary)',
              fontSize: 10,
              lineHeight: 1.5,
            }}>
            Labels require 4.5:1. Spinner measures the meaningful arc against
            the button background; 3:1 is required. End badge measures its label
            against its composited badge surface; 4.5:1 is required. Trailing
            icons inherit the button foreground. Disabled controls are exempt.
          </p>
        </div>
      </VStack>
    </div>
  );
}

function SpinnerSection({theme, mode}: {theme: DefinedTheme; mode: Mode}) {
  const audit = getSpinnerContrast(theme, mode);

  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Spinners</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
        }}>
        <div style={{padding: 12}}>
          <div style={buttonRowLabelStyle}>Default</div>
          <HStack gap={3} vAlign="center">
            <Spinner size="sm" />
            <Spinner size="md" label="Loading" />
          </HStack>
        </div>
        <div style={{padding: 12}}>
          <div style={buttonRowLabelStyle}>Subtle</div>
          <Spinner shade="subtle" label="Loading" />
        </div>
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: 'var(--color-on-light)',
            color: 'var(--color-on-dark)',
          }}>
          <div style={{...buttonRowLabelStyle, opacity: 0.8}}>On media</div>
          <Spinner shade="onMedia" aria-label="Loading media" />
        </div>
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: 'var(--color-accent)',
            color: 'var(--color-on-accent)',
          }}>
          <div style={{...buttonRowLabelStyle, opacity: 0.8}}>Inherited</div>
          <Spinner shade="inherit" aria-label="Loading action" />
        </div>
      </div>
      <div style={{overflowX: 'auto', marginTop: 12}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {['Shade', 'Context', 'Active arc', 'Visible label', 'WCAG'].map(
                label => (
                  <th
                    key={label}
                    style={{
                      padding: '7px 8px',
                      borderBottom: '1px solid var(--color-border)',
                      textAlign:
                        label === 'Shade' || label === 'Context'
                          ? 'left'
                          : 'right',
                    }}>
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {audit.map(row => {
              const measured = row.arc != null;
              const passes =
                measured &&
                row.arc >= 3 &&
                (row.label == null || row.label >= 4.5);
              return (
                <tr key={row.shade}>
                  <td style={{padding: '8px'}}>{row.name}</td>
                  <td style={{padding: '8px'}}>{row.context}</td>
                  {[row.arc, row.label].map((ratio, index) => (
                    <td
                      key={index}
                      style={{padding: '8px', textAlign: 'right'}}>
                      {ratio == null ? '—' : `${ratio.toFixed(2)}:1`}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: '8px',
                      textAlign: 'right',
                      color: !measured
                        ? 'var(--color-text-secondary)'
                        : passes
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {!measured ? 'Not measured' : passes ? 'Pass' : 'Fail'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        The moving arc communicates loading and requires 3:1 against its actual
        background. The faint circular track is redundant and may be decorative.
        Visible labels require 4.5:1. Inherit is context-dependent, so the shown
        result is specifically the accent context above.
      </p>
    </div>
  );
}

function ProgressBarSection({theme, mode}: {theme: DefinedTheme; mode: Mode}) {
  const marks = [
    {value: 25, label: 'Quarter'},
    {value: 80, label: 'Goal'},
  ];
  const progressBlock =
    theme.components?.['progress-bar'] ?? theme.components?.progressbar ?? {};
  const progressTrackBlock =
    theme.components?.['progress-bar-track'] ??
    theme.components?.['progressbar-track'] ??
    {};
  const progressFillBlock =
    theme.components?.['progress-bar-fill'] ??
    theme.components?.['progressbar-fill'] ??
    {};
  const subtleTrack = resolveToken(theme, '--color-background-muted', mode);
  const parentSurface = resolveToken(theme, '--color-background-surface', mode);
  const progressFillDefaults = {
    accent: 'var(--color-accent)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
    neutral: 'var(--color-text-disabled)',
  } as const;
  const progressOptionRows = PROGRESS_VARIANTS.map((variant, index) => {
    const trackVariantBlock = progressTrackBlock[`variant:${variant}`] ?? {};
    const local = Object.fromEntries(
      Object.entries({
        ...progressBlock.base,
        ...progressBlock[`variant:${variant}`],
        ...progressTrackBlock.base,
        ...trackVariantBlock,
      }).filter(
        (entry): entry is [string, string] =>
          entry[0].startsWith('--') && typeof entry[1] === 'string',
      ),
    );
    const fillOverride = progressFillBlock[`variant:${variant}`] ?? {};
    const fillLocal = Object.fromEntries(
      Object.entries({...local, ...fillOverride}).filter(
        (entry): entry is [string, string] =>
          entry[0].startsWith('--') && typeof entry[1] === 'string',
      ),
    );

    return {
      variant,
      name: variant[0].toUpperCase() + variant.slice(1),
      value: 45 + index * 10,
      fill: resolveThemeColor(
        theme,
        String(fillOverride.backgroundColor ?? progressFillDefaults[variant]),
        mode,
        fillLocal,
      ),
      currentTrack: resolveThemeColor(
        theme,
        String(
          trackVariantBlock.backgroundColor ??
            progressTrackBlock.base?.backgroundColor ??
            'var(--color-background-muted)',
        ),
        mode,
        local,
      ),
    };
  });
  const standaloneTrack =
    progressOptionRows.find(row => row.variant === 'accent')?.currentTrack ??
    subtleTrack;
  const supplementalTrack = standaloneTrack;
  const supplementalWarningFill =
    progressOptionRows.find(row => row.variant === 'warning')?.fill ??
    resolveToken(theme, '--color-warning', mode);
  const audit = getProgressContrast(theme, mode, {
    track: supplementalTrack,
    fills: {warning: supplementalWarningFill},
  });
  const trackOptions = [
    {
      name: 'Standalone',
      precedent: 'Default · the graphic carries the progress information',
      description:
        'Uses this theme’s resolved ProgressBar fill and track colors. The reported ratios show whether a standalone graphic needs additional treatment.',
      getTrack: (_row: (typeof progressOptionRows)[number]) => standaloneTrack,
      getFill: (row: (typeof progressOptionRows)[number]) => row.fill,
      showValue: false,
      hasEndpointGap: false,
      hasEndMarker: true,
    },
    {
      name: 'Supplemental',
      precedent: 'Explicit opt-in · an equivalent visible value is nearby',
      description:
        'Uses this theme’s resolved semantic fills and neutral track. The nearby value carries the precise progress information.',
      getTrack: (_row: (typeof progressOptionRows)[number]) =>
        supplementalTrack,
      getFill: (row: (typeof progressOptionRows)[number]) =>
        row.variant === 'warning' ? supplementalWarningFill : row.fill,
      showValue: true,
      hasEndpointGap: false,
      hasEndMarker: false,
    },
  ] as const;

  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Progress bars</h3>
      <VStack gap={3}>
        {PROGRESS_VARIANTS.map((variant, index) => (
          <ProgressBar
            key={variant}
            value={45 + index * 10}
            label={`${variant[0].toUpperCase() + variant.slice(1)} progress`}
            variant={variant}
            hasValueLabel
            marks={marks}
          />
        ))}
        <ProgressBar
          isIndeterminate
          label="Indeterminate progress"
          variant="accent"
        />
        <ProgressBar
          value={60}
          label="Disabled progress"
          variant="neutral"
          hasValueLabel
          isDisabled
        />
      </VStack>
      <div style={{...buttonRowLabelStyle, marginTop: 18}}>
        Proposed contrast presentations across every variant
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10,
        }}>
        {trackOptions.map(option => (
          <div
            key={option.name}
            style={{
              padding: 12,
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              background: 'var(--color-background-surface)',
            }}>
            <strong style={{display: 'block', fontSize: 12}}>
              {option.name}
            </strong>
            <div
              style={{
                margin: '3px 0 10px',
                color: 'var(--color-text-secondary)',
                fontSize: 10,
              }}>
              {option.precedent}
            </div>
            <div style={{display: 'grid', gap: 9}}>
              {progressOptionRows.map(row => {
                const track = option.getTrack(row);
                const fill = option.getFill(row);
                return (
                  <div key={row.variant}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 8,
                        marginBottom: 4,
                        fontSize: 10,
                      }}>
                      <span>{row.name}</span>
                      {option.showValue && <span>{row.value}%</span>}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: option.hasEndpointGap ? 4 : 0,
                        height: 10,
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                        borderRadius: 999,
                        background: option.hasEndpointGap
                          ? 'transparent'
                          : track,
                        position: 'relative',
                      }}>
                      <div
                        style={{
                          width: `${row.value}%`,
                          flexShrink: 0,
                          height: '100%',
                          borderRadius: 999,
                          background: fill,
                          position: 'relative',
                        }}
                      />
                      {(option.hasEndpointGap || option.hasEndMarker) && (
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            height: '100%',
                            borderRadius: 999,
                            background: track,
                            position: 'relative',
                          }}>
                          {option.hasEndMarker && (
                            <span
                              style={{
                                position: 'absolute',
                                insetInlineEnd: 0,
                                top: '50%',
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: fill,
                                transform: 'translateY(-50%)',
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: 3,
                        color:
                          'var(--color-text-tertiary, var(--color-text-secondary))',
                        fontSize: 9,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                      Fill/track {contrastRatio(fill, track).toFixed(2)}:1 ·
                      Track/surface{' '}
                      {contrastRatio(track, parentSurface).toFixed(2)}:1
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 10,
                color: 'var(--color-text-secondary)',
                fontSize: 10,
                lineHeight: 1.45,
              }}>
              <div>{option.description}</div>
              {option.hasEndMarker && (
                <div style={{marginTop: 4}}>
                  Total marker/surface{' '}
                  {Math.min(
                    ...progressOptionRows.map(row =>
                      contrastRatio(option.getFill(row), parentSurface),
                    ),
                  ).toFixed(2)}
                  :1
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{...buttonRowLabelStyle, marginTop: 14}}>
        Supplemental audit · visible label and value:{' '}
        {audit.labels == null ? 'not measured' : `${audit.labels.toFixed(2)}:1`}
        {audit.labels != null && (audit.labels >= 4.5 ? ' · Pass' : ' · Fail')}
      </div>
      <div style={{overflowX: 'auto'}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {[
                'Variant',
                'Fill / track',
                'Track / parent*',
                'Mark / fill',
                'Mark / track',
                'Mark focus',
                'WCAG',
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: label === 'Variant' ? 'left' : 'right',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.rows.map(row => {
              const requiredRatios = [
                row.markOnFill,
                row.markOnTrack,
                row.markFocus,
              ];
              const displayedRatios = [
                row.fillTrack,
                row.trackParent,
                row.markOnFill,
                row.markOnTrack,
                row.markFocus,
              ];
              const measured = requiredRatios.every(
                (ratio): ratio is number => ratio != null,
              );
              const passes =
                measured &&
                audit.labels != null &&
                audit.labels >= 4.5 &&
                Math.min(...requiredRatios) >= 3;
              return (
                <tr key={row.variant}>
                  <td style={{padding: '8px'}}>{row.name}</td>
                  {displayedRatios.map((ratio, index) => (
                    <td
                      key={index}
                      style={{padding: '8px', textAlign: 'right'}}>
                      {ratio == null
                        ? '—'
                        : `${ratio.toFixed(2)}:1${index === 1 ? '†' : ''}`}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: '8px',
                      textAlign: 'right',
                      color: !measured
                        ? 'var(--color-text-secondary)'
                        : passes
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {!measured ? 'Not measured' : passes ? 'Pass' : 'Fail'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        Fill/track and †track/parent are reported for visibility but are not
        included in this supplemental result because the visible value provides
        the equivalent progress information. The proposed standalone treatment
        instead requires its fill boundary and endpoint marker to reach 3:1.
        Without a visible value or endpoint marker, the track must itself reach
        3:1 against its parent. Target marks and their focus indicators are
        measured separately. An indeterminate track may be decorative when its
        moving segment independently communicates loading. Disabled progress is
        an inactive-control exception.
      </p>
    </div>
  );
}

function CheckboxRadioSwitchSection({
  theme,
  mode,
}: {
  theme: DefinedTheme;
  mode: Mode;
}) {
  const audit = getControlContrast(theme, mode);

  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Controls</h3>
      <VStack gap={4}>
        <div>
          <div style={buttonRowLabelStyle}>Checkbox states</div>
          <VStack gap={2}>
            <CheckboxInput
              label="Unchecked"
              description="Default boundary and label treatment"
              value={false}
              onChange={() => {}}
            />
            <CheckboxInput label="Checked" value={true} onChange={() => {}} />
            <CheckboxInput
              label="Indeterminate"
              value="indeterminate"
              onChange={() => {}}
            />
            <CheckboxInput
              label="Loading"
              value={true}
              onChange={() => {}}
              isLoading
            />
            <CheckboxInput
              label="Read-only"
              value={true}
              onChange={() => {}}
              isReadOnly
            />
            <CheckboxInput
              label="Disabled"
              value={true}
              onChange={() => {}}
              isDisabled
            />
            <CheckboxInput
              label="Error status"
              value={false}
              onChange={() => {}}
              status={{type: 'error', message: 'This choice is required.'}}
            />
          </VStack>
        </div>
        <div>
          <div style={buttonRowLabelStyle}>Radio states</div>
          <RadioList
            label="Display mode"
            value="comfortable"
            onChange={() => {}}
            status={{
              type: 'warning',
              message: 'This changes the page density.',
            }}>
            <RadioListItem
              value="compact"
              label="Compact"
              description="More information in less space"
            />
            <RadioListItem value="comfortable" label="Comfortable" />
            <RadioListItem value="spacious" label="Spacious" isDisabled />
          </RadioList>
        </div>
        <div>
          <div style={buttonRowLabelStyle}>Switch states</div>
          <VStack gap={2}>
            <Switch label="Off" value={false} onChange={() => {}} />
            <Switch label="On" value={true} onChange={() => {}} />
            <Switch
              label="On with description"
              description="Supporting text uses the secondary text token"
              value={true}
              onChange={() => {}}
            />
            <Switch
              label="Loading"
              value={true}
              onChange={() => {}}
              isLoading
            />
            <Switch
              label="Disabled"
              value={false}
              onChange={() => {}}
              isDisabled
            />
            <Switch
              label="Success status"
              value={true}
              onChange={() => {}}
              status={{type: 'success', message: 'Setting saved.'}}
            />
          </VStack>
        </div>
      </VStack>
      <div style={{overflowX: 'auto', marginTop: 14}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {[
                'Control',
                'Relationship',
                'Rest',
                'Hover',
                'Requirement',
                'Note',
                'WCAG',
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign:
                      label === 'Control' ||
                      label === 'Relationship' ||
                      label === 'Note'
                        ? 'left'
                        : 'right',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map(row => {
              const measured = row.rest != null;
              const passes =
                measured &&
                row.rest >= row.minimum &&
                (row.hover == null || row.hover >= row.minimum);
              return (
                <tr key={row.key}>
                  <td style={{padding: '8px'}}>{row.component}</td>
                  <td style={{padding: '8px'}}>{row.relationship}</td>
                  {[row.rest, row.hover].map((ratio, index) => (
                    <td
                      key={index}
                      style={{padding: '8px', textAlign: 'right'}}>
                      {ratio == null ? '—' : `${ratio.toFixed(2)}:1`}
                    </td>
                  ))}
                  <td style={{padding: '8px', textAlign: 'right'}}>
                    {row.minimum}:1
                  </td>
                  <td style={{padding: '8px'}}>{row.note}</td>
                  <td
                    style={{
                      padding: '8px',
                      textAlign: 'right',
                      color: !measured
                        ? 'var(--color-text-secondary)'
                        : passes
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {!measured ? 'Not measured' : passes ? 'Pass' : 'Fail'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        Indicators are aria-hidden but visually meaningful: they are the visible
        control and selected-state representation, so their boundaries and marks
        require 3:1. Loading arcs remain meaningful while interaction is
        temporarily blocked; their faint tracks are decorative. Focus rings are
        measured against every parent surface. Disabled treatment is
        contrast-exempt; Checkbox read-only remains active-looking and is not
        exempt. Validation messages reuse the FieldStatus profile above.
      </p>
    </div>
  );
}

const CARD_VARIANTS = [
  'default',
  'transparent',
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

const SELECTABLE_CARD_VARIANTS = CARD_VARIANTS;

const CARD_BACKGROUND_DEFAULTS = {
  default: 'var(--color-background-card)',
  transparent: 'transparent',
  muted: 'var(--color-background-muted)',
  blue: 'var(--color-background-blue)',
  cyan: 'var(--color-background-cyan)',
  gray: 'var(--color-background-gray)',
  green: 'var(--color-background-green)',
  orange: 'var(--color-background-orange)',
  pink: 'var(--color-background-pink)',
  purple: 'var(--color-background-purple)',
  red: 'var(--color-background-red)',
  teal: 'var(--color-background-teal)',
  yellow: 'var(--color-background-yellow)',
} as const;

function getCardContrast(theme: DefinedTheme, mode: Mode) {
  const body = resolveToken(theme, '--color-background-body', mode);
  const cardBlock = theme.components?.card ?? {};
  const selectableCardBlock = theme.components?.['selectable-card'] ?? {};

  return CARD_VARIANTS.map(variant => {
    try {
      const variantBlock = cardBlock[`variant:${variant}`] ?? {};
      const local = Object.fromEntries(
        Object.entries({...cardBlock.base, ...variantBlock}).filter(
          (entry): entry is [string, string] =>
            entry[0].startsWith('--') && typeof entry[1] === 'string',
        ),
      );
      const background = compositeColor(
        resolveThemeColor(
          theme,
          String(
            variantBlock.backgroundColor ??
              cardBlock.backgroundColor ??
              CARD_BACKGROUND_DEFAULTS[variant],
          ),
          mode,
          local,
        ),
        body,
      );
      const foreground = compositeColor(
        resolveThemeColor(
          theme,
          String(
            variantBlock.color ??
              cardBlock.color ??
              'var(--color-text-primary)',
          ),
          mode,
          local,
        ),
        background,
      );

      let boundary: number | undefined;
      if (variant === 'default') {
        const border = compositeColor(
          resolveThemeColor(
            theme,
            String(
              variantBlock.borderColor ??
                cardBlock.borderColor ??
                'var(--color-border)',
            ),
            mode,
            local,
          ),
          background,
        );
        boundary = Math.min(
          contrastRatio(border, background),
          contrastRatio(border, body),
        );
      }

      const defaultRingToken =
        variant === 'default' ||
        variant === 'transparent' ||
        variant === 'muted'
          ? 'var(--color-accent)'
          : `var(--color-border-${variant})`;
      const selectableVariantBlock =
        selectableCardBlock[`variant:${variant}`] ?? {};
      const selectableLocal = Object.fromEntries(
        Object.entries({
          ...selectableCardBlock.base,
          ...selectableVariantBlock,
        }).filter(
          (entry): entry is [string, string] =>
            entry[0].startsWith('--') && typeof entry[1] === 'string',
        ),
      );
      const ring = compositeColor(
        resolveThemeColor(
          theme,
          String(
            selectableVariantBlock['--selectable-card-ring-color'] ??
              selectableCardBlock.base?.['--selectable-card-ring-color'] ??
              defaultRingToken,
          ),
          mode,
          {...local, ...selectableLocal},
        ),
        background,
      );

      return {
        variant,
        name: variant[0].toUpperCase() + variant.slice(1),
        text: contrastRatio(foreground, background),
        surface: contrastRatio(background, body),
        boundary,
        selection: contrastRatio(ring, background),
      };
    } catch {
      return {
        variant,
        name: variant[0].toUpperCase() + variant.slice(1),
        text: undefined,
        surface: undefined,
        boundary: undefined,
        selection: undefined,
      };
    }
  });
}

function CardVariantsSection({theme, mode}: {theme: DefinedTheme; mode: Mode}) {
  const audit = getCardContrast(theme, mode);
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Cards</h3>
      <div style={buttonRowLabelStyle}>Card variants</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 104px), 1fr))',
          gap: 10,
        }}>
        {CARD_VARIANTS.map(v => (
          <Card key={v} variant={v} padding={2}>
            <Text type="supporting" weight="bold">
              {v}
            </Text>
          </Card>
        ))}
      </div>
      <h4 style={{...S.sectionTitle, marginTop: 24, fontSize: 12}}>
        SelectableCard — every selection ring
      </h4>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 104px), 1fr))',
          gap: 10,
        }}>
        {SELECTABLE_CARD_VARIANTS.map(variant => (
          <SelectableCard
            key={variant}
            variant={variant}
            label={`${variant} selected`}
            padding={2}
            isSelected
            onChange={() => {}}>
            <Text type="supporting">{variant}</Text>
          </SelectableCard>
        ))}
      </div>
      <div style={{...buttonRowLabelStyle, marginTop: 24}}>
        Static Card surfaces
      </div>
      <div style={{overflowX: 'auto'}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {[
                'Variant',
                'Text / background',
                'Background / body',
                'Border / adjacent',
                'Required result',
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: label === 'Variant' ? 'left' : 'right',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map(row => {
              const passes = row.text != null && row.text >= 4.5;
              return (
                <tr key={row.variant}>
                  <td style={{padding: '7px 8px'}}>{row.name}</td>
                  {[row.text, row.surface, row.boundary].map((ratio, index) => (
                    <td
                      key={index}
                      style={{padding: '7px 8px', textAlign: 'right'}}>
                      {ratio == null ? '—' : `${ratio.toFixed(2)}:1`}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: '7px 8px',
                      textAlign: 'right',
                      color:
                        row.text == null
                          ? 'var(--color-text-secondary)'
                          : passes
                            ? 'var(--color-success)'
                            : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {row.text == null
                      ? 'Not measured'
                      : passes
                        ? 'Text passes'
                        : 'Text fails'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        Card text requires 4.5:1. Background/body and border/adjacent ratios are
        shown for inspection, but a static Card surface is decorative when
        spacing, headings, and content already communicate the grouping; those
        surfaces do not inherently need 3:1. If color communicates a category or
        status, provide a visible text or non-color cue.
      </p>
      <div style={{...buttonRowLabelStyle, marginTop: 18}}>
        SelectableCard state boundary
      </div>
      <div style={{overflowX: 'auto'}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {['Variant', 'Ring / background', 'WCAG 1.4.11'].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: label === 'Variant' ? 'left' : 'right',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map(row => {
              const passes = row.selection != null && row.selection >= 3;
              return (
                <tr key={row.variant}>
                  <td style={{padding: '7px 8px'}}>{row.name}</td>
                  <td style={{padding: '7px 8px', textAlign: 'right'}}>
                    {row.selection == null
                      ? '—'
                      : `${row.selection.toFixed(2)}:1`}
                  </td>
                  <td
                    style={{
                      padding: '7px 8px',
                      textAlign: 'right',
                      color:
                        row.selection == null
                          ? 'var(--color-text-secondary)'
                          : passes
                            ? 'var(--color-success)'
                            : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {row.selection == null
                      ? 'Not measured'
                      : passes
                        ? 'Pass'
                        : 'Fail'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        The SelectableCard ring communicates selected state, so it requires 3:1
        against its Card background. ClickableCard reuses the same Card surface;
        its boundary needs 3:1 only when required to identify the target, while
        its focus indicator is always evaluated separately.
      </p>
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
    {label: 'popover', hex: VAR_SURFACES.popover},
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
      <p
        style={{
          margin: '12px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        These swatches are shown for token and visual-hierarchy review. A static
        container background or border is decorative when removing it still
        leaves the grouping clear through spacing, headings, and content, so it
        does not inherently need 3:1 against the page. If the boundary is
        required to identify a control, state, or distinct region, it becomes
        meaningful and must meet its applicable contrast requirement.
      </p>
    </div>
  );
}

/** Render each elevation level on the active theme surface. */
const DEFAULT_SHADOW_DESCRIPTION =
  'Three shadow levels mapped to the components that use them.';

function ElevationsSection({
  mode,
  description = DEFAULT_SHADOW_DESCRIPTION,
}: {
  mode: Mode;
  description?: string;
}) {
  const levels = [
    {
      label: 'Low — popovers / dropdowns / composer',
      shadow: 'var(--shadow-low)',
      consumers:
        'Popover, TopNav mega menu, SegmentedControl item, ChatComposer (resting)',
    },
    {
      label: 'Medium — hover / floating',
      shadow: 'var(--shadow-med)',
      consumers:
        'HoverCard, Toast, Carousel scroll button, Chat scroll button, Thumbnail (hover), ChatComposer (hover/focus)',
    },
    {
      label: 'High — modal / dialog',
      shadow: 'var(--shadow-high)',
      consumers: 'Dialog',
    },
  ];

  const elevatedBg =
    mode === 'light' ? '#ffffff' : 'var(--color-background-surface)';
  const cardStyle = (shadow: string): React.CSSProperties => ({
    backgroundColor: elevatedBg,
    color: 'var(--color-text-primary)',
    padding: 16,
    borderRadius: 12,
    boxShadow: shadow,
    fontFamily: 'var(--font-family-body)',
    fontSize: 13,
    flex: 1,
    minWidth: 220,
    minHeight: 88,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Elevations</h3>
      <p
        style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          margin: 0,
          marginBottom: 12,
        }}>
        {description}
      </p>
      <div
        style={{
          background: 'var(--color-background-body)',
          padding: 32,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
        {levels.map(l => (
          <div
            key={l.label}
            style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <div style={cardStyle(l.shadow)}>{l.label}</div>
            <div
              style={{
                fontSize: 10,
                fontFamily: MONO,
                color: 'var(--color-text-secondary)',
                paddingLeft: 4,
              }}>
              Consumed by: {l.consumers}
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          margin: '12px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        Elevation is decorative when it only reinforces grouping or visual
        hierarchy that remains understandable without the shadow. WCAG does not
        require that optional shadow to reach 3:1. If elevation is the only cue
        that identifies an interactive target, boundary, or state, it is no
        longer sufficient by itself; provide a persistent qualifying visual
        indicator and audit that indicator instead.
      </p>
    </div>
  );
}

const BANNER_STATUSES = [
  'info',
  'success',
  'warning',
  'error',
] as const satisfies readonly BannerStatus[];

function BannerSection({theme, mode}: {theme: DefinedTheme; mode: Mode}) {
  const audit = getBannerContrast(theme, mode);
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Banners</h3>
      <VStack gap={2}>
        {BANNER_STATUSES.map(status => (
          <Banner
            key={status}
            status={status}
            title={`${status[0].toUpperCase() + status.slice(1)} banner title`}
            description={`Description text for the ${status} state.`}
            endContent={
              <>
                <Button label="Details" variant="ghost" size="sm" />
                <Button label="Review" variant="secondary" size="sm" />
              </>
            }
            isDismissable
          />
        ))}
        <Banner
          status="info"
          title="Loading and disabled actions"
          description="Loading is measured; disabled contrast is exempt."
          endContent={
            <>
              <Button label="Loading" variant="secondary" size="sm" isLoading />
              <Button label="Disabled" variant="ghost" size="sm" isDisabled />
            </>
          }
        />
        <Banner
          status="info"
          title="Collapsible content"
          description="The content area uses the standard card surface."
          collapsible={{defaultIsOpen: true}}>
          <Text type="supporting">
            Rich banner content follows the normal card text requirements.
          </Text>
        </Banner>
      </VStack>
      <div style={{overflowX: 'auto', marginTop: 12}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {['Status', 'Text', 'Status icon', 'WCAG'].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: label === 'Status' ? 'left' : 'right',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map(row => {
              const measured = row.text != null && row.statusIcon != null;
              const passes = measured && row.text >= 4.5;
              return (
                <tr key={row.status}>
                  <td style={{padding: '8px'}}>{row.name}</td>
                  {[row.text, row.statusIcon].map((ratio, index) => (
                    <td
                      key={index}
                      style={{padding: '8px', textAlign: 'right'}}>
                      {ratio == null ? '—' : `${ratio.toFixed(2)}:1`}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: '8px',
                      textAlign: 'right',
                      color: !measured
                        ? 'var(--color-text-secondary)'
                        : passes
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {!measured ? 'Not measured' : passes ? 'Pass' : 'Fail'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{...buttonRowLabelStyle, marginTop: 16}}>
        Button states on the tinted header
      </div>
      <div style={{overflowX: 'auto'}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {[
                'Status',
                'Button',
                'Rest',
                'Hover',
                'Pressed',
                'Spinner / icon',
                'Focus',
                'WCAG',
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign:
                      label === 'Status' || label === 'Button'
                        ? 'left'
                        : 'right',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.flatMap(row =>
              row.buttons.map(button => {
                const ratios = [
                  button.rest,
                  button.hover,
                  button.pressed,
                  button.spinnerOrIcon,
                  button.focus,
                ];
                const measured = ratios.every(
                  (ratio): ratio is number => ratio != null,
                );
                const passes =
                  button.rest != null &&
                  button.hover != null &&
                  button.pressed != null &&
                  button.spinnerOrIcon != null &&
                  button.focus != null &&
                  Math.min(button.rest, button.hover, button.pressed) >= 4.5 &&
                  button.spinnerOrIcon >= 3 &&
                  button.focus >= 3;
                return (
                  <tr key={`${row.status}-${button.variant}`}>
                    <td style={{padding: '8px'}}>{row.name}</td>
                    <td style={{padding: '8px'}}>{button.name}</td>
                    {ratios.map((ratio, index) => (
                      <td
                        key={index}
                        style={{padding: '8px', textAlign: 'right'}}>
                        {ratio == null ? '—' : `${ratio.toFixed(2)}:1`}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: '8px',
                        textAlign: 'right',
                        color: !measured
                          ? 'var(--color-text-secondary)'
                          : passes
                            ? 'var(--color-success)'
                            : 'var(--color-error)',
                        fontWeight: 700,
                      }}>
                      {!measured ? 'Not measured' : passes ? 'Pass' : 'Fail'}
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        Title, description, and action labels require 4.5:1. Spinner, dismiss,
        and disclosure glyphs require 3:1; focus indicators require 3:1 against
        the adjacent header. The default status icon is decorative because the
        visible title and live region communicate the same status, but its ratio
        is shown for visual consistency. Disabled actions are exempt from
        contrast requirements. Content below the header uses the standard card
        surface.
      </p>
    </div>
  );
}

function FieldStatusSection({theme, mode}: {theme: DefinedTheme; mode: Mode}) {
  const audit = getFieldStatusContrast(theme, mode);
  const messages = {
    success: 'Looks good!',
    warning: 'This value may cause issues.',
    error: 'This field is required.',
  } as const;

  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Field status messages</h3>
      <p
        style={{
          margin: '0 0 12px',
          color: 'var(--color-text-secondary)',
          fontSize: 11,
          lineHeight: 1.5,
        }}>
        Field validation uses the same success, warning, and error background +
        foreground pairs as Banner. FieldStatus has no info state.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
        {FIELD_STATUS_TYPES.map(status => (
          <div key={status}>
            <div style={buttonRowLabelStyle}>
              {status[0].toUpperCase() + status.slice(1)} · attached
            </div>
            <TextInput
              label={`${status[0].toUpperCase() + status.slice(1)} field`}
              value="Example value"
              onChange={() => {}}
              status={{type: status, message: messages[status]}}
            />
            <div style={{...buttonRowLabelStyle, marginTop: 14}}>
              {status[0].toUpperCase() + status.slice(1)} · detached
            </div>
            <FieldStatus
              type={status}
              message={messages[status]}
              variant="detached"
            />
          </div>
        ))}
      </div>
      <div style={{overflowX: 'auto', marginTop: 14}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {[
                'Status',
                'Message',
                'Detached icon',
                'Banner pair',
                'WCAG',
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: label === 'Status' ? 'left' : 'right',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map(row => {
              const measured = row.ratio != null;
              const passes = measured && row.ratio >= 4.5 && row.matchesBanner;
              return (
                <tr key={row.status}>
                  <td style={{padding: '8px'}}>{row.name}</td>
                  <td style={{padding: '8px', textAlign: 'right'}}>
                    {row.ratio == null ? '—' : `${row.ratio.toFixed(2)}:1`}
                  </td>
                  <td style={{padding: '8px', textAlign: 'right'}}>
                    {row.ratio == null ? '—' : `${row.ratio.toFixed(2)}:1`}
                  </td>
                  <td style={{padding: '8px', textAlign: 'right'}}>
                    {row.matchesBanner ? 'Same' : 'Different'}
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      textAlign: 'right',
                      color: !measured
                        ? 'var(--color-text-secondary)'
                        : passes
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {!measured ? 'Not measured' : passes ? 'Pass' : 'Fail'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        Message text requires 4.5:1. The detached icon inherits the same
        foreground and is decorative because the visible message carries the
        status; its ratio is still shown. Attached messages rely on the input’s
        status icon and border, which are audited with inputs.
      </p>
    </div>
  );
}

function InputSection({theme, mode}: {theme: DefinedTheme; mode: Mode}) {
  const audit = [
    ...getInputContrast(theme, mode),
    ...getChatComposerContrast(theme, mode),
  ];
  const inputExampleStyle: React.CSSProperties = {minWidth: 0};

  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Inputs</h3>
      <div style={buttonRowLabelStyle}>Content and behavior</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
        }}>
        <div style={inputExampleStyle}>
          <TextInput
            label="Default"
            placeholder="Placeholder text"
            value=""
            onChange={() => {}}
          />
        </div>
        <div style={inputExampleStyle}>
          <TextInput
            label="With adornments"
            description="Description and optional indicator"
            isOptional
            labelTooltip="More information"
            startIcon={<Icon icon="search" size="sm" />}
            value="Search query"
            onChange={() => {}}
            hasClear
          />
        </div>
        <div style={inputExampleStyle}>
          <TextInput
            label="Read-only"
            value="Visible, submitted value"
            onChange={() => {}}
            isReadOnly
          />
        </div>
        <div style={inputExampleStyle}>
          <TextInput
            label="Loading"
            value="Checking value"
            onChange={() => {}}
            isLoading
          />
        </div>
        <div style={inputExampleStyle}>
          <TextInput
            label="Disabled"
            value="Cannot edit"
            onChange={() => {}}
            isDisabled
          />
        </div>
      </div>
      <div style={{...buttonRowLabelStyle, marginTop: 18}}>
        Validation borders and on-field icons
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
        }}>
        <TextInput
          label="Success"
          value="Valid input"
          onChange={() => {}}
          status={{type: 'success', message: 'Looks good!'}}
        />
        <TextInput
          label="Warning"
          value="Risky value"
          onChange={() => {}}
          status={{type: 'warning', message: 'This value may cause issues.'}}
        />
        <TextInput
          label="Error"
          value="Invalid input"
          onChange={() => {}}
          status={{type: 'error', message: 'This field is required.'}}
        />
        <TextInput
          label="Tooltip status"
          value="Focus the status icon"
          onChange={() => {}}
          status={{type: 'error', message: 'This field is required.'}}
          statusVariant="tooltip"
        />
      </div>
      <div style={{...buttonRowLabelStyle, marginTop: 18}}>Chat composer</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 16,
        }}>
        <ChatComposer
          value="Ready to send"
          onChange={() => {}}
          onSubmit={() => {}}
          status={{type: 'warning', message: 'Approaching the token limit'}}
        />
        <ChatComposer
          onSubmit={() => {}}
          status={{type: 'error', message: 'Message could not be sent'}}
        />
      </div>
      <div style={{overflowX: 'auto', marginTop: 14}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}>
          <thead>
            <tr>
              {[
                'Relationship',
                'Worst contrast',
                'Requirement',
                'Note',
                'WCAG',
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '7px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign:
                      label === 'Relationship' || label === 'Note'
                        ? 'left'
                        : 'right',
                  }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map(row => {
              const ratio = row.ratio;
              const measured = ratio != null;
              const exempt = 'exempt' in row && row.exempt;
              const forceFail = 'forceFail' in row && row.forceFail;
              const passes =
                !forceFail &&
                (exempt || (ratio != null && ratio >= row.minimum));
              return (
                <tr key={row.key}>
                  <td style={{padding: '8px'}}>{row.relationship}</td>
                  <td style={{padding: '8px', textAlign: 'right'}}>
                    {row.ratio == null ? '—' : `${row.ratio.toFixed(2)}:1`}
                  </td>
                  <td style={{padding: '8px', textAlign: 'right'}}>
                    {exempt ? 'None' : `${row.minimum}:1`}
                  </td>
                  <td style={{padding: '8px'}}>{row.note}</td>
                  <td
                    style={{
                      padding: '8px',
                      textAlign: 'right',
                      color: !measured
                        ? forceFail
                          ? 'var(--color-error)'
                          : 'var(--color-text-secondary)'
                        : passes
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      fontWeight: 700,
                    }}>
                    {exempt
                      ? 'Exempt'
                      : forceFail
                        ? 'Needs fix'
                        : !measured
                          ? 'Not measured'
                          : passes
                            ? 'Pass'
                            : 'Fail'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p
        style={{
          margin: '8px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 10,
          lineHeight: 1.5,
        }}>
        Active text and placeholders require 4.5:1. Control boundaries,
        meaningful icons, spinner arcs, and focus indicators require 3:1. The
        hover inset is supplemental—the persistent border remains the control
        boundary. The contrasting focus border carries the AA focus-indicator
        check; its faint 2px inset is supplemental. The two-pixel perimeter-area
        rule is WCAG 2.2 AAA, not AA. Spinner tracks and redundant status glyphs
        may be decorative. Disabled controls are exempt from WCAG contrast
        requirements; read-only controls are not and remain at full contrast.
        The composer shell boundary is optional when its visible content
        identifies the input. Its elevated keyboard-focus treatment still needs
        an explicit 3:1 indicator; a shadow-depth change alone is not a reliable
        AA focus cue.
      </p>
    </div>
  );
}

function TonalSection({
  colors,
  mode = 'light',
  usage,
}: {
  colors: TonalColor[];
  mode?: Mode;
  /** Audit-derived map of which palette stops are consumed by which tokens. */
  usage?: TonalUsageMap;
}) {
  const isDark = mode === 'dark';
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
        Full tonal ramps: 21 numbered stops ordered from dark (stop 0) to light
        (stop 100). The number is a stable palette label in both modes, not a
        promise of identical measured lightness.
        {isDark && (
          <>
            {' '}
            Dark mode applies the audit&apos;s &sect;4 transform (
            <strong>+5 brightness</strong> with taper above palette stop 80,{' '}
            <strong>×0.85 chroma</strong>) so saturated stops don&apos;t vibrate
            against the dark canvas.
          </>
        )}{' '}
        {usage
          ? 'Markers ● show numbered stops consumed by theme tokens (open the audit drawer for the full report).'
          : 'The default preview marks the light- and dark-mode stops used by Badge tokens.'}
      </p>
      {colors.map(
        ({name, sourceHex, semantic, note, tones: overrideTones, dark}) => {
          // In dark mode, use per-mode overrides if provided.
          const effectiveSourceHex = (isDark && dark?.sourceHex) || sourceHex;
          const effectiveTones = (isDark && dark?.tones) || overrideTones;
          const hct = hexToHct(effectiveSourceHex);
          const computedTones = tonalPaletteForMode(hct.hue, hct.chroma, mode);
          // Theme override wins when it has a hex for this step; otherwise
          // fall back to the algorithm so the strip is always a full 21-step
          // ramp (no missing cells when the theme defines a subset).
          const resolveTone = (t: number): string => {
            if (effectiveTones) {
              const v = effectiveTones[t];
              if (typeof v === 'string') {
                return v;
              }
            }
            return computedTones[t];
          };
          const steps = TONE_STEPS;
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
                {steps.map(t => {
                  const hex = resolveTone(t);
                  const usages = usage?.[tonalUsageKey(name, mode, t)] ?? [];
                  // Title summarises which tokens snap to this step (max 4
                  // listed to keep the native tooltip readable on dense ramps).
                  const titleLines = [
                    `${name}, ${mode}-mode stop ${t}: ${hex}`,
                    ...usages
                      .slice(0, 4)
                      .map(u => `· ${u.name} (\u0394E ${u.deltaE.toFixed(1)})`),
                    usages.length > 4 ? `· +${usages.length - 4} more` : '',
                  ].filter(Boolean);
                  return (
                    <div
                      key={t}
                      style={{
                        ...S.tonalCell(hex),
                        position: 'relative' as const,
                      }}
                      title={titleLines.join('\n')}>
                      <span style={S.tonalNum(t)}>{t}</span>
                      {usages.length > 0 && (
                        <div style={S.markerDot(t)}>
                          {usages.length > 1 && (
                            <span style={S.markerCount(t)}>
                              {usages.length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <span style={S.tonalHct}>
                H:
                {typeof effectiveTones?.hue === 'number'
                  ? effectiveTones.hue
                  : hct.hue.toFixed(0)}{' '}
                C:
                {typeof effectiveTones?.chroma === 'number'
                  ? effectiveTones.chroma < 1
                    ? effectiveTones.chroma.toFixed(3)
                    : effectiveTones.chroma.toFixed(0)
                  : hct.chroma.toFixed(0)}
              </span>
            </div>
          );
        },
      )}
      <p
        style={{
          fontSize: 10,
          color: 'var(--color-text-secondary)',
          margin: 0,
          marginTop: 10,
          fontFamily: MONO,
        }}>
        {usage
          ? '● = numbered stop consumed by a theme token. Number = count when multiple tokens share the same stop. Hover any cell for details.'
          : '● = token in use (dark background stop 15 · light text stop 25 · dark text stop 80 · light background stop 90)'}
      </p>
    </div>
  );
}

function ModeColumn({
  theme,
  mode,
  coreSwatches,
  extraSections,
  leadingExtras,
  shadowDescription,
  overrideVars,
  bare = false,
}: {
  theme: DefinedTheme;
  mode: Mode;
  coreSwatches?: CoreSwatch[];
  extraSections?: ModeSection;
  leadingExtras?: ModeSection;
  shadowDescription?: string;
  /**
   * Pending-overrides CSS custom properties spread onto the column's
   * outermost styled wrapper *inside* the Theme scope. Required:
   * Theme re-injects the canonical token values on its own scope
   * element, so any `--color-*` overrides applied above Theme would
   * be stomped by the inner theme rules. Putting the overrides
   * inside the theme wrapper (as inline style on a child element)
   * wins via specificity.
   */
  overrideVars?: React.CSSProperties;
  /**
   * When true, render the column as a transparent layout container
   * (no background, border, or padding) — the outer page provides the
   * surface. Used by single-mode previews to avoid a redundant frame.
   */
  bare?: boolean;
}) {
  const columnStyle: React.CSSProperties = bare
    ? {
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }
    : S.modeCol(VAR_SURFACES.body, VAR_SURFACES.textPrimary);

  return (
    <Theme theme={theme} mode={mode}>
      <LayerProvider>
        <div style={{...columnStyle, ...overrideVars}}>
          {!bare && (
            <p style={S.modeLabel}>
              {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
            </p>
          )}
          {coreSwatches && coreSwatches.length > 0 && (
            <CoreSection swatches={coreSwatches} mode={mode} />
          )}
          {typeof leadingExtras === 'function'
            ? leadingExtras(mode)
            : leadingExtras}
          <TextRampSection theme={theme} />
          <BadgeContrastSection
            title="Semantic Badges"
            variants={SEMANTIC_BADGE_VARIANTS}
            theme={theme}
            mode={mode}
          />
          <BadgeContrastSection
            title="Categorical Badges"
            variants={CATEGORICAL_BADGE_VARIANTS}
            theme={theme}
            mode={mode}
          />
          <TokenContrastSection theme={theme} mode={mode} />
          <BannerSection theme={theme} mode={mode} />
          <FieldStatusSection theme={theme} mode={mode} />
          <InputSection theme={theme} mode={mode} />
          <ButtonSection theme={theme} mode={mode} />
          <SpinnerSection theme={theme} mode={mode} />
          <ProgressBarSection theme={theme} mode={mode} />
          <CheckboxRadioSwitchSection theme={theme} mode={mode} />
          <CardVariantsSection theme={theme} mode={mode} />
          <SurfacesSection mode={mode} />
          <ElevationsSection mode={mode} description={shadowDescription} />
          {typeof extraSections === 'function'
            ? extraSections(mode)
            : extraSections}
        </div>
      </LayerProvider>
    </Theme>
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
  leadingExtras,
  shadowDescription,
  componentPreviewOnly = false,
  singleMode,
}: ThemePalettePreviewProps) {
  const columnsStyle: React.CSSProperties = singleMode
    ? {display: 'block'}
    : S.twoCol;

  // Run audit once per (theme, tonalColors). The drawer reads diff + snap
  // tables; the Tonal section reads `usage` to draw token-driven markers.
  const audit = useThemeAudit(theme, tonalColors);

  // Pending-overrides state lives at the page level (not in the drawer)
  // so we can also feed it into a CSS-variable injection at the page
  // root — that way every component on the page (mode columns + tonal
  // strip) re-renders live as you reassign tokens in the drawer.
  const emptyOverrides = {};
  const [overrides, dispatchOverrides] = useReducer(
    overridesReducer,
    emptyOverrides as OverridesMap,
  );
  const overrideCount = countOverrides(overrides);

  // Map of `--token: light-dark(#L, #D)` for every pending override.
  // Spread directly onto the page root so the values cascade into every
  // descendant via CSS custom property inheritance.
  const serializeCtx: SerializeContext = useMemo(() => {
    const map: SerializeContext['currentTokenValues'] = {};
    for (const e of audit.snap) {
      map[e.name] = {light: e.light, dark: e.dark};
    }
    return {currentTokenValues: map};
  }, [audit.snap]);
  const overrideVars = useMemo(
    () => buildOverrideCSSVars(overrides, serializeCtx),
    [overrides, serializeCtx],
  );
  const effectiveTheme = useMemo<DefinedTheme>(() => {
    if (overrideCount === 0) {
      return theme;
    }
    return {
      ...theme,
      tokens: {
        ...theme.tokens,
        ...(overrideVars as Record<string, string>),
      },
    };
  }, [overrideCount, overrideVars, theme]);

  // Tonal markers respect pending overrides — every reassignment shows
  // up as a new marker on the chosen ramp+stop the moment the user
  // changes a dropdown. Auto-detected matches still drive markers for
  // tokens that haven't been edited yet.
  const effectiveUsage = useMemo(
    () => buildTonalUsageMap(audit.snap, overrides),
    [audit.snap, overrides],
  );

  const renderColumns = () => {
    if (singleMode) {
      return (
        <ModeColumn
          theme={effectiveTheme}
          mode={singleMode}
          coreSwatches={coreSwatches}
          extraSections={extraSections}
          leadingExtras={leadingExtras}
          shadowDescription={shadowDescription}
          overrideVars={overrideVars}
          bare
        />
      );
    }
    return (
      <>
        <ModeColumn
          theme={effectiveTheme}
          mode="light"
          coreSwatches={coreSwatches}
          extraSections={extraSections}
          leadingExtras={leadingExtras}
          shadowDescription={shadowDescription}
          overrideVars={overrideVars}
        />
        <ModeColumn
          theme={effectiveTheme}
          mode="dark"
          coreSwatches={coreSwatches}
          extraSections={extraSections}
          leadingExtras={leadingExtras}
          shadowDescription={shadowDescription}
          overrideVars={overrideVars}
        />
      </>
    );
  };

  if (componentPreviewOnly) {
    // Embedded usage (e.g. inside docsite layouts) skips the audit drawer too —
    // hosts that need it can mount <ThemeAuditDrawer> separately.
    return <div style={columnsStyle}>{renderColumns()}</div>;
  }

  // Page chrome (title/subtitle) uses the singleMode when set so the outer
  // surface matches the rendered theme; otherwise default to light.
  const chromeMode: Mode = singleMode ?? 'light';

  // Render the Tonal Palettes section once per mode (light + dark) so
  // designers see how the same HCT ramps feel against each theme surface.
  // For singleMode themes (e.g. gothic, y2k), only the relevant mode renders.
  const tonalModes: Mode[] = singleMode ? [singleMode] : ['light', 'dark'];

  return (
    <>
      {/* Preview surface — themed by the theme being audited. Override
          CSS vars live here so they cascade into every preview component
          (page background, tonal block, mode columns) but NOT into the
          audit drawer rendered in its own theme below. */}
      <Theme theme={effectiveTheme} mode={chromeMode}>
        <LayerProvider>
          <div
            style={{
              ...S.page,
              ...overrideVars,
              margin: -0,
              position: 'relative',
              zIndex: 1,
            }}>
            <div style={S.inner}>
              <h1 style={S.title}>{title}</h1>
              <p style={S.subtitle}>{subtitle}</p>
              <div
                role="status"
                aria-live="polite"
                style={{
                  alignItems: 'center',
                  background: overrideCount
                    ? 'var(--color-warning-muted)'
                    : 'var(--color-background-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 999,
                  color: overrideCount
                    ? 'var(--color-warning)'
                    : 'var(--color-text-secondary)',
                  display: 'inline-flex',
                  fontFamily: 'var(--font-family-code)',
                  fontSize: 11,
                  fontWeight: 650,
                  gap: 6,
                  marginBottom: 20,
                  padding: '5px 9px',
                }}>
                <span aria-hidden="true">{overrideCount ? '◆' : '●'}</span>
                {overrideCount
                  ? `Draft preview · ${overrideCount} pending token ${overrideCount === 1 ? 'override' : 'overrides'}`
                  : `Built ${theme.name} theme · no pending overrides`}
              </div>
              {tonalModes.map(m => (
                <Theme key={m} theme={effectiveTheme} mode={m}>
                  <LayerProvider>
                    {/* Spread overrideVars *inside* the inner Theme so
                      pending overrides win over the theme's own
                      `:scope { --color-*: … }` rules. Same trick the
                      ModeColumn uses. */}
                    <div
                      style={{
                        ...overrideVars,
                        background: 'var(--color-background-body)',
                        color: 'var(--color-text-primary)',
                        borderRadius: 16,
                        padding: 'clamp(16px, 2vw, 24px)',
                        marginBottom: 16,
                        border: '1px solid var(--color-border)',
                      }}>
                      {tonalModes.length > 1 && (
                        <p style={{...S.modeLabel, marginBottom: 16}}>
                          {m === 'light' ? 'Light Mode' : 'Dark Mode'}
                        </p>
                      )}
                      <TonalSection
                        colors={tonalColors}
                        mode={m}
                        usage={effectiveUsage}
                      />
                    </div>
                  </LayerProvider>
                </Theme>
              ))}
              <div style={columnsStyle}>{renderColumns()}</div>
            </div>
          </div>
        </LayerProvider>
      </Theme>

      {/* Audit drawer + draft indicator — mounted *outside* the audited
          theme so the drawer's own chrome (buttons, borders, text) stays
          stable regardless of which theme is being previewed. Uses the
          neutral default theme so it always looks the same across all 5
          palette pages. Position-fixed elements inside the drawer
          attach to the viewport, not this wrapper. */}
      <Theme theme={neutralTheme} mode="light">
        <LayerProvider>
          <ThemeAuditDrawer
            audit={audit}
            themeName={theme.name}
            overrides={overrides}
            dispatchOverrides={dispatchOverrides}
          />
        </LayerProvider>
      </Theme>
    </>
  );
}
