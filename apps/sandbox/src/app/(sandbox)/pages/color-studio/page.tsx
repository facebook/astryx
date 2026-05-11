'use client';

import {useState, useCallback, useMemo, useRef} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
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
  toneToOklabL,
  DEFAULT_OKLCH_CHROMA,
  DEFAULT_OKLCH_HUE,
  extractColorsFromImage,
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

const DEFAULT_TONE_STEPS = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

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
        } else if (ch.role === 'accent') {
          const oklch = assigned ? hexToOklch(assigned.hex) : {C: ch.oklchChroma, H: ch.oklchHue};
          hue = oklch.H;
          chroma = Math.max(oklch.C, 0.09) * vibrancy;
        } else {
          const oklch = assigned ? hexToOklch(assigned.hex) : {C: ch.oklchChroma, H: ch.oklchHue};
          hue = oklch.H;
          chroma = Math.max(oklch.C, ch.oklchChroma) * vibrancy;
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
        const chroma = Math.max(oklch.C, 0.09) * vibrancy;
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
  const [toneSteps, setToneSteps] = useState<number[]>(DEFAULT_TONE_STEPS);
  const [newStep, setNewStep] = useState('');
  const [grayTone, setGrayTone] = useState<'warm' | 'neutral' | 'cool'>(
    'neutral',
  );
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

              </XDSVStack>

              {/* --- Custom Colors --- */}
              <XDSVStack gap={3}>
                <XDSHStack hAlign="space-between" vAlign="center">
                  <XDSText type="label" weight="semibold">Custom Colors</XDSText>
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

              {/* --- Tone Steps --- */}
              <XDSVStack gap={3}>
                <XDSText type="label" weight="semibold">Tone Steps</XDSText>
                <XDSHStack gap={1} wrap="wrap">
                  {toneSteps.map(t => (
                    <span
                      key={t}
                      onClick={() => setToneSteps(prev => prev.filter(s => s !== t))}
                      style={{
                        padding: '2px 6px',
                        fontSize: 10,
                        fontFamily: MONO,
                        borderRadius: 4,
                        background: 'var(--color-background-muted)',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                      }}
                      title="Click to remove"
                    >
                      {t}
                    </span>
                  ))}
                </XDSHStack>
                <XDSHStack gap={2} vAlign="center">
                  <div style={{flex: 1, minWidth: 0}}>
                    <XDSTextInput
                      label="Add step"
                      isLabelHidden
                      placeholder="e.g. 15"
                      value={newStep}
                      onChange={v => setNewStep(v)}
                      size="sm"
                    />
                  </div>
                  <XDSButton
                    label="Add"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const n = parseInt(newStep, 10);
                      if (!isNaN(n) && n >= 0 && n <= 100 && !toneSteps.includes(n)) {
                        setToneSteps(prev => [...prev, n].sort((a, b) => a - b));
                        setNewStep('');
                      }
                    }}
                  />
                  <XDSButton
                    label="Reset"
                    variant="ghost"
                    size="sm"
                    onClick={() => setToneSteps(DEFAULT_TONE_STEPS)}
                  />
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
          grayTone={grayTone}
          customChannels={customChannels}
          toneSteps={toneSteps}
        />

      </main>
    </div>
  );
}
