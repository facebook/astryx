// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useCallback, useMemo} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSSelector} from '@xds/core/Selector';
import {XDSSlider} from '@xds/core/Slider';
import {XDSNumberInput} from '@xds/core/NumberInput';
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
  toneToOklabL,
  DEFAULT_OKLCH_CHROMA,
  DEFAULT_OKLCH_HUE,
  parseColorInput,
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

const DEFAULT_CHANNELS: ColorChannel[] = [
  makeChannel('Accent', 'accent'),
  makeChannel('Gray', 'gray'),
  makeChannel('Red', 'red'),
  makeChannel('Orange', 'orange'),
  makeChannel('Yellow', 'yellow'),
  makeChannel('Green', 'green'),
  makeChannel('Teal', 'teal'),
  makeChannel('Cyan', 'cyan'),
  makeChannel('Blue', 'blue'),
  makeChannel('Purple', 'purple'),
  makeChannel('Pink', 'pink'),
];

interface CustomChannel {
  id: string;
  name: string;
  hex: string;
}

function generateToneSteps(count: number): number[] {
  if (count <= 1) return [50];
  return Array.from({length: count}, (_, i) => Math.round((i / (count - 1)) * 100));
}

function TonalRamps({
  palette,
  vibrancy,
  grayTone,
  customChannels,
  toneSteps,
}: {
  palette: PaletteColor[];
  vibrancy: number;
  grayTone: 'warm' | 'neutral' | 'cool';
  customChannels: CustomChannel[];
  toneSteps: number[];
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
        Tonal Palettes
      </h2>
      <p style={{fontSize: 11, color: '#888', margin: 0, marginBottom: 12}}>
        OKLCH tonal ramps — {toneSteps.length} steps per channel.
        {vibrancy !== 1.0 && ` Vibrancy: ${vibrancy.toFixed(1)}x.`}
      </p>
      <div style={{...S.tonalRow, marginBottom: 6}}>
        <span style={S.tonalLabel} />
        <div style={S.tonalStrip}>
          {toneSteps.map(t => (
            <div key={t} style={{flex: 1, textAlign: 'center' as const, fontSize: 8, fontFamily: MONO, color: '#aaa'}}>
              {t}
            </div>
          ))}
        </div>
        <span style={S.tonalHct} />
      </div>
      {DEFAULT_CHANNELS.map(ch => {
        const assigned = roleMap.get(ch.role);
        let hue: number;
        let chroma: number;

        if (ch.role === 'gray') {
          hue = assigned
            ? hexToOklch(assigned.hex).H
            : grayTone === 'warm' ? 60 : grayTone === 'cool' ? 260 : 0;
          chroma = (assigned
            ? Math.min(hexToOklch(assigned.hex).C, 0.02)
            : grayTone === 'neutral' ? 0.003 : 0.012) * vibrancy;
        } else {
          const oklch = assigned ? hexToOklch(assigned.hex) : {C: ch.oklchChroma, H: ch.oklchHue};
          hue = oklch.H;
          chroma = oklch.C * vibrancy;
        }

        return (
          <div key={ch.role} style={S.tonalRow}>
            <span
              style={{...S.tonalLabel, color: assigned ? '#4f46e5' : '#888', fontWeight: assigned ? 600 : 400}}
              title={assigned ? `${ch.name} ← ${assigned.name}` : `${ch.name} (default)`}>
              {ch.name}
            </span>
            <div style={S.tonalStrip}>
              {toneSteps.map(t => (
                <div key={t} style={S.tonalCell(oklchClampedHex(toneToOklabL(t), chroma, hue))} title={`${ch.name} T${t}`} />
              ))}
            </div>
            <span style={S.tonalHct}>H:{hue.toFixed(0)}</span>
          </div>
        );
      })}
      {customChannels.map(cc => {
        const oklch = hexToOklch(cc.hex);
        const chroma = oklch.C * vibrancy;
        return (
          <div key={cc.id} style={S.tonalRow}>
            <span style={{...S.tonalLabel, color: '#4f46e5', fontWeight: 600}}>{cc.name}</span>
            <div style={S.tonalStrip}>
              {toneSteps.map(t => (
                <div key={t} style={S.tonalCell(oklchClampedHex(toneToOklabL(t), chroma, oklch.H))} title={`${cc.name} T${t}`} />
              ))}
            </div>
            <span style={S.tonalHct}>H:{oklch.H.toFixed(0)}</span>
          </div>
        );
      })}
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
  const [vibrancy, setVibrancy] = useState(1.0);
  const [customChannels, setCustomChannels] = useState<CustomChannel[]>([]);
  const [stepCount, setStepCount] = useState(21);
  const toneSteps = useMemo(() => generateToneSteps(stepCount), [stepCount]);
  const [grayTone, setGrayTone] = useState<'warm' | 'neutral' | 'cool'>(
    'neutral',
  );

  const usedRoles = useMemo(
    () => new Set(palette.filter(c => c.role).map(c => c.role!)),
    [palette],
  );

  const themeOptions: ThemeOptions = useMemo(
    () => ({
      warmth: grayTone as 'warm' | 'cool' | 'neutral',
      surfaceStyle: 'tinted' as const,
      exactAccent: true,
      vibrancy,
      radiusMultiplier: 1,
    }),
    [grayTone, vibrancy],
  );

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
              {/* Controls */}
              <XDSHStack vAlign="center" style={{justifyContent: 'space-between'}}>
                <XDSText type="supporting" color="secondary">Steps</XDSText>
                <XDSNumberInput
                  label="Steps"
                  isLabelHidden
                  value={stepCount}
                  onChange={v => setStepCount(Math.max(2, Math.min(41, v)))}
                  min={2}
                  max={41}
                  step={1}
                  size="sm"
                />
              </XDSHStack>

              <XDSHStack vAlign="center" gap={3} style={{justifyContent: 'space-between'}}>
                <XDSText type="supporting" color="secondary" style={{flexShrink: 0}}>Vibrancy</XDSText>
                <div style={{flex: 1}}>
                  <XDSSlider
                    label="Vibrancy"
                    isLabelHidden
                    min={50}
                    max={200}
                    step={10}
                    value={vibrancy * 100}
                    onChange={(v: number) => setVibrancy(v / 100)}
                    formatValue={v => `${Math.round(v)}%`}
                  />
                </div>
              </XDSHStack>

              <XDSHStack vAlign="center" style={{justifyContent: 'space-between'}}>
                <XDSText type="supporting" color="secondary">Gray</XDSText>
                <XDSSegmentedControl
                  label="Gray tone"
                  value={grayTone}
                  onChange={v => setGrayTone(v as 'warm' | 'neutral' | 'cool')}
                  size="sm">
                  <XDSSegmentedControlItem value="warm" label="Warm" />
                  <XDSSegmentedControlItem value="neutral" label="Neutral" />
                  <XDSSegmentedControlItem value="cool" label="Cool" />
                </XDSSegmentedControl>
              </XDSHStack>

              {/* Color Set — colors with role assignments */}
              <XDSVStack gap={2}>
                <XDSHStack vAlign="center" style={{justifyContent: 'space-between'}}>
                  <XDSText type="label" weight="semibold">Brand Colors</XDSText>
                  <XDSIconButton
                    label="Add color"
                    variant="ghost"
                    size="sm"
                    onClick={addColor}
                    icon={<span style={{fontSize: 16, lineHeight: 1}}>+</span>}
                  />
                </XDSHStack>
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

              {/* Custom Colors — extra ramps without roles */}
              <XDSVStack gap={2}>
                <XDSHStack vAlign="center" style={{justifyContent: 'space-between'}}>
                  <XDSText type="label" weight="semibold">Color Sets</XDSText>
                  <XDSIconButton
                    label="Add custom color"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const h = Math.random() * 360;
                      const hex = oklchClampedHex(0.5, 0.12, h);
                      setCustomChannels(prev => [...prev, {id: nextId(), name: `Custom ${prev.length + 1}`, hex}]);
                    }}
                    icon={<span style={{fontSize: 16, lineHeight: 1}}>+</span>}
                  />
                </XDSHStack>
                {customChannels.length === 0 && (
                  <XDSText type="supporting" color="secondary">Add colors to generate extra ramps</XDSText>
                )}
                {customChannels.map(cc => (
                  <XDSHStack key={cc.id} gap={2} vAlign="center" style={{padding: '4px 0'}}>
                    <div style={S.swatch(cc.hex)}>
                      <input
                        type="color"
                        value={cc.hex}
                        onChange={e => setCustomChannels(prev => prev.map(c => c.id === cc.id ? {...c, hex: e.target.value} : c))}
                        style={S.colorInput}
                      />
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <XDSTextInput
                        label="Name"
                        isLabelHidden
                        value={cc.name}
                        onChange={v => setCustomChannels(prev => prev.map(c => c.id === cc.id ? {...c, name: v} : c))}
                        size="sm"
                      />
                    </div>
                    <XDSIconButton
                      label="Remove"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomChannels(prev => prev.filter(c => c.id !== cc.id))}
                      icon={<span style={{fontSize: 14, lineHeight: 1}}>✕</span>}
                    />
                  </XDSHStack>
                ))}
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
          grayTone={grayTone}
          customChannels={customChannels}
          toneSteps={toneSteps}
        />

      </main>
    </div>
  );
}
