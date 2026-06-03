// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as React from 'react';
import {useRouter} from 'next/navigation';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSHStack, XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {
  ArrowLeftFilled16Icon as ArrowLeftIcon,
  LargeHalfCircle8RaysLargeOutline16Icon,
  CrescentOutline16Icon,
} from './icons';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {useXDSResizable} from '@xds/core/Resizable';
import {XDSResizeHandle} from '@xds/core/Resizable';
import {
  XDSTheme,
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
import {ThemeShowcasePreview} from '../ThemeShowcasePreview';
import {ThemeCardShowcase} from '../ThemeCardShowcase';
import {getThemeImages} from '../themeImages';
import {TokenScalePreview} from './TokenScalePreview';
import {
  UNIFIED_PRESETS,
  GOOGLE_FONTS_URL,
  COMPONENT_VAR_NAMES,
} from './constants';
import {
  generateThemeCode,
  buildComponentOverrides,
  mergeComponentStyleMaps,
} from './helpers';
import {getThemeList} from './themeList';
import type {ThemeListEntry} from './themeList';

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

interface ThemeEditorViewProps {
  themeId: string;
  themeLabel: string;
  initialTheme: XDSDefinedTheme;
}

export function ThemeEditorView({
  themeId,
  themeLabel,
  initialTheme,
}: ThemeEditorViewProps) {
  const router = useRouter();
  const themeList = React.useMemo(() => getThemeList(), []);
  const [tokens, setTokens] = React.useState<Record<string, string>>(() => ({
    ...ALL_DEFAULTS,
    ...initialTheme.tokens,
  }));
  // Component-level overrides from the seeded preset (e.g. button/badge/banner
  // variant styling). Kept separate from token state so they form the base
  // layer the editor's token + custom overrides compose on top of.
  const [baseComponents, setBaseComponents] = React.useState<
    Record<string, unknown>
  >(() => initialTheme.components ?? {});
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const [panelTab, setPanelTab] = React.useState<
    'theme' | 'components' | 'tokens'
  >('theme');
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [activePreview, setActivePreview] = React.useState<
    'preview' | 'tokens'
  >('preview');
  const [typeScaleBase, setTypeScaleBase] = React.useState(14);
  const [typeScaleRatio, setTypeScaleRatio] = React.useState(1.2);
  const [radiusBase, setRadiusBase] = React.useState(4);
  const [spacingBase, setSpacingBase] = React.useState(4);
  const [sizeBase, setSizeBase] = React.useState(32);
  const [durationStep, setDurationStep] = React.useState(1);
  // A unified preset (Compact/Default/Comfortable/Gigantic) is only "active"
  // when the user explicitly applies one. A theme selection does not map to a
  // preset, so this stays null until applyUnifiedPreset runs.
  const [activePreset, setActivePreset] = React.useState<string | null>(null);
  const [autoPickColors, setAutoPickColors] = React.useState(false);
  const [customOverrides, setCustomOverrides] = React.useState<
    CustomOverride[]
  >([]);
  // The preset the editor is currently based on. Switching themes reseeds the
  // token state from this preset; edits that deviate flip the selector to
  // "Custom" (see isCustom below).
  const [selectedThemeId, setSelectedThemeId] = React.useState(themeId);
  const editor = useXDSResizable({
    defaultSize: 400,
    minSizePx: 320,
    maxSizePx: 600,
    autoSaveId: 'theme-editor-panel',
  });

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
    // Layer order: preset component overrides (base) → token-derived overrides
    // → freeform custom overrides. Later layers win at the leaf level.
    const components = mergeComponentStyleMaps(
      baseComponents,
      buildComponentOverrides(componentTokens),
      customMap,
    ) as XDSDefinedTheme['components'];
    return defineTheme({name: 'custom', tokens: coreTokens, components});
  }, [tokens, customOverrides, baseComponents]);

  // Product imagery for the live preview. Tracks the selected base theme
  // (falls back to neutral) so the showcase photos match the theme the
  // user started from, even after they tweak tokens into "Custom".
  const previewImages = React.useMemo(
    () => getThemeImages(selectedThemeId),
    [selectedThemeId],
  );

  const handleTokenChange = React.useCallback((name: string, value: string) => {
    setTokens(prev => ({...prev, [name]: value}));
  }, []);

  // Baseline token set for the currently-selected preset.
  const selectedThemeBaseline = React.useMemo(() => {
    const entry = themeList.find(t => t.name === selectedThemeId);
    return {...ALL_DEFAULTS, ...(entry?.theme.tokens ?? {})};
  }, [themeList, selectedThemeId]);

  const selectedThemeLabel = React.useMemo(() => {
    const entry = themeList.find(t => t.name === selectedThemeId);
    return entry?.label ?? themeLabel;
  }, [themeList, selectedThemeId, themeLabel]);

  // The editor is "custom" once any token deviates from the selected preset's
  // baseline, or once a component-level override is added.
  const isCustom = React.useMemo(() => {
    if (customOverrides.length > 0) {
      return true;
    }
    for (const key of Object.keys(selectedThemeBaseline)) {
      if (tokens[key] !== selectedThemeBaseline[key]) {
        return true;
      }
    }
    return false;
  }, [tokens, selectedThemeBaseline, customOverrides]);

  // Reseed the entire editor from a theme preset (in place — no navigation).
  const selectTheme = React.useCallback((entry: ThemeListEntry) => {
    setTokens({...ALL_DEFAULTS, ...entry.theme.tokens});
    setBaseComponents(entry.theme.components ?? {});
    setSelectedThemeId(entry.name);
    setTypeScaleBase(14);
    setTypeScaleRatio(1.2);
    setRadiusBase(4);
    setSpacingBase(4);
    setSizeBase(32);
    setDurationStep(1);
    setActivePreset(null);
    setAutoPickColors(false);
    setCustomOverrides([]);
  }, []);

  const handleReset = React.useCallback(() => {
    setTokens({...ALL_DEFAULTS, ...selectedThemeBaseline});
    const entry = themeList.find(t => t.name === selectedThemeId);
    setBaseComponents(entry?.theme.components ?? {});
    setTypeScaleBase(14);
    setTypeScaleRatio(1.2);
    setRadiusBase(4);
    setSpacingBase(4);
    setSizeBase(32);
    setDurationStep(1);
    setActivePreset(null);
    setAutoPickColors(false);
    setCustomOverrides([]);
  }, [selectedThemeBaseline, themeList, selectedThemeId]);

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

  const themeCode = React.useMemo(
    () =>
      generateThemeCode(
        themeId,
        tokens,
        ALL_DEFAULTS,
        typeScaleBase,
        typeScaleRatio,
        customOverrides,
        baseComponents,
      ),
    [
      themeId,
      tokens,
      typeScaleBase,
      typeScaleRatio,
      customOverrides,
      baseComponents,
    ],
  );

  // Runnable usage snippet shown alongside the exported theme. Mirrors the
  // theme package README's "wrap your app with XDSTheme" guidance, adapted
  // for a locally-authored theme file.
  const usageSnippet = React.useMemo(
    () =>
      [
        "import {XDSTheme} from '@xds/core/theme';",
        `import {${themeId}Theme} from './${themeId}-theme';`,
        '',
        'export function App() {',
        `  return <XDSTheme theme={${themeId}Theme}>{/* your app */}</XDSTheme>;`,
        '}',
      ].join('\n'),
    [themeId],
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-background-surface)',
      }}>
      <style>{`@import url("${GOOGLE_FONTS_URL}");`}</style>

      {/* Left Panel — Editor */}
      <div
        style={{
          width: editor.size || 400,
          minWidth: 348,
          maxWidth: 600,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column' as const,
          overflow: 'hidden',
        }}>
        {/* Panel Header: back button + tabs */}
        <div style={{flexShrink: 0}}>
          <XDSHStack gap={2} vAlign="center" style={{padding: '8px 12px 0'}}>
            <XDSButton
              label="Back"
              tooltip="Back to all themes"
              variant="ghost"
              size="md"
              isIconOnly
              icon={<ArrowLeftIcon />}
              onClick={() => router.push('/themes')}
            />
            <XDSTabList
              value={panelTab}
              onChange={v =>
                setPanelTab(v as 'theme' | 'components' | 'tokens')
              }
              style={{flex: 1}}>
              <XDSTab value="theme" label="Theme" style={{flex: 1}} />
              <XDSTab value="components" label="Components" style={{flex: 1}} />
              <XDSTab value="tokens" label="Tokens" style={{flex: 1}} />
            </XDSTabList>
          </XDSHStack>
        </div>

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

      {/* Resize Handle */}
      <XDSResizeHandle resizable={editor.props} pillPlacement="center" />

      {/* Right Panel — Preview */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column' as const,
          minWidth: 0,
          overflow: 'hidden',
        }}>
        {/* Preview toolbar */}
        <div
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
          {/* Left: theme selector + dark mode toggle */}
          <XDSHStack
            gap={2}
            vAlign="center"
            style={{flex: 1, justifyContent: 'flex-start'}}>
            <XDSDropdownMenu
              hasAutoFocus={false}
              button={{
                label: isCustom ? 'Custom' : selectedThemeLabel,
                variant: 'ghost',
                size: 'md',
              }}
              items={themeList.map(entry => ({
                label: entry.label,
                onClick: () => selectTheme(entry),
              }))}
            />
            <XDSButton
              label={
                mode === 'light'
                  ? 'Switch to dark mode'
                  : 'Switch to light mode'
              }
              tooltip={mode === 'light' ? 'Dark mode' : 'Light mode'}
              variant="ghost"
              size="md"
              icon={
                mode === 'light' ? (
                  <LargeHalfCircle8RaysLargeOutline16Icon />
                ) : (
                  <CrescentOutline16Icon />
                )
              }
              isIconOnly
              onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
            />
          </XDSHStack>
          {/* Center: component / token preview selector */}
          <XDSHStack gap={2} vAlign="center" style={{justifyContent: 'center'}}>
            <XDSDropdownMenu
              hasAutoFocus={false}
              button={{
                label:
                  activePreview === 'tokens' ? 'Token Preview' : 'App Preview',
                variant: 'ghost',
                size: 'md',
              }}
              items={[
                {
                  label: 'Token Preview',
                  onClick: () => setActivePreview('tokens'),
                },
                {
                  label: 'App Preview',
                  onClick: () => setActivePreview('preview'),
                },
              ]}
            />
          </XDSHStack>
          {/* Right: reset + export */}
          <XDSHStack
            gap={2}
            vAlign="center"
            style={{flex: 1, justifyContent: 'flex-end'}}>
            <XDSButton
              label="Reset"
              variant="ghost"
              size="md"
              onClick={handleReset}
            />
            <XDSButton
              label="Export Theme"
              variant="secondary"
              size="md"
              onClick={() => setShowExportDialog(true)}
            />
          </XDSHStack>
        </div>

        {/* Preview content wrapped in theme */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column' as const,
            backgroundColor: 'var(--color-background-surface)',
            paddingBlockStart: 0,
            paddingBlockEnd: 'var(--spacing-4)',
            paddingInline: 'var(--spacing-4)',
          }}>
          <XDSCard
            padding={0}
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              scrollbarWidth: 'thin',
              colorScheme: mode,
            }}>
            <XDSTheme theme={currentTheme} mode={mode}>
              {activePreview === 'tokens' ? (
                <div
                  style={{
                    padding: 24,
                    minHeight: '100%',
                    backgroundColor: 'var(--color-background-body)',
                  }}>
                  <TokenScalePreview tokens={tokens} />
                </div>
              ) : (
                <div
                  style={{
                    minHeight: '100%',
                    backgroundColor: 'var(--color-background-body)',
                  }}>
                  {/* Landing surface — top nav + hero + product grid,
                      rendered flush so the nav reads as real product
                      chrome (same component used on /themes/<name>). */}
                  <ThemeShowcasePreview images={previewImages} fluid />
                  {/* Real-world card showcase — Checkout + Chat +
                      Inventory + Revenue. Sits on the lifted surface
                      tone below the landing, mirroring the theme
                      detail page composition. */}
                  <div
                    style={{
                      padding: 'var(--spacing-6)',
                      backgroundColor: 'var(--color-background-surface)',
                    }}>
                    <ThemeCardShowcase
                      theme={currentTheme}
                      images={previewImages}
                      mode={mode}
                    />
                  </div>
                </div>
              )}
            </XDSTheme>
          </XDSCard>
        </div>
      </div>

      {/* Export Theme Dialog */}
      <XDSDialog
        isOpen={showExportDialog}
        onOpenChange={setShowExportDialog}
        width={720}>
        <XDSDialogHeader title="Exporting a theme" />
        <div
          style={{
            padding: 'var(--spacing-4)',
            overflow: 'auto',
            maxHeight: '70vh',
          }}>
          <XDSVStack gap={5}>
            <XDSText type="body" color="secondary">
              Your theme is a plain object — no build step or package install
              required. Save the code below to a file, then wrap your app with{' '}
              <code>XDSTheme</code> to apply it.
            </XDSText>

            <XDSVStack gap={2}>
              <XDSText type="label">
                1. Save as a theme file (e.g. {themeId}-theme.ts)
              </XDSText>
              <XDSCodeBlock code={themeCode} language="typescript" size="sm" />
            </XDSVStack>

            <XDSVStack gap={2}>
              <XDSText type="label">2. Wrap your app with the theme</XDSText>
              <XDSCodeBlock code={usageSnippet} language="tsx" size="sm" />
              <XDSText type="supporting" color="secondary">
                Token and component overrides apply at runtime through{' '}
                <code>XDSTheme</code>. To consume the theme as a stylesheet
                instead, build a CSS file with{' '}
                <code>xds theme build {themeId}-theme.ts -o theme.css</code> and{' '}
                <code>@import</code> it.
              </XDSText>
            </XDSVStack>
          </XDSVStack>
        </div>
      </XDSDialog>
    </div>
  );
}
