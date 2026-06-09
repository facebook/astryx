// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PlaygroundThemeEditor.tsx
 * @input optional seed theme + the playground's light/dark mode
 * @output the theme editor's left-panel content (tab strip + scrollable body)
 * @position Playground — embeds the themePlayground editor as a left-panel view.
 *
 * A self-contained version of the editor portion of ThemeEditorView: it owns the
 * token + scale state, renders the Theme/Components/Tokens tab strip and body, and
 * reports the composed theme upward via onThemeChange so the playground can push it
 * to the live preview iframe.
 */

'use client';

import * as React from 'react';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
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
} from '@xds/core/theme';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {EditorSections} from './EditorSections';
import {ComponentTokensPanel} from './ComponentTokensPanel';
import type {CustomOverride} from './ComponentTokensPanel';
import {RawTokensPanel} from './RawTokensPanel';
import {
  UNIFIED_PRESETS,
  COMPONENT_VAR_NAMES,
  GOOGLE_FONTS_URL,
} from './constants';
import {buildComponentOverrides, mergeComponentStyleMaps} from './helpers';

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

interface PlaygroundThemeEditorProps {
  /** Light/dark mode, owned by the playground so editor + preview stay in sync. */
  mode: 'light' | 'dark';
  /** Optional theme to seed the editor's token + component state from. */
  initialTheme?: XDSDefinedTheme;
  /** Called whenever the composed theme changes so the parent can apply it. */
  onThemeChange: (theme: XDSDefinedTheme) => void;
}

export function PlaygroundThemeEditor({
  mode,
  initialTheme,
  onThemeChange,
}: PlaygroundThemeEditorProps) {
  const [tokens, setTokens] = React.useState<Record<string, string>>(() => ({
    ...ALL_DEFAULTS,
    ...initialTheme?.tokens,
  }));
  // Component-level overrides from the seeded theme. Kept separate from token
  // state so they form the base layer that token + custom overrides compose on.
  const [baseComponents] = React.useState<Record<string, unknown>>(
    () => initialTheme?.components ?? {},
  );
  const [panelTab, setPanelTab] = React.useState<
    'theme' | 'components' | 'tokens'
  >('theme');
  const [typeScaleBase, setTypeScaleBase] = React.useState(14);
  const [typeScaleRatio, setTypeScaleRatio] = React.useState(1.2);
  const [radiusBase, setRadiusBase] = React.useState(4);
  const [spacingBase, setSpacingBase] = React.useState(4);
  const [sizeBase, setSizeBase] = React.useState(32);
  const [durationStep, setDurationStep] = React.useState(1);
  // A unified preset is only "active" once the user explicitly applies one.
  const [activePreset, setActivePreset] = React.useState<string | null>(null);
  const [autoPickColors, setAutoPickColors] = React.useState(false);
  const [customOverrides, setCustomOverrides] = React.useState<
    CustomOverride[]
  >([]);

  const currentTheme = React.useMemo(() => {
    const coreTokens: Record<string, string> = {};
    const componentTokens: Record<string, string> = {};
    for (const [key, value] of Object.entries(tokens)) {
      if (COMPONENT_VAR_NAMES.has(key)) {
        componentTokens[key] = value;
      } else {
        coreTokens[key] = value;
      }
    }
    const customMap: Record<string, {base: Record<string, string>}> = {};
    for (const override of customOverrides) {
      customMap[override.component] ??= {base: {}};
      customMap[override.component].base[override.property] = override.value;
    }
    // Layer order: seeded component overrides (base) → token-derived overrides
    // → freeform custom overrides. Later layers win at the leaf level.
    const components = mergeComponentStyleMaps(
      baseComponents,
      buildComponentOverrides(componentTokens),
      customMap,
    ) as XDSDefinedTheme['components'];
    return defineTheme({name: 'custom', tokens: coreTokens, components});
  }, [tokens, customOverrides, baseComponents]);

  // Report the composed theme upward so the playground can push it to the
  // preview iframe whenever tokens or overrides change.
  React.useEffect(() => {
    onThemeChange(currentTheme);
  }, [currentTheme, onThemeChange]);

  const handleTokenChange = React.useCallback((name: string, value: string) => {
    setTokens(prev => ({...prev, [name]: value}));
  }, []);

  const applyTypeScale = React.useCallback((base: number, ratio: number) => {
    setActivePreset(null);
    setTypeScaleBase(base);
    setTypeScaleRatio(ratio);
    setTokens(prev => ({...prev, ...expandTypeScale({base, ratio})}));
  }, []);

  const applySpacingScale = React.useCallback((base: number) => {
    setActivePreset(null);
    setSpacingBase(base);
    const steps = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const keys = [
      '0',
      '0-5',
      '1',
      '1-5',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ];
    const patch: Record<string, string> = {};
    steps.forEach((step, i) => {
      patch[`--spacing-${keys[i]}`] = `${Math.round(base * step)}px`;
    });
    setTokens(prev => ({...prev, ...patch}));
  }, []);

  const applySizeScale = React.useCallback((base: number) => {
    setActivePreset(null);
    setSizeBase(base);
    setTokens(prev => ({
      ...prev,
      '--size-element-sm': `${base - 4}px`,
      '--size-element-md': `${base}px`,
      '--size-element-lg': `${base + 4}px`,
    }));
  }, []);

  const applyRadiusScale = React.useCallback((base: number) => {
    setActivePreset(null);
    setRadiusBase(base);
    setTokens(prev => ({
      ...prev,
      ...expandRadiusScale({base, multiplier: 1}),
    }));
  }, []);

  const applyDurationScale = React.useCallback((multiplier: number) => {
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

  const applyUnifiedPreset = React.useCallback((presetKey: string) => {
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
    setTokens(prev => {
      const spacingSteps = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const spacingKeys = [
        '0',
        '0-5',
        '1',
        '1-5',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
      ];
      const spacingPatch: Record<string, string> = {};
      spacingSteps.forEach((step, i) => {
        spacingPatch[`--spacing-${spacingKeys[i]}`] =
          `${Math.round(p.spacing * step)}px`;
      });
      return {
        ...prev,
        ...expandTypeScale({base: p.typeBase, ratio: p.typeRatio}),
        ...spacingPatch,
        ...expandRadiusScale({base: p.radius, multiplier: 1}),
        '--size-element-sm': `${p.sizeMd - p.spacing}px`,
        '--size-element-md': `${p.sizeMd}px`,
        '--size-element-lg': `${p.sizeMd + p.spacing}px`,
      };
    });
  }, []);

  const handleExpandColorScale = React.useCallback((accentHex: string) => {
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
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* Self-load theme fonts (mirrors ThemeEditorView) so the editor's
          controls render in the loaded theme's typeface even when used
          standalone. */}
      <style>{`@import url("${GOOGLE_FONTS_URL}");`}</style>
      {/* Tab strip */}
      <XDSTabList
        hasDivider
        value={panelTab}
        onChange={v => setPanelTab(v as 'theme' | 'components' | 'tokens')}>
        <XDSTab value="theme" label="Base Styles" />
        <XDSTab value="components" label="Components" />
        <XDSTab value="tokens" label="Advanced" />
      </XDSTabList>

      {/* Scrollable editor content */}
      <div style={{flex: 1, overflow: 'auto', padding: 16}}>
        {panelTab === 'theme' && (
          <EditorSections
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
            onSetTokens={setTokens}
          />
        )}
        {panelTab === 'components' && (
          <ComponentTokensPanel
            tokens={tokens}
            onTokenChange={handleTokenChange}
            customOverrides={customOverrides}
            onCustomOverridesChange={setCustomOverrides}
            baseComponents={baseComponents}
          />
        )}
        {panelTab === 'tokens' && (
          <RawTokensPanel
            tokens={tokens}
            mode={mode}
            onTokenChange={handleTokenChange}
          />
        )}
      </div>
    </div>
  );
}
