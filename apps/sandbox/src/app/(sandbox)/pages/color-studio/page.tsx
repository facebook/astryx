'use client';

import {useState, useCallback, useMemo, useRef} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {
  hexToHct,
  hctToHex,
  tonalPalette,
  TONE_STEPS,
  generateHarmony,
  deriveSemanticRoles,
  generateCategorical,
  generateExpressive,
  contrastRatio,
  wcagGrade,
  extractColorsFromImage,
  parseColorInput,
  type HarmonyType,
  type HarmonyColor,
  type SemanticRole,
} from './colorUtils';

// =============================================================================
// Styles
// =============================================================================

const S = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0e0e10',
    color: '#fafafa',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  } as React.CSSProperties,
  sidebar: {
    width: 320,
    flexShrink: 0,
    borderRight: '1px solid rgba(255,255,255,0.08)',
    background: '#18181b',
    padding: 20,
    overflowY: 'auto',
  } as React.CSSProperties,
  main: {flex: 1, overflowY: 'auto', padding: 24} as React.CSSProperties,
  section: {marginBottom: 24} as React.CSSProperties,
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    color: '#71717a',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  } as React.CSSProperties,
  sourcePicker: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#1f1f23',
    borderRadius: 10,
    padding: 12,
    border: '1px solid rgba(255,255,255,0.08)',
  } as React.CSSProperties,
  swatch: (bg: string) =>
    ({
      width: 56,
      height: 56,
      borderRadius: 8,
      background: bg,
      border: '2px solid rgba(255,255,255,0.12)',
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
    background: 'none',
  } as React.CSSProperties,
  hexInput: {
    background: 'transparent',
    border: 'none',
    color: '#fafafa',
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
    fontSize: 16,
    fontWeight: 500,
    width: '100%',
    outline: 'none',
    padding: 0,
  } as React.CSSProperties,
  hctLabel: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: "'JetBrains Mono', monospace",
  } as React.CSSProperties,
  shuffleBtn: {
    width: '100%',
    padding: '10px',
    marginTop: 10,
    borderRadius: 8,
    background: '#1f1f23',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#a1a1aa',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  pills: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  } as React.CSSProperties,
  pill: (active: boolean) =>
    ({
      padding: '5px 12px',
      borderRadius: 999,
      background: active ? 'rgba(99,102,241,0.15)' : '#1f1f23',
      border: `1px solid ${active ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
      color: active ? '#a5b4fc' : '#a1a1aa',
      fontSize: 11,
      cursor: 'pointer',
      fontFamily: 'inherit',
    }) as React.CSSProperties,
  dropZone: {
    border: '2px dashed rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '24px 16px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    position: 'relative' as const,
    minHeight: 100,
  } as React.CSSProperties,
  dropInput: {
    position: 'absolute' as const,
    inset: 0,
    opacity: 0,
    cursor: 'pointer',
  } as React.CSSProperties,
  imgThumb: {
    width: '100%',
    height: 80,
    objectFit: 'cover' as const,
    borderRadius: 8,
    marginTop: 10,
  } as React.CSSProperties,
  extractedRow: {
    display: 'flex',
    gap: 4,
    marginTop: 10,
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  extractedDot: (bg: string, sel: boolean) =>
    ({
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: bg,
      border: sel ? '2px solid #fff' : '2px solid transparent',
      cursor: 'pointer',
      boxShadow: sel ? '0 0 0 2px #6366f1' : 'none',
      transition: 'all 0.15s',
    }) as React.CSSProperties,
  tabs: {
    display: 'flex',
    gap: 2,
    background: '#18181b',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
    width: 'fit-content',
  } as React.CSSProperties,
  tab: (active: boolean) =>
    ({
      padding: '8px 18px',
      borderRadius: 8,
      background: active ? '#27272a' : 'transparent',
      border: 'none',
      color: active ? '#fafafa' : '#71717a',
      fontSize: 13,
      fontWeight: active ? 500 : 400,
      cursor: 'pointer',
      fontFamily: 'inherit',
    }) as React.CSSProperties,
  tonaLabel: {
    width: 70,
    fontSize: 11,
    color: '#71717a',
    fontFamily: "'JetBrains Mono', monospace",
    flexShrink: 0,
    textTransform: 'capitalize' as const,
  } as React.CSSProperties,
  tonalStrip: {
    display: 'flex',
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
  } as React.CSSProperties,
  tonalCell: (bg: string) =>
    ({
      flex: 1,
      height: 44,
      background: bg,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: 3,
      transition: 'transform 0.15s',
      position: 'relative' as const,
    }) as React.CSSProperties,
  tonalNum: {
    fontSize: 8,
    fontFamily: "'JetBrains Mono', monospace",
    color: 'rgba(255,255,255,0.5)',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    pointerEvents: 'none' as const,
  } as React.CSSProperties,
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 8,
  } as React.CSSProperties,
  roleCard: {
    background: '#18181b',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as React.CSSProperties,
  roleSwatchWrap: {
    height: 48,
    display: 'flex',
    position: 'relative' as const,
  } as React.CSSProperties,
  roleSwatchHalf: (bg: string) =>
    ({flex: 1, background: bg}) as React.CSSProperties,
  roleBody: {padding: '8px 10px'} as React.CSSProperties,
  roleName: {
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    color: '#a1a1aa',
  } as React.CSSProperties,
  roleValue: {
    fontSize: 10,
    fontFamily: "'JetBrains Mono', monospace",
    color: '#52525b',
  } as React.CSSProperties,
  wcagBadge: (grade: string) =>
    ({
      fontSize: 9,
      fontFamily: "'JetBrains Mono', monospace",
      padding: '1px 5px',
      borderRadius: 3,
      position: 'absolute' as const,
      top: 4,
      right: 4,
      background:
        grade === 'AAA'
          ? '#059669'
          : grade === 'AA'
            ? '#2563eb'
            : grade === 'AA18'
              ? '#d97706'
              : '#dc2626',
      color: '#fff',
    }) as React.CSSProperties,
  catRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  catSwatch: (bg: string) =>
    ({
      width: 48,
      height: 48,
      borderRadius: 10,
      background: bg,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: 4,
      cursor: 'pointer',
      border: '1px solid rgba(255,255,255,0.06)',
    }) as React.CSSProperties,
  catLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.6)',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  } as React.CSSProperties,
  previewFrame: {
    background: '#18181b',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    overflow: 'hidden',
  } as React.CSSProperties,
  previewToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  } as React.CSSProperties,
  previewBody: (bg: string, fg: string) =>
    ({padding: 24, background: bg, color: fg}) as React.CSSProperties,
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  } as React.CSSProperties,
  mockCard: (bg: string, border: string) =>
    ({
      borderRadius: 12,
      padding: 16,
      border: `1px solid ${border}`,
      background: bg,
    }) as React.CSSProperties,
  mockBtn: (bg: string, fg: string) =>
    ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 18px',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      border: 'none',
      background: bg,
      color: fg,
      fontFamily: 'inherit',
      cursor: 'default',
    }) as React.CSSProperties,
  mockBtnOutline: (border: string, fg: string) =>
    ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '7px 17px',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      border: `1px solid ${border}`,
      background: 'transparent',
      color: fg,
      fontFamily: 'inherit',
      cursor: 'default',
    }) as React.CSSProperties,
  mockInput: (bg: string, border: string, fg: string) =>
    ({
      width: '100%',
      padding: '10px 12px',
      borderRadius: 8,
      fontSize: 13,
      fontFamily: 'inherit',
      border: `1px solid ${border}`,
      background: bg,
      color: fg,
      outline: 'none',
      cursor: 'default',
    }) as React.CSSProperties,
  mockChip: (bg: string, fg: string) =>
    ({
      display: 'inline-flex',
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 11,
      background: bg,
      color: fg,
      border: 'none',
    }) as React.CSSProperties,
  mockDot: (bg: string) =>
    ({
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: bg,
      flexShrink: 0,
    }) as React.CSSProperties,
  mockSwitch: (on: boolean, onColor: string, offColor: string) =>
    ({
      width: 36,
      height: 20,
      borderRadius: 10,
      background: on ? onColor : offColor,
      position: 'relative' as const,
      cursor: 'default',
      flexShrink: 0,
    }) as React.CSSProperties,
  mockSwitchDot: (on: boolean) =>
    ({
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute' as const,
      top: 2,
      ...(on ? {right: 2} : {left: 2}),
    }) as React.CSSProperties,
  exportPanel: {
    background: '#18181b',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    overflow: 'hidden',
  } as React.CSSProperties,
  exportBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  } as React.CSSProperties,
  exportTab: (active: boolean) =>
    ({
      padding: '5px 14px',
      borderRadius: 999,
      background: active ? '#6366f1' : 'transparent',
      border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
      color: active ? '#fff' : '#a1a1aa',
      fontSize: 11,
      cursor: 'pointer',
      fontFamily: 'inherit',
    }) as React.CSSProperties,
  exportCopy: {
    marginLeft: 'auto',
    padding: '6px 16px',
    borderRadius: 8,
    background: '#27272a',
    border: 'none',
    color: '#fafafa',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  exportCode: {
    padding: '16px 20px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    lineHeight: '1.7',
    color: '#a1a1aa',
    maxHeight: 400,
    overflow: 'auto',
    whiteSpace: 'pre' as const,
    background: '#0e0e10',
  } as React.CSSProperties,
  contrastGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 8,
  } as React.CSSProperties,
  contrastCard: (pass: boolean) =>
    ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      background: '#18181b',
      border: `1px solid ${pass ? 'rgba(255,255,255,0.06)' : 'rgba(220,38,38,0.3)'}`,
      borderRadius: 8,
    }) as React.CSSProperties,
  contrastSwatch: (fg: string, bg: string) =>
    ({
      width: 36,
      height: 36,
      borderRadius: 6,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 700,
      color: fg,
      flexShrink: 0,
      border: '1px solid rgba(255,255,255,0.06)',
    }) as React.CSSProperties,
  toast: {
    position: 'fixed' as const,
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#27272a',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 24px',
    fontSize: 13,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    zIndex: 100,
    transition: 'opacity 0.2s',
    pointerEvents: 'none' as const,
  } as React.CSSProperties,
} as const;

// =============================================================================
// Page Component
// =============================================================================

type Tab = 'palettes' | 'roles' | 'preview' | 'accessibility' | 'export';
type ExportFmt = 'css' | 'json' | 'tailwind' | 'xds';

export default function ColorStudioPage() {
  const [seedHex, setSeedHex] = useState('#0064E0');
  const [harmony, setHarmony] = useState<HarmonyType>('complementary');
  const [warmth, setWarmth] = useState<'warm' | 'cool' | 'neutral'>('cool');
  const [tab, setTab] = useState<Tab>('palettes');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [exportFmt, setExportFmt] = useState<ExportFmt>('css');
  const [toast, setToast] = useState('');
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const seed = useMemo(() => hexToHct(seedHex), [seedHex]);
  const harmonies = useMemo(
    () => generateHarmony(seed, harmony),
    [seed, harmony],
  );
  const palettes = useMemo(
    () => harmonies.map(h => ({...h, tones: tonalPalette(h.hue, h.chroma)})),
    [harmonies],
  );
  const neutralPalette = useMemo(
    () => ({
      label: 'Neutral',
      tones: tonalPalette(
        seed.hue,
        warmth === 'warm' ? 7 : warmth === 'cool' ? 5 : 3,
      ),
    }),
    [seed.hue, warmth],
  );
  const roles = useMemo(
    () => deriveSemanticRoles(seedHex, warmth),
    [seedHex, warmth],
  );
  const categorical = useMemo(
    () => generateCategorical(seed.hue, seed.chroma),
    [seed],
  );
  const expressive = useMemo(
    () => generateExpressive(seed.hue, seed.chroma),
    [seed],
  );

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast('Copied!');
      setTimeout(() => setToast(''), 1200);
    });
  }, []);

  const setSource = useCallback((hex: string) => {
    setSeedHex(hex);
  }, []);

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.trim();
      const parsed = parseColorInput(v);
      if (parsed) setSeedHex(parsed);
    },
    [],
  );

  const handleShuffle = useCallback(() => {
    const h = Math.random() * 360;
    const c = 30 + Math.random() * 50;
    const hex = hctToHex({hue: h, chroma: c, tone: 50});
    setSeedHex(hex);
  }, []);

  const handleImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      setImgSrc(src);
      const img = new Image();
      img.onload = () => {
        const colors = extractColorsFromImage(img);
        setExtracted(colors);
        if (colors.length) setSeedHex(colors[0]);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  // Role lookup helper for preview
  const r = useCallback(
    (name: string) => {
      const role = roles.find(ro => ro.name === name);
      if (!role) return '#888888';
      return (previewMode === 'light' ? role.light : role.dark) || '#888888';
    },
    [roles, previewMode],
  );

  // Contrast pairs for accessibility tab
  const contrastPairs = useMemo(() => {
    const pairs = [
      ['text-primary', 'surface', 'Text on Surface'],
      ['text-secondary', 'surface', 'Secondary on Surface'],
      ['text-accent', 'surface', 'Accent text on Surface'],
      ['on-accent', 'accent', 'Text on Accent'],
      ['on-error', 'error', 'Text on Error'],
      ['on-success', 'success', 'Text on Success'],
      ['on-warning', 'warning', 'Text on Warning'],
      ['text-primary', 'card', 'Text on Card'],
      ['icon-secondary', 'surface', 'Icon on Surface'],
      ['text-disabled', 'surface', 'Disabled on Surface'],
    ];
    return pairs
      .map(([fg, bg, label]) => {
        const fgRole = roles.find(ro => ro.name === fg);
        const bgRole = roles.find(ro => ro.name === bg);
        if (!fgRole || !bgRole) return null;
        const fgHex =
          (previewMode === 'light' ? fgRole.light : fgRole.dark) || '#000000';
        const bgHex =
          (previewMode === 'light' ? bgRole.light : bgRole.dark) || '#ffffff';
        // Strip alpha for contrast calc
        const fgClean = fgHex.substring(0, 7);
        const bgClean = bgHex.substring(0, 7);
        const ratio = contrastRatio(fgClean, bgClean);
        const grade = wcagGrade(ratio);
        return {label, fg: fgClean, bg: bgClean, ratio, grade};
      })
      .filter(Boolean) as Array<{
      label: string;
      fg: string;
      bg: string;
      ratio: number;
      grade: string;
    }>;
  }, [roles, previewMode]);

  // Export code
  const exportCode = useMemo(() => {
    const m = previewMode;
    if (exportFmt === 'css') {
      let code = '/* Color Studio — Generated Palette */\n\n:root {\n';
      for (const role of roles) {
        code += `  --color-${role.name}: ${role.light};\n`;
      }
      code += '}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n';
      for (const role of roles) {
        code += `    --color-${role.name}: ${role.dark};\n`;
      }
      code += '  }\n}\n\n@media (prefers-contrast: more) {\n  :root {\n';
      for (const role of roles) {
        code += `    --color-${role.name}: ${role.highContrast};\n`;
      }
      code += '  }\n}\n';
      return code;
    }
    if (exportFmt === 'json') {
      const obj: Record<string, Record<string, string>> = {
        light: {},
        dark: {},
        highContrast: {},
      };
      for (const role of roles) {
        obj.light[role.name] = role.light;
        obj.dark[role.name] = role.dark;
        obj.highContrast[role.name] = role.highContrast;
      }
      return JSON.stringify(obj, null, 2);
    }
    if (exportFmt === 'tailwind') {
      let code =
        '// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n';
      for (const role of roles) {
        code += `        '${role.name}': '${role[m]}',\n`;
      }
      code += '      },\n    },\n  },\n};\n';
      return code;
    }
    // XDS defineTheme
    let code = `import { defineTheme } from '@xds/core/theme';\n\nexport const customTheme = defineTheme({\n  name: 'custom',\n  color: {\n    accent: '${seedHex}',\n    neutralStyle: '${warmth}',\n  },\n  tokens: {\n`;
    for (const role of roles) {
      code += `    '--color-${role.name}': 'light-dark(${role.light}, ${role.dark})',\n`;
    }
    code += '  },\n});\n';
    return code;
  }, [roles, exportFmt, seedHex, warmth, previewMode]);

  return (
    <div style={S.page}>
      {/* ═══ Sidebar ═══ */}
      <aside style={S.sidebar}>
        <div style={S.section}>
          <div style={S.sectionTitle}>Source Color</div>
          <div style={S.sourcePicker}>
            <div style={S.swatch(seedHex)}>
              <input
                type="color"
                value={seedHex}
                onChange={e => setSource(e.target.value)}
                style={S.colorInput}
              />
            </div>
            <div style={{flex: 1}}>
              <input
                type="text"
                value={seedHex.toUpperCase()}
                onChange={handleHexInput}
                spellCheck={false}
                style={S.hexInput}
              />
              <div style={S.hctLabel}>
                H:{seed.hue.toFixed(0)}° C:{seed.chroma.toFixed(0)} T:
                {seed.tone.toFixed(0)}
              </div>
            </div>
          </div>
          <button onClick={handleShuffle} style={S.shuffleBtn}>
            ↻ Randomize
          </button>
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Extract from Image</div>
          <div style={S.dropZone} onClick={() => fileRef.current?.click()}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={S.dropInput}
              onChange={e =>
                e.target.files?.[0] && handleImage(e.target.files[0])
              }
            />
            <div style={{fontSize: 20}}>🖼</div>
            <div style={{fontSize: 12, color: '#a1a1aa'}}>
              Drop image or click
            </div>
          </div>
          {imgSrc && <img src={imgSrc} alt="preview" style={S.imgThumb} />}
          {extracted.length > 0 && (
            <div style={S.extractedRow}>
              {extracted.map((c, i) => (
                <div
                  key={i}
                  style={S.extractedDot(c, c === seedHex)}
                  onClick={() => setSource(c)}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Harmony</div>
          <div style={S.pills}>
            {(
              [
                'complementary',
                'analogous',
                'triadic',
                'split-complementary',
                'tetradic',
                'monochromatic',
              ] as HarmonyType[]
            ).map(h => (
              <button
                key={h}
                style={S.pill(harmony === h)}
                onClick={() => setHarmony(h)}>
                {h.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Neutral Warmth</div>
          <div style={S.pills}>
            {(['warm', 'cool', 'neutral'] as const).map(w => (
              <button
                key={w}
                style={S.pill(warmth === w)}
                onClick={() => setWarmth(w)}>
                {w.charAt(0).toUpperCase() + w.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ═══ Main ═══ */}
      <main style={S.main}>
        <div style={S.tabs}>
          {(
            [
              ['palettes', 'Palettes'],
              ['roles', 'Roles'],
              ['preview', 'Preview'],
              ['accessibility', 'Accessibility'],
              ['export', 'Export'],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>
              {label}
            </button>
          ))}
        </div>

        {/* ─── Palettes Tab ─── */}
        {tab === 'palettes' && (
          <div>
            <div style={{...S.section, marginBottom: 32}}>
              <div style={S.sectionTitle}>Tonal Palettes</div>
              {[...palettes, neutralPalette].map((p, pi) => (
                <div
                  key={pi}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}>
                  <span style={S.tonaLabel}>{p.label}</span>
                  <div style={S.tonalStrip}>
                    {TONE_STEPS.map(t => (
                      <div
                        key={t}
                        style={S.tonalCell(p.tones[t])}
                        onClick={() => copy(p.tones[t])}
                        title={`${p.tones[t]} (tone ${t})`}>
                        <span style={S.tonalNum}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>
                Categorical — 10 Distinguishable Colors
              </div>
              <div style={S.catRow}>
                {categorical.map((c, i) => (
                  <div
                    key={i}
                    style={S.catSwatch(c.hex)}
                    onClick={() => copy(c.hex)}
                    title={c.hex}>
                    <span style={S.catLabel}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>
                Expressive — Illustration & Brand
              </div>
              <div style={S.catRow}>
                {expressive.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      ...S.catSwatch(c.hex),
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                    }}
                    onClick={() => copy(c.hex)}
                    title={c.hex}>
                    <span style={S.catLabel}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Roles Tab ─── */}
        {tab === 'roles' && (
          <div>
            {['Interactive', 'Surface', 'Content', 'Feedback', 'Border'].map(
              group => {
                const groupRoles = roles.filter(ro => ro.group === group);
                return (
                  <div key={group} style={S.section}>
                    <div style={S.sectionTitle}>
                      {group}{' '}
                      <span style={{float: 'right', fontWeight: 400}}>
                        {groupRoles.length}
                      </span>
                    </div>
                    <div style={S.roleGrid}>
                      {groupRoles.map(role => {
                        // Compute contrast if paired
                        let grade = '';
                        if (role.pairedWith) {
                          const bg = roles.find(
                            ro => ro.name === role.pairedWith,
                          );
                          if (bg) {
                            const fgHex = (
                              (previewMode === 'light'
                                ? role.light
                                : role.dark) || '#000000'
                            ).substring(0, 7);
                            const bgHex = (
                              (previewMode === 'light' ? bg.light : bg.dark) ||
                              '#ffffff'
                            ).substring(0, 7);
                            const ratio = contrastRatio(fgHex, bgHex);
                            grade = wcagGrade(ratio);
                          }
                        }
                        return (
                          <div
                            key={role.name}
                            style={S.roleCard}
                            onClick={() =>
                              copy(`--color-${role.name}: ${role.light}`)
                            }>
                            <div style={S.roleSwatchWrap}>
                              <div style={S.roleSwatchHalf(role.light)} />
                              <div style={S.roleSwatchHalf(role.dark)} />
                              {grade && (
                                <span style={S.wcagBadge(grade)}>{grade}</span>
                              )}
                            </div>
                            <div style={S.roleBody}>
                              <div style={S.roleName}>{role.name}</div>
                              <div style={S.roleValue}>
                                L: {role.light.substring(0, 7)} D:{' '}
                                {role.dark.substring(0, 7)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}

        {/* ─── Preview Tab ─── */}
        {tab === 'preview' && (
          <div style={S.previewFrame}>
            <div style={S.previewToolbar}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#ff5f57',
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#febc2e',
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#28c840',
                }}
              />
              <div style={{flex: 1}} />
              <button
                style={S.pill(previewMode === 'light')}
                onClick={() => setPreviewMode('light')}>
                Light
              </button>
              <button
                style={S.pill(previewMode === 'dark')}
                onClick={() => setPreviewMode('dark')}>
                Dark
              </button>
            </div>
            <div style={S.previewBody(r('body'), r('text-primary'))}>
              {/* Nav mock */}
              <div
                style={{
                  display: 'flex',
                  gap: 2,
                  padding: 4,
                  borderRadius: 8,
                  background: r('surface'),
                  border: `1px solid ${r('border')}`,
                  marginBottom: 16,
                }}>
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    background: r('accent'),
                    color: r('on-accent'),
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                  Dashboard
                </div>
                <div
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    color: r('text-secondary'),
                  }}>
                  Settings
                </div>
                <div
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    color: r('text-secondary'),
                  }}>
                  Reports
                </div>
              </div>

              <div style={S.previewGrid}>
                {/* Buttons & Inputs */}
                <div style={S.mockCard(r('card'), r('border'))}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: r('text-primary'),
                      marginBottom: 12,
                    }}>
                    Components
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginBottom: 12,
                      flexWrap: 'wrap',
                    }}>
                    <div style={S.mockBtn(r('accent'), r('on-accent'))}>
                      Primary
                    </div>
                    <div
                      style={S.mockBtnOutline(r('accent'), r('text-accent'))}>
                      Outline
                    </div>
                    <div style={S.mockBtn(r('muted'), r('text-primary'))}>
                      Neutral
                    </div>
                  </div>
                  <input
                    readOnly
                    value="Text input"
                    style={S.mockInput(
                      r('surface'),
                      r('border-emphasized'),
                      r('text-primary'),
                    )}
                  />
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      marginTop: 10,
                      flexWrap: 'wrap',
                    }}>
                    <span
                      style={S.mockChip(r('accent-muted'), r('text-accent'))}>
                      Tag One
                    </span>
                    <span style={S.mockChip(r('muted'), r('text-secondary'))}>
                      Tag Two
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div style={S.mockCard(r('card'), r('border'))}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: r('text-primary'),
                      marginBottom: 12,
                    }}>
                    Status
                  </div>
                  {[
                    {
                      dot: r('success'),
                      text: 'Deployed',
                      badge: '3',
                      badgeBg: r('success'),
                      badgeFg: r('on-success'),
                    },
                    {
                      dot: r('warning'),
                      text: 'Building',
                      badge: '',
                      badgeBg: '',
                      badgeFg: '',
                    },
                    {
                      dot: r('error'),
                      text: '2 tests failing',
                      badge: '2',
                      badgeBg: r('error'),
                      badgeFg: r('on-error'),
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 8,
                      }}>
                      <div style={S.mockDot(s.dot)} />
                      <span
                        style={{
                          fontSize: 12,
                          color: r('text-secondary'),
                          flex: 1,
                        }}>
                        {s.text}
                      </span>
                      {s.badge && (
                        <span
                          style={{
                            minWidth: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 600,
                            background: s.badgeBg,
                            color: s.badgeFg,
                            padding: '0 6px',
                          }}>
                          {s.badge}
                        </span>
                      )}
                    </div>
                  ))}
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginTop: 14,
                      alignItems: 'center',
                    }}>
                    <div style={S.mockBtn(r('error'), r('on-error'))}>
                      Delete
                    </div>
                    <div
                      style={S.mockSwitch(
                        true,
                        r('success'),
                        r('border-emphasized'),
                      )}>
                      <div style={S.mockSwitchDot(true)} />
                    </div>
                    <div
                      style={S.mockSwitch(
                        false,
                        r('success'),
                        r('border-emphasized'),
                      )}>
                      <div style={S.mockSwitchDot(false)} />
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div style={S.mockCard(r('card'), r('border'))}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: r('text-primary'),
                      marginBottom: 4,
                    }}>
                    Heading
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: r('text-secondary'),
                      marginBottom: 8,
                    }}>
                    Secondary body text with detail about the feature.
                  </div>
                  <div style={{fontSize: 12, color: r('text-disabled')}}>
                    Disabled or placeholder text
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: r('text-accent'),
                      marginTop: 8,
                      cursor: 'default',
                    }}>
                    Link text →
                  </div>
                </div>

                {/* Spectrum */}
                <div style={S.mockCard(r('card'), r('border'))}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: r('text-primary'),
                      marginBottom: 12,
                    }}>
                    Categorical
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 6,
                    }}>
                    {categorical.slice(0, 10).map((c, i) => (
                      <div
                        key={i}
                        style={{
                          background: c.hex + '33',
                          borderRadius: 8,
                          padding: 6,
                          textAlign: 'center',
                        }}>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: c.hex,
                            margin: '0 auto 2px',
                          }}
                        />
                        <div style={{fontSize: 8, color: r('text-secondary')}}>
                          {c.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Accessibility Tab ─── */}
        {tab === 'accessibility' && (
          <div>
            <div style={{...S.pills, marginBottom: 16}}>
              <button
                style={S.pill(previewMode === 'light')}
                onClick={() => setPreviewMode('light')}>
                Light
              </button>
              <button
                style={S.pill(previewMode === 'dark')}
                onClick={() => setPreviewMode('dark')}>
                Dark
              </button>
            </div>
            <div style={S.contrastGrid}>
              {contrastPairs.map((pair, i) => (
                <div key={i} style={S.contrastCard(pair.grade !== 'FAIL')}>
                  <div style={S.contrastSwatch(pair.fg, pair.bg)}>Aa</div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: 12, fontWeight: 500}}>
                      {pair.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#71717a',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                      {pair.ratio.toFixed(1)}:1
                    </div>
                  </div>
                  <span style={S.wcagBadge(pair.grade) as React.CSSProperties}>
                    {pair.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Export Tab ─── */}
        {tab === 'export' && (
          <div style={S.exportPanel}>
            <div style={S.exportBar}>
              {(
                [
                  ['css', 'CSS Variables'],
                  ['json', 'JSON'],
                  ['tailwind', 'Tailwind'],
                  ['xds', 'XDS Theme'],
                ] as [ExportFmt, string][]
              ).map(([f, label]) => (
                <button
                  key={f}
                  style={S.exportTab(exportFmt === f)}
                  onClick={() => setExportFmt(f)}>
                  {label}
                </button>
              ))}
              <button style={S.exportCopy} onClick={() => copy(exportCode)}>
                📋 Copy
              </button>
            </div>
            <pre style={S.exportCode}>{exportCode}</pre>
          </div>
        )}
      </main>

      {/* Toast */}
      <div style={{...S.toast, opacity: toast ? 1 : 0}}>{toast}</div>
    </div>
  );
}
