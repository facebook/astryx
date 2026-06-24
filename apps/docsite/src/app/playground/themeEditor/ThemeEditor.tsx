// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThemeEditor.tsx
 * @input optional seed theme + the playground's light/dark mode
 * @output the theme editor's left-panel content (tab strip + scrollable body)
 * @position Playground — the Theme tab's editor, rendered in the left panel.
 *
 * A self-contained editor for the GLOBAL theme: it owns the token + scale state,
 * renders the Base Styles / Advanced tab strip and body, and reports the composed
 * theme (tokens only) upward via onThemeChange so the playground can write it into
 * the code's `defineTheme` literal. Per-component-type overrides are NOT edited
 * here — they're applied by targeting a component in the preview (Theme mode),
 * which keeps "global theme" and "component overrides" visibly distinct.
 */

'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {VStack, StackItem} from '@astryxdesign/core/Stack';
import {
  defineTheme,
  expandTypeScale,
  expandRadiusScale,
  expandColorScale,
  colorDefaults,
  spacingDefaults,
  radiusDefaults,
  typographyDefaults,
  textSizeDefaults,
  fontWeightDefaults,
  typeScaleDefaults,
  sizeDefaults,
  shadowDefaults,
  durationDefaults,
  easeDefaults,
} from '@astryxdesign/core/theme';
import type {DefinedTheme} from '@astryxdesign/core/theme';
import {BaseStylesPanel} from './BaseStylesPanel';
import {RawTokensPanel} from './RawTokensPanel';
import {UNIFIED_PRESETS, GOOGLE_FONTS_URL} from './constants';
import {buildSpacingScale} from './helpers';
import {ThemePicker} from '../../../components/ThemePicker';
import type {PlaygroundPreset} from '../previewThemes';

const s = stylex.create({
  root: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    overflow: 'auto',
    padding: 'var(--spacing-4)',
  },
});

const ALL_DEFAULTS: Record<string, string> = {
  ...colorDefaults,
  ...spacingDefaults,
  ...radiusDefaults,
  ...typographyDefaults,
  ...textSizeDefaults,
  ...fontWeightDefaults,
  ...typeScaleDefaults,
  ...sizeDefaults,
  ...shadowDefaults,
  ...durationDefaults,
  ...easeDefaults,
};

interface ThemeEditorProps {
  /** Light/dark mode, owned by the playground so editor + preview stay in sync. */
  mode: 'light' | 'dark';
  /** Optional token overrides to seed the editor from (parsed from the code). */
  initialTheme?: {tokens?: Record<string, string>};
  /** Called whenever the composed theme changes so the parent can apply it. */
  onThemeChange: (theme: DefinedTheme) => void;
  /** Selectable preset themes for the Presets tab. */
  presets: PlaygroundPreset[];
  /** Currently applied preset slug (last one chosen), for the active card. */
  selectedPreset: string;
  /** Apply a preset by slug (parent shows a confirm, then writes the code). */
  onSelectPreset: (value: string) => void;
  /** Active tab — owned by the playground so it persists across remounts. */
  panelTab: 'presets' | 'theme' | 'tokens';
  onPanelTabChange: (tab: 'presets' | 'theme' | 'tokens') => void;
}

export function ThemeEditor({
  mode,
  initialTheme,
  onThemeChange,
  presets,
  selectedPreset,
  onSelectPreset,
  panelTab,
  onPanelTabChange,
}: ThemeEditorProps) {
  const [tokens, setTokens] = useState<Record<string, string>>(() => ({
    ...ALL_DEFAULTS,
    ...initialTheme?.tokens,
  }));
  const presetItems = useMemo(
    () =>
      presets.map(p => ({
        id: p.value,
        label: p.label,
        theme: p.theme,
        packageName: p.packageName,
      })),
    [presets],
  );
  const [typeScaleBase, setTypeScaleBase] = useState(14);
  const [typeScaleRatio, setTypeScaleRatio] = useState(1.2);
  const [radiusBase, setRadiusBase] = useState(4);
  const [spacingBase, setSpacingBase] = useState(4);
  const [sizeBase, setSizeBase] = useState(32);
  const [durationStep, setDurationStep] = useState(1);
  // A unified preset is only "active" once the user explicitly applies one.
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [autoPickColors, setAutoPickColors] = useState(false);

  // The global theme is tokens-only here; component overrides live in the code
  // and are edited by targeting (Theme mode), not in this panel.
  const currentTheme = useMemo(
    () => defineTheme({name: 'custom', tokens}),
    [tokens],
  );

  // Report the composed theme upward so the playground can write it into the
  // code's defineTheme literal whenever tokens change.
  useEffect(() => {
    onThemeChange(currentTheme);
  }, [currentTheme, onThemeChange]);

  const handleTokenChange = useCallback((name: string, value: string) => {
    setTokens(prev => ({...prev, [name]: value}));
  }, []);

  const applyTypeScale = useCallback((base: number, ratio: number) => {
    setActivePreset(null);
    setTypeScaleBase(base);
    setTypeScaleRatio(ratio);
    setTokens(prev => ({...prev, ...expandTypeScale({base, ratio})}));
  }, []);

  const applySpacingScale = useCallback((base: number) => {
    setActivePreset(null);
    setSpacingBase(base);
    setTokens(prev => ({...prev, ...buildSpacingScale(base)}));
  }, []);

  const applySizeScale = useCallback((base: number) => {
    setActivePreset(null);
    setSizeBase(base);
    setTokens(prev => ({
      ...prev,
      '--size-element-sm': `${base - 4}px`,
      '--size-element-md': `${base}px`,
      '--size-element-lg': `${base + 4}px`,
    }));
  }, []);

  const applyRadiusScale = useCallback((base: number) => {
    setActivePreset(null);
    setRadiusBase(base);
    setTokens(prev => ({
      ...prev,
      ...expandRadiusScale({base, multiplier: 1}),
    }));
  }, []);

  const applyDurationScale = useCallback((multiplier: number) => {
    setDurationStep(multiplier);
    const defaults: Record<string, number> = {
      '--duration-fast-min': 130,
      '--duration-fast': 175,
      '--duration-fast-max': 230,
      '--duration-medium-min': 310,
      '--duration-medium': 410,
      '--duration-medium-max': 550,
      '--duration-slow-min': 730,
      '--duration-slow': 975,
      '--duration-slow-max': 1300,
    };
    const patch: Record<string, string> = {};
    for (const [key, base] of Object.entries(defaults)) {
      patch[key] = `${Math.round(base / multiplier)}ms`;
    }
    setTokens(prev => ({...prev, ...patch}));
  }, []);

  const applyUnifiedPreset = useCallback((presetKey: string) => {
    const p = UNIFIED_PRESETS[presetKey as keyof typeof UNIFIED_PRESETS];
    if (!p) {
      return;
    }
    setActivePreset(presetKey);
    setTypeScaleBase(p.typeBase);
    setTypeScaleRatio(p.typeRatio);
    setSpacingBase(p.spacing);
    setRadiusBase(p.radius);
    setSizeBase(p.sizeMd);
    setTokens(prev => ({
      ...prev,
      ...expandTypeScale({base: p.typeBase, ratio: p.typeRatio}),
      ...buildSpacingScale(p.spacing),
      ...expandRadiusScale({base: p.radius, multiplier: 1}),
      '--size-element-sm': `${p.sizeMd - p.spacing}px`,
      '--size-element-md': `${p.sizeMd}px`,
      '--size-element-lg': `${p.sizeMd + p.spacing}px`,
    }));
  }, []);

  const handleExpandColorScale = useCallback((accentHex: string) => {
    const derived = expandColorScale({accent: accentHex});
    let hex = accentHex.replace('#', '');
    // Normalize 3-char short hex (e.g. "f00") to 6-char ("ff0000")
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    // Guard against invalid hex — fall back to black
    if (hex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(hex)) {
      hex = '000000';
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    derived['--shadow-inset-hover'] =
      `inset 0px 0px 0px 2px rgba(${r}, ${g}, ${b}, 0.3)`;
    derived['--shadow-inset-selected'] =
      `inset 0px 0px 0px 2px rgba(${r}, ${g}, ${b}, 0.5)`;
    setTokens(prev => ({...prev, ...derived}));
  }, []);

  return (
    <VStack xstyle={s.root}>
      {/* Self-load theme fonts so the editor's controls render in the loaded
          theme's typeface even when used standalone. */}
      <style>{`@import url("${GOOGLE_FONTS_URL}");`}</style>
      <TabList
        hasDivider
        value={panelTab}
        onChange={v => onPanelTabChange(v as 'presets' | 'theme' | 'tokens')}>
        <Tab value="presets" label="Presets" />
        <Tab value="theme" label="Custom" />
        <Tab value="tokens" label="Advanced" />
      </TabList>

      <StackItem size="fill" xstyle={s.body}>
        {panelTab === 'presets' && (
          <ThemePicker
            items={presetItems}
            selectedId={selectedPreset}
            onSelect={onSelectPreset}
          />
        )}
        {panelTab === 'theme' && (
          <BaseStylesPanel
            tokens={tokens}
            mode={mode}
            typeScaleBase={typeScaleBase}
            typeScaleRatio={typeScaleRatio}
            radiusBase={radiusBase}
            spacingBase={spacingBase}
            sizeBase={sizeBase}
            durationStep={durationStep}
            activePreset={activePreset}
            autoPickColors={autoPickColors}
            onTokenChange={handleTokenChange}
            onApplyTypeScale={applyTypeScale}
            onApplyRadiusScale={applyRadiusScale}
            onApplySpacingScale={applySpacingScale}
            onApplySizeScale={applySizeScale}
            onApplyDurationScale={applyDurationScale}
            onApplyUnifiedPreset={applyUnifiedPreset}
            onSetAutoPickColors={setAutoPickColors}
            onExpandColorScale={handleExpandColorScale}
          />
        )}
        {panelTab === 'tokens' && (
          <RawTokensPanel
            tokens={tokens}
            mode={mode}
            onTokenChange={handleTokenChange}
          />
        )}
      </StackItem>
    </VStack>
  );
}
