'use client';

import {useState, useCallback, useMemo, useRef} from 'react';
import {XDSBanner} from '@xds/core/Banner';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTheme, defineTheme} from '@xds/core/theme';
import {XDSLayerProvider} from '@xds/core/Layer';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSCard} from '@xds/core/Card';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSSelector} from '@xds/core/Selector';
import {XDSSlider} from '@xds/core/Slider';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';

import {
  hexToHct,
  hexToOklch,
  oklchClampedHex,
  hctToHex,
  tonalPalette,
  oklchTonalPalette,
  TONE_STEPS,
  DEFAULT_OKLCH_CHROMA,
  DEFAULT_OKLCH_HUE,
  extractColorsFromImage,
  parseColorInput,
  buildThemeTokens,
  generateExportCode,
  THEME_ROLES,
  type PaletteColor,
  type ThemeRole,
  type ThemeOptions,
} from './colorUtils';

// =============================================================================
// Styles
// =============================================================================

const MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";

const S = {
  page: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-surface, #fff)',
  } as React.CSSProperties,
  sidebar: {
    width: 320,
    flexShrink: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  } as React.CSSProperties,
  sidebarPanel: {
    flex: 1,
    backgroundColor: 'var(--color-background-card, #fff)',
    borderRadius: 16,
    border: '1px solid var(--color-border, #e0e0e0)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    margin: 8,
  } as React.CSSProperties,
  sidebarHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  sidebarScroll: {
    flex: 1,
    overflow: 'auto',
    padding: 16,
  } as React.CSSProperties,
  main: {
    flex: 1,
    overflowY: 'auto' as const,
    height: '100vh',
    padding: 24,
  } as React.CSSProperties,
  swatch: (bg: string) =>
    ({
      width: 28,
      height: 28,
      borderRadius: 4,
      background: bg,
      border: '1px solid rgba(0,0,0,0.08)',
      flexShrink: 0,
      position: 'relative' as const,
      overflow: 'hidden',
      cursor: 'pointer',
    }) as React.CSSProperties,
  colorInput: {
    position: 'absolute' as const,
    inset: -8,
    width: 'calc(100% + 16px)',
    height: 'calc(100% + 16px)',
    border: 'none',
    cursor: 'pointer',
    opacity: 0,
  } as React.CSSProperties,
  dropZone: {
    border: '2px dashed #d0d0d0',
    borderRadius: 8,
    padding: '12px 8px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    position: 'relative' as const,
  } as React.CSSProperties,
  dropInput: {
    position: 'absolute' as const,
    inset: 0,
    opacity: 0,
    cursor: 'pointer',
  } as React.CSSProperties,
  imgThumb: {
    width: '100%',
    borderRadius: 6,
    marginTop: 8,
  } as React.CSSProperties,
  previewCol: {
    background: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 24,
  } as React.CSSProperties,
  previewLabel: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    opacity: 0.6,
  } as React.CSSProperties,
  compSection: {} as React.CSSProperties,
  compTitle: {
    fontSize: 13,
    fontWeight: 600,
    margin: 0,
    marginBottom: 10,
  } as React.CSSProperties,
  tonalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  } as React.CSSProperties,
  tonalLabel: {
    width: 70,
    flexShrink: 0,
    fontSize: 9,
    fontFamily: MONO,
    color: '#888',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  tonalStrip: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.08)',
  } as React.CSSProperties,
  tonalCell: (bg: string) =>
    ({
      flex: 1,
      height: 28,
      background: bg,
    }) as React.CSSProperties,
  tonalHct: {
    width: 55,
    flexShrink: 0,
    fontSize: 8,
    fontFamily: MONO,
    color: '#52525b',
    textAlign: 'right' as const,
  } as React.CSSProperties,
};

// =============================================================================
// Multi-color presets
// =============================================================================

interface PresetPalette {
  label: string;
  colors: {name: string; hex: string; role?: ThemeRole}[];
}

const PRESETS: PresetPalette[] = [
  {
    label: 'Default',
    colors: [{name: 'Accent', hex: '#0064E0', role: 'accent'}],
  },
  {
    label: 'Brutalist',
    colors: [{name: 'Hot Pink', hex: '#FF1493', role: 'accent'}],
  },
  {
    label: 'Chocolate',
    colors: [
      {name: 'Brown', hex: '#8C5927', role: 'accent'},
      {name: 'Caramel', hex: '#B88859', role: 'orange'},
      {name: 'Cream', hex: '#EDE4D4', role: 'gray'},
    ],
  },
  {
    label: 'Daily',
    colors: [
      {name: 'Charcoal', hex: '#292724', role: 'accent'},
      {name: 'Warm Gray', hex: '#85817A', role: 'gray'},
    ],
  },
  {
    label: 'Gothic',
    colors: [
      {name: 'Dark Blue', hex: '#24292D', role: 'accent'},
      {name: 'Slate', hex: '#495056', role: 'gray'},
      {name: 'Ice', hex: '#E8F1F6', role: 'cyan'},
    ],
  },
  {
    label: 'Matcha',
    colors: [
      {name: 'Earth Green', hex: '#3E481D', role: 'accent'},
      {name: 'Moss', hex: '#707E46', role: 'green'},
      {name: 'Sage', hex: '#C0CBA9', role: 'teal'},
    ],
  },
  {
    label: 'Neutral',
    colors: [
      {name: 'Black', hex: '#1A1A1A', role: 'accent'},
      {name: 'Gray', hex: '#888888', role: 'gray'},
    ],
  },
  {
    label: 'Stone',
    colors: [
      {name: 'Charcoal', hex: '#28282A', role: 'accent'},
      {name: 'Warm Gray', hex: '#84848B', role: 'gray'},
    ],
  },
  {
    label: 'Y2K',
    colors: [
      {name: 'Olive', hex: '#7B9900', role: 'accent'},
      {name: 'Orange', hex: '#E8791D', role: 'orange'},
      {name: 'Teal', hex: '#2A9D8F', role: 'teal'},
      {name: 'Pink', hex: '#FF69B4', role: 'pink'},
      {name: 'Purple', hex: '#9B59B6', role: 'purple'},
    ],
  },
];

// =============================================================================
// Component Sections (unchanged)
// =============================================================================

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

function BadgeSection() {
  return (
    <div style={S.compSection}>
      <h3 style={S.compTitle}>Semantic Badges</h3>
      <XDSHStack gap={2} wrap="wrap">
        <XDSBadge variant="success" label="Success" />
        <XDSBadge variant="error" label="Error" />
        <XDSBadge variant="warning" label="Warning" />
        <XDSBadge variant="info" label="Info" />
        <XDSBadge variant="neutral" label="Neutral" />
      </XDSHStack>
      <div style={{marginTop: 10}}>
        <h3 style={S.compTitle}>Categorical Badges</h3>
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
    </div>
  );
}

function BannerSection() {
  return (
    <div style={S.compSection}>
      <h3 style={S.compTitle}>Banners</h3>
      <XDSVStack gap={2}>
        <XDSBanner
          status="info"
          title="Info banner"
          description="Uses accent color."
        />
        <XDSBanner
          status="success"
          title="Success banner"
          description="Description text."
        />
        <XDSBanner
          status="warning"
          title="Warning banner"
          description="Description text."
        />
        <XDSBanner
          status="error"
          title="Error banner"
          description="Description text."
        />
      </XDSVStack>
    </div>
  );
}

function InputSection() {
  return (
    <div style={S.compSection}>
      <h3 style={S.compTitle}>Inputs</h3>
      <XDSVStack gap={3}>
        <XDSTextInput
          label="Default"
          placeholder="Placeholder text"
          value=""
          onChange={() => {}}
        />
        <XDSTextInput
          label="Success"
          value="Valid"
          onChange={() => {}}
          status={{type: 'success', message: 'Looks good!'}}
        />
        <XDSTextInput
          label="Error"
          value="Invalid"
          onChange={() => {}}
          status={{type: 'error', message: 'Required.'}}
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

function ButtonSection() {
  return (
    <div style={S.compSection}>
      <h3 style={S.compTitle}>Buttons</h3>
      <XDSHStack gap={3} vAlign="center">
        <XDSButton label="Primary" variant="primary" />
        <XDSButton label="Secondary" variant="secondary" />
        <XDSButton label="Ghost" variant="ghost" />
        <XDSButton label="Destructive" variant="destructive" />
      </XDSHStack>
    </div>
  );
}

function SwitchSection() {
  return (
    <div style={S.compSection}>
      <h3 style={S.compTitle}>Switch</h3>
      <XDSVStack gap={3}>
        <XDSSwitch label="Off" value={false} onChange={() => {}} />
        <XDSSwitch label="On" value={true} onChange={() => {}} />
        <XDSSwitch
          label="Disabled"
          value={false}
          onChange={() => {}}
          isDisabled
        />
      </XDSVStack>
    </div>
  );
}

function ProgressSection() {
  return (
    <div style={S.compSection}>
      <h3 style={S.compTitle}>Progress</h3>
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

function CardVariantsSection() {
  return (
    <div style={S.compSection}>
      <h3 style={S.compTitle}>Card Variants</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
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

function TextHierarchy() {
  return (
    <div style={S.compSection}>
      <h3 style={S.compTitle}>Text Hierarchy</h3>
      <XDSVStack gap={1}>
        <XDSHeading level={1}>Heading 1</XDSHeading>
        <XDSHeading level={2}>Heading 2</XDSHeading>
        <XDSHeading level={3}>Heading 3</XDSHeading>
        <XDSText type="body">Body — primary</XDSText>
        <XDSText type="body" color="secondary">
          Body — secondary
        </XDSText>
        <XDSText type="supporting">Supporting text</XDSText>
      </XDSVStack>
    </div>
  );
}

function SpinnerSection() {
  return (
    <div style={S.compSection}>
      <h3 style={S.compTitle}>Spinners</h3>
      <XDSHStack gap={4} vAlign="center">
        <XDSSpinner size="sm" />
        <XDSSpinner size="md" />
        <XDSSpinner size="lg" />
      </XDSHStack>
    </div>
  );
}

const BACKGROUND_SURFACES = [
  {name: 'Body', token: '--color-background-body', light: 'N99', dark: 'N5'},
  {
    name: 'Surface',
    token: '--color-background-surface',
    light: 'N100',
    dark: 'N10',
  },
  {name: 'Card', token: '--color-background-card', light: 'N100', dark: 'N15'},
  {
    name: 'Popover',
    token: '--color-background-popover',
    light: 'N100',
    dark: 'N20',
  },
  {
    name: 'Muted',
    token: '--color-background-muted',
    light: 'N10 @5%',
    dark: 'N10 @50%',
  },
  {
    name: 'Inverted',
    token: '--color-background-inverted',
    light: 'N10',
    dark: 'N99',
  },
] as const;

function BackgroundsSection({mode}: {mode: 'light' | 'dark'}) {
  return (
    <div style={S.compSection}>
      <h3 style={S.compTitle}>Backgrounds</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
        }}>
        {BACKGROUND_SURFACES.map(bg => (
          <div
            key={bg.name}
            style={{
              background: `var(${bg.token})`,
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              padding: '12px 8px',
              textAlign: 'center' as const,
            }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color:
                  bg.name === 'Inverted'
                    ? 'var(--color-text-primary)'
                    : undefined,
                mixBlendMode:
                  bg.name === 'Inverted' ? ('difference' as const) : undefined,
                display: 'flex',
                flexDirection: 'column' as const,
                gap: 2,
              }}>
              <span>{bg.name}</span>
              <span style={{fontSize: 8, fontWeight: 400, opacity: 0.6}}>
                {mode === 'light' ? bg.light : bg.dark}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Preview Column
// =============================================================================

function PreviewColumn({
  mode,
  theme,
}: {
  mode: 'light' | 'dark';
  theme: ReturnType<typeof defineTheme>;
}) {
  return (
    <XDSTheme theme={theme} mode={mode}>
      <XDSLayerProvider>
        <div style={S.previewCol}>
          <p style={S.previewLabel}>
            {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
          </p>
          <BackgroundsSection mode={mode} />
          <TextHierarchy />
          <BadgeSection />
          <BannerSection />
          <InputSection />
          <ButtonSection />
          <SwitchSection />
          <SpinnerSection />
          <ProgressSection />
          <CardVariantsSection />
        </div>
      </XDSLayerProvider>
    </XDSTheme>
  );
}

// =============================================================================
// Palette Color Entry
// =============================================================================

const ROLE_OPTIONS = [
  {value: '', label: 'None'},
  ...THEME_ROLES.map(r => ({
    value: r.value,
    label: `${r.label}`,
    disabled: false,
  })),
];

function PaletteEntry({
  color,
  canRemove,
  usedRoles,
  onChange,
  onRemove,
}: {
  color: PaletteColor;
  canRemove: boolean;
  usedRoles: Set<ThemeRole>;
  onChange: (id: string, changes: Partial<PaletteColor>) => void;
  onRemove: (id: string) => void;
}) {
  const roleOptions = useMemo(
    () =>
      ROLE_OPTIONS.map(o => ({
        ...o,
        disabled:
          o.value !== '' &&
          o.value !== color.role &&
          usedRoles.has(o.value as ThemeRole),
      })),
    [color.role, usedRoles],
  );

  return (
    <XDSHStack gap={2} vAlign="center" style={{padding: '6px 0'}}>
      <div style={S.swatch(color.hex)}>
        <input
          type="color"
          value={color.hex}
          onChange={e => onChange(color.id, {hex: e.target.value})}
          style={S.colorInput}
        />
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <XDSTextInput
          label="Hex"
          isLabelHidden
          value={color.hex}
          onChange={v => {
            const parsed = parseColorInput(v.trim());
            if (parsed) onChange(color.id, {hex: parsed});
          }}
          size="sm"
        />
      </div>
      <XDSSelector
        label="Role"
        isLabelHidden
        options={roleOptions}
        value={color.role ?? ''}
        onChange={v =>
          onChange(color.id, {role: (v || undefined) as ThemeRole | undefined})
        }
        size="sm"
      />
      {canRemove && (
        <XDSIconButton
          label="Remove"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(color.id)}
          icon={<span style={{fontSize: 14, lineHeight: 1}}>✕</span>}
        />
      )}
    </XDSHStack>
  );
}

// =============================================================================
// Tonal Ramps — full color system
// =============================================================================

interface ColorChannel {
  name: string;
  role: ThemeRole;
  oklchHue: number;
  oklchChroma: number;
}

// Channel definitions derive hue/chroma from the shared defaults
// so ramps and token generation stay in sync.
function makeChannel(name: string, role: ThemeRole): ColorChannel {
  return {
    name,
    role,
    oklchHue: DEFAULT_OKLCH_HUE[role] ?? 0,
    oklchChroma: DEFAULT_OKLCH_CHROMA[role] ?? 0.13,
  };
}

const CHANNEL_GROUPS: {label: string; channels: ColorChannel[]}[] = [
  {
    label: 'Core',
    channels: [makeChannel('Accent', 'accent'), makeChannel('Gray', 'gray')],
  },
  {
    label: 'Categorical',
    channels: [
      makeChannel('Red', 'red'),
      makeChannel('Orange', 'orange'),
      makeChannel('Yellow', 'yellow'),
      makeChannel('Green', 'green'),
      makeChannel('Teal', 'teal'),
      makeChannel('Cyan', 'cyan'),
      makeChannel('Blue', 'blue'),
      makeChannel('Purple', 'purple'),
      makeChannel('Pink', 'pink'),
    ],
  },
];

const STATUS_CHANNELS: ColorChannel[] = [
  makeChannel('Success', 'success'),
  makeChannel('Warning', 'warning'),
  makeChannel('Error', 'error'),
];

function TonalRamps({
  palette,
  vibrancy,
  themeName,
  grayTone,
}: {
  palette: PaletteColor[];
  vibrancy: number;
  themeName: string;
  grayTone: 'warm' | 'neutral' | 'cool';
}) {
  const roleMap = useMemo(() => {
    const map = new Map<ThemeRole, PaletteColor>();
    for (const pc of palette) {
      if (pc.role) map.set(pc.role, pc);
    }
    return map;
  }, [palette]);

  const unassigned = palette.filter(pc => !pc.role);

  return (
    <div style={{marginBottom: 24}}>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#1a1a1a',
          margin: 0,
          marginBottom: 4,
        }}>
        Tonal Palettes{' '}
        <span style={{fontWeight: 400, color: '#888'}}> — {themeName}</span>
      </h2>
      <p style={{fontSize: 11, color: '#888', margin: 0, marginBottom: 12}}>
        OKLCH tonal ramps — {TONE_STEPS.length} steps per channel, perceptually
        equalized.
        {vibrancy !== 1.0 && ` Vibrancy: ${vibrancy.toFixed(1)}x.`} Channels
        with palette overrides are highlighted.
      </p>
      <div style={{...S.tonalRow, marginBottom: 6}}>
        <span style={S.tonalLabel} />
        <div style={S.tonalStrip}>
          {TONE_STEPS.map(t => (
            <div
              key={t}
              style={{
                flex: 1,
                textAlign: 'center' as const,
                fontSize: 8,
                fontFamily: MONO,
                color: '#aaa',
              }}>
              {t}
            </div>
          ))}
        </div>
        <span style={S.tonalHct} />
      </div>
      {CHANNEL_GROUPS.map(group => (
        <div key={group.label} style={{marginBottom: 14}}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: '#aaa',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.8px',
              marginBottom: 4,
            }}>
            {group.label}
          </div>
          {group.channels.map(ch => {
            const assigned = roleMap.get(ch.role);
            const hue = assigned ? hexToOklch(assigned.hex).H : ch.oklchHue;
            if (ch.role === 'gray') {
              const grayHue = assigned
                ? hexToOklch(assigned.hex).H
                : grayTone === 'warm'
                  ? 60
                  : grayTone === 'cool'
                    ? 260
                    : 0;
              const grayC = assigned
                ? Math.min(hexToOklch(assigned.hex).C, 0.02)
                : grayTone === 'neutral'
                  ? 0.003
                  : 0.012;
              const tones = oklchTonalPalette(grayHue, grayC, vibrancy);
              return (
                <div key={ch.role} style={S.tonalRow}>
                  <span
                    style={{
                      ...S.tonalLabel,
                      color: assigned ? '#4f46e5' : '#888',
                      fontWeight: assigned ? 600 : 400,
                    }}
                    title={
                      assigned
                        ? `${ch.name} ← ${assigned.name}`
                        : `${ch.name} (default)`
                    }>
                    {ch.name}
                  </span>
                  <div style={S.tonalStrip}>
                    {TONE_STEPS.map(t => (
                      <div
                        key={t}
                        style={S.tonalCell(tones[t])}
                        title={`${ch.name} T${t}: ${tones[t]}`}
                      />
                    ))}
                  </div>
                  <span style={S.tonalHct}>
                    H:{grayHue.toFixed(0)} C:{(grayC * vibrancy).toFixed(2)}
                  </span>
                </div>
              );
            }
            if (group.label === 'Categorical') {
              const catChroma = assigned
                ? Math.max(hexToOklch(assigned.hex).C, ch.oklchChroma)
                : ch.oklchChroma;
              const tones = oklchTonalPalette(hue, catChroma, vibrancy);
              return (
                <div key={ch.role} style={S.tonalRow}>
                  <span
                    style={{
                      ...S.tonalLabel,
                      color: assigned ? '#4f46e5' : '#888',
                      fontWeight: assigned ? 600 : 400,
                    }}
                    title={
                      assigned
                        ? `${ch.name} ← ${assigned.name}`
                        : `${ch.name} (default)`
                    }>
                    {ch.name}
                  </span>
                  <div style={S.tonalStrip}>
                    {TONE_STEPS.map(t => (
                      <div
                        key={t}
                        style={S.tonalCell(tones[t])}
                        title={`${ch.name} T${t}: ${tones[t]}`}
                      />
                    ))}
                  </div>
                  <span style={S.tonalHct}>H:{hue.toFixed(0)}</span>
                </div>
              );
            }
            const coreOklch = assigned
              ? hexToOklch(assigned.hex)
              : {L: 0.5, C: ch.oklchChroma, H: ch.oklchHue};
            const coreChroma = Math.max(coreOklch.C, 0.09);
            const tones = oklchTonalPalette(hue, coreChroma, vibrancy);
            return (
              <div key={ch.role} style={S.tonalRow}>
                <span
                  style={{
                    ...S.tonalLabel,
                    color: assigned ? '#4f46e5' : '#888',
                    fontWeight: assigned ? 600 : 400,
                  }}
                  title={
                    assigned
                      ? `${ch.name} ← ${assigned.name} (${assigned.hex})`
                      : `${ch.name} (default)`
                  }>
                  {ch.name}
                </span>
                <div style={S.tonalStrip}>
                  {TONE_STEPS.map(t => (
                    <div
                      key={t}
                      style={S.tonalCell(tones[t])}
                      title={`${ch.name} T${t}: ${tones[t]}`}
                    />
                  ))}
                </div>
                <span style={S.tonalHct}>
                  H:{hue.toFixed(0)} C:{(coreChroma * vibrancy).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      ))}
      {(() => {
        const assignedStatus = STATUS_CHANNELS.filter(ch =>
          roleMap.has(ch.role),
        );
        if (!assignedStatus.length) return null;
        return (
          <div style={{marginBottom: 14}}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: '#aaa',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.8px',
                marginBottom: 4,
              }}>
              Status
            </div>
            {assignedStatus.map(ch => {
              const assigned = roleMap.get(ch.role)!;
              const oklch = hexToOklch(assigned.hex);
              const chroma = Math.max(oklch.C, ch.oklchChroma) * vibrancy;
              const tones = oklchTonalPalette(oklch.H, chroma);
              return (
                <div key={ch.role} style={S.tonalRow}>
                  <span
                    style={{...S.tonalLabel, color: '#4f46e5', fontWeight: 600}}
                    title={`${ch.name} ← ${assigned.name} (${assigned.hex})`}>
                    {ch.name}
                  </span>
                  <div style={S.tonalStrip}>
                    {TONE_STEPS.map(t => (
                      <div
                        key={t}
                        style={S.tonalCell(tones[t])}
                        title={`${ch.name} T${t}: ${tones[t]}`}
                      />
                    ))}
                  </div>
                  <span style={S.tonalHct}>
                    H:{oklch.H.toFixed(0)} C:{chroma.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })()}
      {unassigned.length > 0 && (
        <>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: '#888',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.8px',
              marginTop: 12,
              marginBottom: 6,
            }}>
            Unassigned
          </div>
          {unassigned.map(pc => {
            const oklch = hexToOklch(pc.hex);
            const chroma = Math.max(oklch.C, 0.05) * vibrancy;
            const tones = oklchTonalPalette(oklch.H, chroma);
            return (
              <div key={pc.id} style={S.tonalRow}>
                <span style={S.tonalLabel}>{pc.name}</span>
                <div style={S.tonalStrip}>
                  {TONE_STEPS.map(t => (
                    <div
                      key={t}
                      style={S.tonalCell(tones[t])}
                      title={`${pc.name} T${t}: ${tones[t]}`}
                    />
                  ))}
                </div>
                <span style={S.tonalHct}>
                  H:{oklch.H.toFixed(0)} C:{chroma.toFixed(2)}
                </span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// =============================================================================
// Contrast Matrix
// =============================================================================

// =============================================================================
// Export Panel
// =============================================================================

function ExportPanel({
  palette,
  options,
}: {
  palette: PaletteColor[];
  options: ThemeOptions;
}) {
  const [copied, setCopied] = useState(false);
  const code = useMemo(
    () => generateExportCode(palette, options),
    [palette, options],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <XDSButton
      label={copied ? 'Copied!' : 'Export'}
      variant="ghost"
      size="sm"
      onClick={handleCopy}
    />
  );
}

// =============================================================================
// ID Generator
// =============================================================================

let _nextId = 1;
function nextId(): string {
  return String(_nextId++);
}

function makePaletteColor(
  name: string,
  hex: string,
  role?: ThemeRole,
): PaletteColor {
  return {id: nextId(), name, hex, role};
}

// =============================================================================
// Page Component
// =============================================================================

export default function ColorStudioPage() {
  const [palette, setPalette] = useState<PaletteColor[]>([
    makePaletteColor('Blue', '#0064E0', 'accent'),
  ]);
  const [themeName, setThemeName] = useState('Custom');
  const [exactAccent, setExactAccent] = useState(true);
  const [vibrancy, setVibrancy] = useState(1.0);
  const [grayTone, setGrayTone] = useState<'warm' | 'neutral' | 'cool'>(
    'neutral',
  );
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const themeOptions: ThemeOptions = useMemo(
    () => ({
      warmth: grayTone as 'warm' | 'cool' | 'neutral',
      surfaceStyle: 'tinted' as const,
      exactAccent,
      vibrancy,
      radiusMultiplier: 1,
    }),
    [grayTone, exactAccent, vibrancy],
  );

  const usedRoles = useMemo(
    () => new Set(palette.filter(c => c.role).map(c => c.role!)),
    [palette],
  );

  const theme = useMemo(() => {
    const {accentHex, tokens} = buildThemeTokens(palette, themeOptions);
    const bodyColor =
      grayTone === 'warm'
        ? '#F5F0E8'
        : grayTone === 'cool'
          ? '#EEF2F7'
          : undefined;

    return defineTheme({
      name: 'studio-preview',
      color: {
        accent: accentHex,
        neutralStyle: grayTone,
        ...(bodyColor ? {bodyColor} : {}),
      },
      radius: {base: 4, multiplier: 1},
      tokens,
    });
  }, [palette, themeOptions, grayTone]);

  const updateColor = useCallback(
    (id: string, changes: Partial<PaletteColor>) => {
      setPalette(prev => prev.map(c => (c.id === id ? {...c, ...changes} : c)));
    },
    [],
  );

  const removeColor = useCallback((id: string) => {
    setPalette(prev =>
      prev.length > 1 ? prev.filter(c => c.id !== id) : prev,
    );
  }, []);

  const addColor = useCallback(() => {
    const h = Math.random() * 360;
    const c = 30 + Math.random() * 50;
    const hex = hctToHex({hue: h, chroma: c, tone: 50});
    setPalette(prev => [...prev, makePaletteColor('Color ' + _nextId, hex)]);
  }, []);

  const loadPreset = useCallback((preset: PresetPalette) => {
    setThemeName(preset.label);
    setPalette(preset.colors.map(c => makePaletteColor(c.name, c.hex, c.role)));
  }, []);

  const handleImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      setImgSrc(src);
      const img = new Image();
      img.onload = () => {
        const colors = extractColorsFromImage(img);
        if (colors.length) {
          setPalette(
            colors.map((hex, i) =>
              makePaletteColor(
                `Extract ${i + 1}`,
                hex,
                i === 0 ? 'accent' : undefined,
              ),
            ),
          );
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div style={S.page}>
      {/* ═══ Sidebar ═══ */}
      <aside style={S.sidebar}>
        <div style={S.sidebarPanel}>
          <div style={S.sidebarHeader}>
            <XDSHeading level={4}>Color Studio</XDSHeading>
            <ExportPanel palette={palette} options={themeOptions} />
          </div>

          <div style={S.sidebarScroll}>
            <XDSVStack gap={5}>
              {/* --- Presets --- */}
              <XDSVStack gap={3}>
                <XDSText type="label" weight="semibold">
                  Presets
                </XDSText>
                <XDSHStack gap={1} wrap="wrap">
                  {PRESETS.map(p => (
                    <XDSButton
                      key={p.label}
                      label={p.label}
                      variant={themeName === p.label ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => loadPreset(p)}
                    />
                  ))}
                </XDSHStack>
              </XDSVStack>

              {/* --- Palette --- */}
              <XDSVStack gap={3}>
                <XDSHStack hAlign="between" vAlign="center">
                  <XDSText type="label" weight="semibold">
                    Palette
                  </XDSText>
                  <XDSIconButton
                    label="Add color"
                    variant="ghost"
                    size="sm"
                    onClick={addColor}
                    icon={<span style={{fontSize: 16, lineHeight: 1}}>+</span>}
                  />
                </XDSHStack>
                <XDSVStack gap={2}>
                  {palette.map(c => (
                    <PaletteEntry
                      key={c.id}
                      color={c}
                      canRemove={palette.length > 1}
                      usedRoles={usedRoles}
                      onChange={updateColor}
                      onRemove={removeColor}
                    />
                  ))}
                </XDSVStack>
              </XDSVStack>

              {/* --- Options --- */}
              <XDSVStack gap={4}>
                <XDSText type="label" weight="semibold">
                  Options
                </XDSText>

                <XDSSlider
                  label="Vibrancy"
                  min={50}
                  max={200}
                  step={10}
                  value={vibrancy * 100}
                  onChange={(v: number) => setVibrancy(v / 100)}
                  formatValue={v => `${Math.round(v)}%`}
                />

                <XDSHStack
                  vAlign="center"
                  style={{justifyContent: 'space-between'}}>
                  <XDSText type="supporting" color="secondary">
                    Gray Tone
                  </XDSText>
                  <XDSSegmentedControl
                    label="Gray tone"
                    value={grayTone}
                    onChange={v =>
                      setGrayTone(v as 'warm' | 'neutral' | 'cool')
                    }
                    size="sm">
                    <XDSSegmentedControlItem value="warm" label="Warm" />
                    <XDSSegmentedControlItem value="neutral" label="Neutral" />
                    <XDSSegmentedControlItem value="cool" label="Cool" />
                  </XDSSegmentedControl>
                </XDSHStack>

                <XDSHStack
                  vAlign="center"
                  style={{justifyContent: 'space-between'}}>
                  <XDSText type="supporting" color="secondary">
                    Accent Match
                  </XDSText>
                  <XDSSegmentedControl
                    label="Accent match"
                    value={exactAccent ? 'exact' : 'derived'}
                    onChange={v => setExactAccent(v === 'exact')}
                    size="sm">
                    <XDSSegmentedControlItem value="derived" label="Tonal" />
                    <XDSSegmentedControlItem value="exact" label="Exact" />
                  </XDSSegmentedControl>
                </XDSHStack>
              </XDSVStack>

              {/* --- Image Extraction --- */}
              <XDSVStack gap={3}>
                <XDSText type="label" weight="semibold">
                  Extract from Image
                </XDSText>
                <div
                  style={S.dropZone}
                  onClick={() => fileRef.current?.click()}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={S.dropInput}
                    onChange={e =>
                      e.target.files?.[0] && handleImage(e.target.files[0])
                    }
                  />
                  <XDSText type="supporting" color="secondary">
                    Drop image or click
                  </XDSText>
                </div>
                {imgSrc && (
                  <img src={imgSrc} alt="preview" style={S.imgThumb} />
                )}
              </XDSVStack>
            </XDSVStack>
          </div>
        </div>
      </aside>

      {/* ═══ Main Preview ═══ */}
      <main style={S.main}>
        <TonalRamps
          palette={palette}
          vibrancy={vibrancy}
          themeName={themeName}
          grayTone={grayTone}
        />

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
          <PreviewColumn mode="light" theme={theme} />
          <PreviewColumn mode="dark" theme={theme} />
        </div>
      </main>
    </div>
  );
}
