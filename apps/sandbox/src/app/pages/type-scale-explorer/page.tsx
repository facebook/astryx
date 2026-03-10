'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core';
import {XDSButton} from '@xds/core/Button';

// =============================================================================
// Type Scale Computation
// =============================================================================

interface TypeScaleConfig {
  base: number;
  ratio: number;
  lineHeightGrid: number;
}

interface TypeStyle {
  name: string;
  role: 'display' | 'heading' | 'body' | 'supporting';
  exponent: number;
  weight: number;
  rawSize: number;
  fontSize: number;
  lineHeight: number;
  lineHeightRatio: number;
  wasNudged: boolean;
}

type TypeRole = 'display' | 'heading' | 'body' | 'supporting';

// Semantic type roles mapped to scale exponents
const TYPE_ROLES: Array<{
  name: string;
  role: TypeRole;
  exponent: number;
  weight: number;
}> = [
  // Display — hero, marketing, splash
  {name: 'display-1', role: 'display', exponent: 7, weight: 700},
  {name: 'display-2', role: 'display', exponent: 6, weight: 700},
  {name: 'display-3', role: 'display', exponent: 5, weight: 600},
  // Headings
  {name: 'h1', role: 'heading', exponent: 4, weight: 600},
  {name: 'h2', role: 'heading', exponent: 3, weight: 600},
  {name: 'h3', role: 'heading', exponent: 2, weight: 600},
  {name: 'h4', role: 'heading', exponent: 1, weight: 600},
  {name: 'h5', role: 'heading', exponent: 0, weight: 600},
  {name: 'h6', role: 'heading', exponent: -1, weight: 600},
  // Body
  {name: 'body-lg', role: 'body', exponent: 1, weight: 400},
  {name: 'body', role: 'body', exponent: 0, weight: 400},
  {name: 'body-sm', role: 'body', exponent: -1, weight: 400},
  {name: 'label', role: 'body', exponent: 0, weight: 500},
  // Supporting
  {name: 'supporting', role: 'supporting', exponent: -1, weight: 400},
  {name: 'caption', role: 'supporting', exponent: -2, weight: 400},
];

function computeLineHeight(
  fontSize: number,
  grid: number,
  role: TypeRole,
): number {
  let targetRatio: number;
  if (role === 'display') {
    targetRatio = fontSize < 48 ? 1.15 : 1.1;
  } else if (role === 'heading') {
    targetRatio = fontSize < 24 ? 1.3 : fontSize < 32 ? 1.25 : 1.2;
  } else {
    targetRatio = fontSize < 16 ? 1.4 : 1.5;
  }

  const ideal = fontSize * targetRatio;
  const snapped = Math.round(ideal / grid) * grid;

  const minimum = Math.ceil((fontSize + 2) / grid) * grid;
  return Math.max(snapped, minimum);
}

function generateTypeStyles(config: TypeScaleConfig): TypeStyle[] {
  const allStyles = TYPE_ROLES.map(role => {
    const rawSize = config.base * Math.pow(config.ratio, role.exponent);
    const fontSize = Math.round(rawSize);
    const lineHeight = computeLineHeight(
      fontSize,
      config.lineHeightGrid,
      role.role,
    );

    return {
      ...role,
      rawSize,
      fontSize,
      lineHeight,
      lineHeightRatio: lineHeight / fontSize,
      wasNudged: false,
    };
  });

  // Enforce 1px minimum step within each group that should be monotonically decreasing
  const enforceMinStep = (group: TypeStyle[]) => {
    for (let i = 1; i < group.length; i++) {
      if (group[i].fontSize >= group[i - 1].fontSize) {
        group[i].fontSize = group[i - 1].fontSize - 1;
        group[i].lineHeight = computeLineHeight(
          group[i].fontSize,
          config.lineHeightGrid,
          group[i].role,
        );
        group[i].lineHeightRatio = group[i].lineHeight / group[i].fontSize;
        group[i].wasNudged = true;
      }
    }
  };

  // Also enforce display > h1 continuity
  const displays = allStyles.filter(s => s.role === 'display');
  const headings = allStyles.filter(s => s.role === 'heading');
  enforceMinStep(displays);
  enforceMinStep(headings);

  // Ensure smallest display > largest heading
  if (displays.length > 0 && headings.length > 0) {
    const smallestDisplay = displays[displays.length - 1];
    if (smallestDisplay.fontSize <= headings[0].fontSize) {
      smallestDisplay.fontSize = headings[0].fontSize + 1;
      smallestDisplay.lineHeight = computeLineHeight(
        smallestDisplay.fontSize,
        config.lineHeightGrid,
        'display',
      );
      smallestDisplay.lineHeightRatio =
        smallestDisplay.lineHeight / smallestDisplay.fontSize;
      smallestDisplay.wasNudged = true;
      // Re-enforce display chain upward
      for (let i = displays.length - 2; i >= 0; i--) {
        if (displays[i].fontSize <= displays[i + 1].fontSize) {
          displays[i].fontSize = displays[i + 1].fontSize + 1;
          displays[i].lineHeight = computeLineHeight(
            displays[i].fontSize,
            config.lineHeightGrid,
            'display',
          );
          displays[i].lineHeightRatio =
            displays[i].lineHeight / displays[i].fontSize;
          displays[i].wasNudged = true;
        }
      }
    }
  }

  return allStyles;
}

// Raw scale steps for the calculations tab
const RAW_SCALE_STEPS = Array.from({length: 12}, (_, i) => i - 3);

interface RawScaleStep {
  exponent: number;
  rawSize: number;
  roundedSize: number;
  formula: string;
}

function generateRawScale(config: TypeScaleConfig): RawScaleStep[] {
  return RAW_SCALE_STEPS.map(exp => {
    const rawSize = config.base * Math.pow(config.ratio, exp);
    return {
      exponent: exp,
      rawSize,
      roundedSize: Math.round(rawSize),
      formula: `${config.base} × ${config.ratio}^${exp}`,
    };
  });
}

// =============================================================================
// Preset Configurations
// =============================================================================

const PRESETS: Record<string, TypeScaleConfig> = {
  functional: {base: 12, ratio: 1.125, lineHeightGrid: 4},
  default: {base: 14, ratio: 1.125, lineHeightGrid: 4},
  editorial: {base: 16, ratio: 1.25, lineHeightGrid: 4},
};

const RATIOS: Record<string, number> = {
  'Minor Second (1.067)': 1.067,
  'Major Second (1.125)': 1.125,
  'Minor Third (1.2)': 1.2,
  'Major Third (1.25)': 1.25,
  'Perfect Fourth (1.333)': 1.333,
  'Augmented Fourth (1.414)': 1.414,
  'Perfect Fifth (1.5)': 1.5,
  'Golden Ratio (1.618)': 1.618,
};

// =============================================================================
// Styles
// =============================================================================

const s = stylex.create({
  container: {
    maxWidth: 1400,
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 32,
  },
  controls: {
    padding: 16,
    backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
    borderRadius: 8,
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: 'light-dark(#666, #aaa)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '8px 12px',
    fontSize: 14,
    borderRadius: 6,
    border: '1px solid light-dark(#ddd, #444)',
    backgroundColor: 'light-dark(#fff, #333)',
    color: 'light-dark(#333, #eee)',
    cursor: 'pointer',
    minWidth: 180,
  },
  slider: {
    width: '100%',
    accentColor: 'light-dark(#0064E0, #2694FE)',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: 500,
    color: 'light-dark(#333, #eee)',
    minWidth: 50,
    textAlign: 'right',
  },
  presetBtn: {
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    border: '1px solid light-dark(#ddd, #444)',
    backgroundColor: 'light-dark(#fff, #333)',
    color: 'light-dark(#333, #eee)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  presetBtnActive: {
    backgroundColor: 'light-dark(#0064E0, #2694FE)',
    borderColor: 'light-dark(#0064E0, #2694FE)',
    color: '#fff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid light-dark(#ddd, #444)',
    fontWeight: 600,
    color: 'light-dark(#333, #eee)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  thRight: {
    textAlign: 'right',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid light-dark(#eee, #333)',
    color: 'light-dark(#333, #eee)',
  },
  tdRight: {
    textAlign: 'right',
  },
  tdMono: {
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    fontSize: 12,
  },
  roleDisplay: {
    backgroundColor: 'light-dark(#fef3f0, #2a1f1a)',
  },
  roleHeading: {
    backgroundColor: 'light-dark(#f0f7ff, #1a2a3a)',
  },
  roleBody: {
    backgroundColor: 'light-dark(#fff, #1f1f22)',
  },
  roleSupporting: {
    backgroundColor: 'light-dark(#f9f9f9, #252528)',
  },
  preview: {
    padding: 24,
    backgroundColor: 'light-dark(#fff, #1a1a1a)',
    borderRadius: 8,
    border: '1px solid light-dark(#ddd, #333)',
  },
  sampleText: {
    margin: 0,
    color: 'light-dark(#333, #eee)',
  },
  nudgedBadge: {
    display: 'inline-block',
    padding: '1px 5px',
    fontSize: 9,
    fontWeight: 600,
    borderRadius: 3,
    backgroundColor: 'light-dark(#fff3cd, #4a3f00)',
    color: 'light-dark(#856404, #ffc107)',
    marginLeft: 6,
  },
  // Raw calc tab
  rawFormula: {
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    fontSize: 12,
    padding: '16px 20px',
    backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
    borderRadius: 8,
    color: 'light-dark(#333, #eee)',
    lineHeight: 1.8,
  },
  rawBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'light-dark(#0064E0, #2694FE)',
    transition: 'width 0.2s ease',
  },
  rawBarContainer: {
    width: 120,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'light-dark(#eee, #333)',
    overflow: 'hidden',
  },
  rawHighlight: {
    backgroundColor: 'light-dark(#e8f0fe, #1a2a3a)',
    fontWeight: 600,
  },
  // Landing page
  landingPreview: {
    backgroundColor: 'light-dark(#fff, #111)',
    borderRadius: 8,
    border: '1px solid light-dark(#ddd, #333)',
    overflow: 'hidden',
    minHeight: 600,
  },
  landingNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid light-dark(#eee, #333)',
  },
  landingLogo: {
    fontWeight: 700,
    color: 'light-dark(#333, #eee)',
  },
  landingNavLinks: {
    display: 'flex',
    gap: 24,
  },
  landingNavLink: {
    color: 'light-dark(#666, #aaa)',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  landingHero: {
    padding: '80px 24px',
    textAlign: 'center',
    maxWidth: 720,
    margin: '0 auto',
  },
  landingHeroTitle: {
    margin: '0 0 16px 0',
    color: 'light-dark(#111, #fff)',
  },
  landingHeroSubtitle: {
    margin: '0 0 32px 0',
    color: 'light-dark(#666, #aaa)',
  },
  landingHeroButtons: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
  landingFeatures: {
    padding: '48px 24px',
    backgroundColor: 'light-dark(#f9f9f9, #1a1a1a)',
  },
  landingFeaturesTitle: {
    textAlign: 'center',
    margin: '0 0 8px 0',
    color: 'light-dark(#111, #fff)',
  },
  landingFeaturesSubtitle: {
    textAlign: 'center',
    margin: '0 0 32px 0',
    color: 'light-dark(#666, #aaa)',
  },
  landingFeatureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
    maxWidth: 900,
    margin: '0 auto',
  },
  landingFeatureCard: {
    padding: 20,
    backgroundColor: 'light-dark(#fff, #252528)',
    borderRadius: 8,
    border: '1px solid light-dark(#eee, #333)',
  },
  landingFeatureTitle: {
    margin: '0 0 8px 0',
    color: 'light-dark(#111, #fff)',
  },
  landingFeatureDesc: {
    margin: 0,
    color: 'light-dark(#666, #aaa)',
  },
  // Tabs
  tabBar: {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid light-dark(#ddd, #444)',
    marginBottom: 16,
  },
  tab: {
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: 'light-dark(#666, #aaa)',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    marginBottom: -1,
  },
  tabActive: {
    color: 'light-dark(#0064E0, #2694FE)',
    borderBottomColor: 'light-dark(#0064E0, #2694FE)',
  },
  roleSectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'light-dark(#999, #666)',
    padding: '8px 12px 4px',
  },
});

// =============================================================================
// Helper to get role row style
// =============================================================================

function roleStyle(role: TypeRole) {
  switch (role) {
    case 'display':
      return s.roleDisplay;
    case 'heading':
      return s.roleHeading;
    case 'body':
      return s.roleBody;
    case 'supporting':
      return s.roleSupporting;
  }
}

// =============================================================================
// Component
// =============================================================================

type PreviewTab = 'scale' | 'calculations' | 'landing' | 'comparison';

export default function TypeScaleExplorerPage() {
  const [config, setConfig] = useState<TypeScaleConfig>(PRESETS.default);
  const [activeTab, setActiveTab] = useState<PreviewTab>('scale');

  const typeStyles = useMemo(() => generateTypeStyles(config), [config]);
  const rawScale = useMemo(() => generateRawScale(config), [config]);

  const displays = typeStyles.filter(t => t.role === 'display');
  const headings = typeStyles.filter(t => t.role === 'heading');
  const bodyStyles = typeStyles.filter(t => t.role === 'body');
  const supportingStyles = typeStyles.filter(t => t.role === 'supporting');

  const activePreset = Object.entries(PRESETS).find(
    ([, preset]) =>
      preset.base === config.base &&
      Math.abs(preset.ratio - config.ratio) < 0.001 &&
      preset.lineHeightGrid === config.lineHeightGrid,
  )?.[0];

  const getStyle = (name: string) =>
    typeStyles.find(t => t.name === name) || typeStyles[0];

  const maxRawSize = Math.max(...rawScale.map(r => r.roundedSize));

  return (
    <div {...stylex.props(s.container)}>
      <XDSVStack gap={6}>
        {/* Header */}
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Type Scale Explorer</XDSHeading>
          <XDSText type="body" color="secondary">
            Experiment with ratio-based type scales. Combines font size, line
            height, and weight into semantic type styles.
          </XDSText>
        </XDSVStack>

        {/* Controls */}
        <div {...stylex.props(s.controls)}>
          <XDSVStack gap={4}>
            <div {...stylex.props(s.controlGroup)}>
              <span {...stylex.props(s.label)}>Presets</span>
              <XDSHStack gap={2}>
                {Object.entries(PRESETS).map(([name, preset]) => (
                  <button
                    key={name}
                    {...stylex.props(
                      s.presetBtn,
                      activePreset === name && s.presetBtnActive,
                    )}
                    onClick={() => setConfig(preset)}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </button>
                ))}
              </XDSHStack>
            </div>

            <XDSHStack gap={6}>
              <div {...stylex.props(s.controlGroup)}>
                <span {...stylex.props(s.label)}>Base Size</span>
                <XDSHStack gap={3} vAlign="center">
                  <input
                    type="range"
                    min={10}
                    max={24}
                    step={1}
                    value={config.base}
                    onChange={e =>
                      setConfig(c => ({...c, base: Number(e.target.value)}))
                    }
                    {...stylex.props(s.slider)}
                  />
                  <span {...stylex.props(s.sliderValue)}>{config.base}px</span>
                </XDSHStack>
              </div>

              <div {...stylex.props(s.controlGroup)}>
                <span {...stylex.props(s.label)}>Scale Ratio</span>
                <select
                  value={
                    Object.entries(RATIOS).find(
                      ([, v]) => Math.abs(v - config.ratio) < 0.001,
                    )?.[0] || ''
                  }
                  onChange={e =>
                    setConfig(c => ({...c, ratio: RATIOS[e.target.value]}))
                  }
                  {...stylex.props(s.select)}>
                  {Object.entries(RATIOS).map(([name]) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div {...stylex.props(s.controlGroup)}>
                <span {...stylex.props(s.label)}>Line Height Grid</span>
                <select
                  value={config.lineHeightGrid}
                  onChange={e =>
                    setConfig(c => ({
                      ...c,
                      lineHeightGrid: Number(e.target.value),
                    }))
                  }
                  {...stylex.props(s.select)}>
                  <option value={2}>2px</option>
                  <option value={4}>4px (default)</option>
                  <option value={8}>8px</option>
                </select>
              </div>
            </XDSHStack>
          </XDSVStack>
        </div>

        {/* Tab Bar */}
        <div {...stylex.props(s.tabBar)}>
          {(
            [
              ['scale', 'Type Scale'],
              ['calculations', 'Raw Calculations'],
              ['landing', 'Landing Page'],
              ['comparison', 'Preset Comparison'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              {...stylex.props(s.tab, activeTab === key && s.tabActive)}
              onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* ================================================================= */}
        {/* TYPE SCALE TAB                                                     */}
        {/* ================================================================= */}
        {activeTab === 'scale' && (
          <div {...stylex.props(s.twoColumn)}>
            {/* Tables */}
            <XDSVStack gap={4}>
              <table {...stylex.props(s.table)}>
                <thead>
                  <tr>
                    <th {...stylex.props(s.th)}>Style</th>
                    <th {...stylex.props(s.th)}>Size</th>
                    <th {...stylex.props(s.th)}>Line H</th>
                    <th {...stylex.props(s.th)}>Weight</th>
                    <th {...stylex.props(s.th)}>Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Display */}
                  <tr>
                    <td colSpan={5} {...stylex.props(s.roleSectionLabel)}>
                      Display
                    </td>
                  </tr>
                  {displays.map(t => (
                    <TypeRow key={t.name} style={t} />
                  ))}

                  {/* Headings */}
                  <tr>
                    <td colSpan={5} {...stylex.props(s.roleSectionLabel)}>
                      Headings
                    </td>
                  </tr>
                  {headings.map(t => (
                    <TypeRow key={t.name} style={t} />
                  ))}

                  {/* Body */}
                  <tr>
                    <td colSpan={5} {...stylex.props(s.roleSectionLabel)}>
                      Body
                    </td>
                  </tr>
                  {bodyStyles.map(t => (
                    <TypeRow key={t.name} style={t} />
                  ))}

                  {/* Supporting */}
                  <tr>
                    <td colSpan={5} {...stylex.props(s.roleSectionLabel)}>
                      Supporting
                    </td>
                  </tr>
                  {supportingStyles.map(t => (
                    <TypeRow key={t.name} style={t} />
                  ))}
                </tbody>
              </table>
            </XDSVStack>

            {/* Live Preview */}
            <XDSVStack gap={4}>
              <XDSHeading level={3}>Live Preview</XDSHeading>
              <div {...stylex.props(s.preview)}>
                <XDSVStack gap={3}>
                  {displays.map(t => (
                    <p
                      key={t.name}
                      style={{
                        fontSize: t.fontSize,
                        lineHeight: `${t.lineHeight}px`,
                        fontWeight: t.weight,
                        margin: 0,
                      }}
                      {...stylex.props(s.sampleText)}>
                      {t.name}
                    </p>
                  ))}
                  <XDSDivider />
                  {headings.map(t => (
                    <p
                      key={t.name}
                      style={{
                        fontSize: t.fontSize,
                        lineHeight: `${t.lineHeight}px`,
                        fontWeight: t.weight,
                        margin: 0,
                      }}
                      {...stylex.props(s.sampleText)}>
                      {t.name}: A wizard&apos;s job is to vex chumps
                    </p>
                  ))}
                  <XDSDivider />
                  {[...bodyStyles, ...supportingStyles].map(t => (
                    <p
                      key={t.name}
                      style={{
                        fontSize: t.fontSize,
                        lineHeight: `${t.lineHeight}px`,
                        fontWeight: t.weight,
                        margin: 0,
                      }}
                      {...stylex.props(s.sampleText)}>
                      {t.name}: The quick brown fox jumps over the lazy dog.
                      Pack my box with five dozen liquor jugs.
                    </p>
                  ))}
                </XDSVStack>
              </div>
            </XDSVStack>
          </div>
        )}

        {/* ================================================================= */}
        {/* RAW CALCULATIONS TAB                                               */}
        {/* ================================================================= */}
        {activeTab === 'calculations' && (
          <XDSVStack gap={6}>
            {/* Formula */}
            <div {...stylex.props(s.rawFormula)}>
              <strong>Formula:</strong> fontSize = base × ratio
              <sup>exponent</sup>
              <br />
              base = {config.base}px &nbsp;|&nbsp; ratio = {config.ratio}
              &nbsp;|&nbsp; grid = {config.lineHeightGrid}px
            </div>

            <div {...stylex.props(s.twoColumn)}>
              {/* Raw scale */}
              <XDSVStack gap={3}>
                <XDSHeading level={3}>Raw Scale</XDSHeading>
                <XDSText type="supporting" color="secondary">
                  Pure mathematical output before any role mapping or collision
                  handling.
                </XDSText>
                <table {...stylex.props(s.table)}>
                  <thead>
                    <tr>
                      <th {...stylex.props(s.th)}>Exp</th>
                      <th {...stylex.props(s.th)}>Formula</th>
                      <th {...stylex.props(s.th, s.thRight)}>Raw</th>
                      <th {...stylex.props(s.th, s.thRight)}>Rounded</th>
                      <th {...stylex.props(s.th)}>Scale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawScale.map(step => {
                      const isBase = step.exponent === 0;
                      return (
                        <tr
                          key={step.exponent}
                          {...stylex.props(isBase && s.rawHighlight)}>
                          <td {...stylex.props(s.td, s.tdMono)}>
                            {step.exponent >= 0 ? '+' : ''}
                            {step.exponent}
                          </td>
                          <td {...stylex.props(s.td, s.tdMono)}>
                            {step.formula}
                          </td>
                          <td {...stylex.props(s.td, s.tdMono, s.tdRight)}>
                            {step.rawSize.toFixed(2)}px
                          </td>
                          <td {...stylex.props(s.td, s.tdMono, s.tdRight)}>
                            {step.roundedSize}px
                            {isBase && ' ●'}
                          </td>
                          <td {...stylex.props(s.td)}>
                            <div {...stylex.props(s.rawBarContainer)}>
                              <div
                                {...stylex.props(s.rawBar)}
                                style={{
                                  width: `${(step.roundedSize / maxRawSize) * 100}%`,
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </XDSVStack>

              {/* Role mapping */}
              <XDSVStack gap={3}>
                <XDSHeading level={3}>Role Mapping</XDSHeading>
                <XDSText type="supporting" color="secondary">
                  How raw scale steps map to semantic roles, with collision
                  handling applied.
                </XDSText>
                <table {...stylex.props(s.table)}>
                  <thead>
                    <tr>
                      <th {...stylex.props(s.th)}>Role</th>
                      <th {...stylex.props(s.th)}>Exp</th>
                      <th {...stylex.props(s.th, s.thRight)}>Raw</th>
                      <th {...stylex.props(s.th, s.thRight)}>Final</th>
                      <th {...stylex.props(s.th, s.thRight)}>LH</th>
                      <th {...stylex.props(s.th)}>Wt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeStyles.map(t => (
                      <tr key={t.name} {...stylex.props(roleStyle(t.role))}>
                        <td {...stylex.props(s.td)}>
                          {t.name}
                          {t.wasNudged && (
                            <span {...stylex.props(s.nudgedBadge)}>nudged</span>
                          )}
                        </td>
                        <td {...stylex.props(s.td, s.tdMono)}>
                          {t.exponent >= 0 ? '+' : ''}
                          {t.exponent}
                        </td>
                        <td {...stylex.props(s.td, s.tdMono, s.tdRight)}>
                          {t.rawSize.toFixed(1)}
                        </td>
                        <td {...stylex.props(s.td, s.tdMono, s.tdRight)}>
                          {t.fontSize}px
                        </td>
                        <td {...stylex.props(s.td, s.tdMono, s.tdRight)}>
                          {t.lineHeight}px
                        </td>
                        <td {...stylex.props(s.td, s.tdMono)}>{t.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </XDSVStack>
            </div>

            {/* Line height explanation */}
            <div {...stylex.props(s.rawFormula)}>
              <strong>Line Height Algorithm:</strong>
              <br />
              {'Display: target ≈ 1.1–1.15× → snap to '}
              {config.lineHeightGrid}px grid
              <br />
              {'Heading: target ≈ 1.2–1.3× → snap to '}
              {config.lineHeightGrid}px grid
              <br />
              {'Body/Supporting: target ≈ 1.4–1.5× → snap to '}
              {config.lineHeightGrid}px grid
              <br />
              Minimum: ceil((fontSize + 2) / {config.lineHeightGrid}) ×{' '}
              {config.lineHeightGrid}
            </div>
          </XDSVStack>
        )}

        {/* ================================================================= */}
        {/* LANDING PAGE TAB                                                   */}
        {/* ================================================================= */}
        {activeTab === 'landing' && (
          <div {...stylex.props(s.landingPreview)}>
            {/* Nav */}
            <nav {...stylex.props(s.landingNav)}>
              <span
                style={{
                  fontSize: getStyle('body').fontSize,
                  fontWeight: 700,
                }}
                {...stylex.props(s.landingLogo)}>
                Acme Inc
              </span>
              <div {...stylex.props(s.landingNavLinks)}>
                {['Features', 'Pricing', 'About', 'Contact'].map(link => (
                  <span
                    key={link}
                    style={{
                      fontSize: getStyle('body-sm').fontSize,
                      fontWeight: getStyle('body-sm').weight,
                    }}
                    {...stylex.props(s.landingNavLink)}>
                    {link}
                  </span>
                ))}
              </div>
            </nav>

            {/* Hero */}
            <div {...stylex.props(s.landingHero)}>
              <p
                style={{
                  fontSize: getStyle('supporting').fontSize,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  margin: '0 0 12px 0',
                  color: 'light-dark(#0064E0, #2694FE)',
                }}>
                Introducing Acme Platform
              </p>
              <h1
                style={{
                  fontSize: getStyle('display-2').fontSize,
                  lineHeight: `${getStyle('display-2').lineHeight}px`,
                  fontWeight: getStyle('display-2').weight,
                }}
                {...stylex.props(s.landingHeroTitle)}>
                Your digital transformation begins here
              </h1>
              <p
                style={{
                  fontSize: getStyle('body-lg').fontSize,
                  lineHeight: `${getStyle('body-lg').lineHeight}px`,
                  fontWeight: getStyle('body-lg').weight,
                }}
                {...stylex.props(s.landingHeroSubtitle)}>
                Unlock the full potential of your business. Start your journey
                today and experience the future of enterprise software.
              </p>
              <div {...stylex.props(s.landingHeroButtons)}>
                <XDSButton label="Explore features" variant="secondary" />
                <XDSButton label="Get started" variant="primary" />
              </div>
              <p
                style={{
                  fontSize: getStyle('caption').fontSize,
                  lineHeight: `${getStyle('caption').lineHeight}px`,
                  fontWeight: getStyle('caption').weight,
                  marginTop: 16,
                  color: 'light-dark(#999, #666)',
                }}>
                No credit card required · Free 14-day trial
              </p>
            </div>

            {/* Features */}
            <div {...stylex.props(s.landingFeatures)}>
              <p
                style={{
                  fontSize: getStyle('label').fontSize,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  margin: '0 0 8px 0',
                  color: 'light-dark(#0064E0, #2694FE)',
                }}>
                Features
              </p>
              <h2
                style={{
                  fontSize: getStyle('h2').fontSize,
                  lineHeight: `${getStyle('h2').lineHeight}px`,
                  fontWeight: getStyle('h2').weight,
                }}
                {...stylex.props(s.landingFeaturesTitle)}>
                SaaS solutions that drive results
              </h2>
              <p
                style={{
                  fontSize: getStyle('body').fontSize,
                  lineHeight: `${getStyle('body').lineHeight}px`,
                  fontWeight: getStyle('body').weight,
                }}
                {...stylex.props(s.landingFeaturesSubtitle)}>
                Explore our suite of powerful software solutions designed to
                streamline your operations.
              </p>

              <div {...stylex.props(s.landingFeatureGrid)}>
                {[
                  {
                    title: 'Enterprise Planning',
                    desc: 'Seamlessly manage and integrate all core business processes with our unified platform.',
                  },
                  {
                    title: 'Project Management',
                    desc: 'Ensure project success by efficiently planning, tracking, and delivering on time.',
                  },
                  {
                    title: 'Analytics Dashboard',
                    desc: 'Leverage data-driven insights to make informed decisions and measure impact.',
                  },
                ].map(feature => (
                  <div
                    key={feature.title}
                    {...stylex.props(s.landingFeatureCard)}>
                    <h3
                      style={{
                        fontSize: getStyle('h4').fontSize,
                        lineHeight: `${getStyle('h4').lineHeight}px`,
                        fontWeight: getStyle('h4').weight,
                      }}
                      {...stylex.props(s.landingFeatureTitle)}>
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        fontSize: getStyle('body-sm').fontSize,
                        lineHeight: `${getStyle('body-sm').lineHeight}px`,
                        fontWeight: getStyle('body-sm').weight,
                      }}
                      {...stylex.props(s.landingFeatureDesc)}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PRESET COMPARISON TAB                                              */}
        {/* ================================================================= */}
        {activeTab === 'comparison' && (
          <XDSVStack gap={4}>
            <XDSText type="supporting" color="secondary">
              See how the same semantic styles render across different theme
              presets.
            </XDSText>

            <XDSHStack gap={4}>
              {Object.entries(PRESETS).map(([name, preset]) => {
                const presetStyles = generateTypeStyles(preset);
                const pDisplays = presetStyles.filter(
                  t => t.role === 'display',
                );
                const pHeadings = presetStyles.filter(
                  t => t.role === 'heading',
                );
                const pBody = presetStyles.filter(t => t.name === 'body');
                return (
                  <div key={name} style={{flex: 1}}>
                    <XDSVStack gap={2}>
                      <XDSText type="label">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {preset.base}px base, {preset.ratio} ratio
                      </XDSText>
                      <div {...stylex.props(s.preview)}>
                        <XDSVStack gap={2}>
                          {pDisplays.slice(1, 3).map(t => (
                            <p
                              key={t.name}
                              style={{
                                fontSize: t.fontSize,
                                lineHeight: `${t.lineHeight}px`,
                                fontWeight: t.weight,
                                margin: 0,
                              }}
                              {...stylex.props(s.sampleText)}>
                              {t.name}: {t.fontSize}px
                            </p>
                          ))}
                          {pHeadings.slice(0, 4).map(t => (
                            <p
                              key={t.name}
                              style={{
                                fontSize: t.fontSize,
                                lineHeight: `${t.lineHeight}px`,
                                fontWeight: t.weight,
                                margin: 0,
                              }}
                              {...stylex.props(s.sampleText)}>
                              {t.name}: {t.fontSize}px
                            </p>
                          ))}
                          {pBody.map(t => (
                            <p
                              key={t.name}
                              style={{
                                fontSize: t.fontSize,
                                lineHeight: `${t.lineHeight}px`,
                                fontWeight: t.weight,
                                margin: 0,
                                marginTop: 8,
                              }}
                              {...stylex.props(s.sampleText)}>
                              Body text at {t.fontSize}px
                            </p>
                          ))}
                        </XDSVStack>
                      </div>
                    </XDSVStack>
                  </div>
                );
              })}
            </XDSHStack>
          </XDSVStack>
        )}
      </XDSVStack>
    </div>
  );
}

// =============================================================================
// TypeRow Component
// =============================================================================

function TypeRow({style: t}: {style: TypeStyle}) {
  return (
    <tr {...stylex.props(roleStyle(t.role))}>
      <td {...stylex.props(s.td)}>
        {t.name}
        {t.wasNudged && <span {...stylex.props(s.nudgedBadge)}>nudged</span>}
      </td>
      <td {...stylex.props(s.td, s.tdMono)}>{t.fontSize}px</td>
      <td {...stylex.props(s.td, s.tdMono)}>{t.lineHeight}px</td>
      <td {...stylex.props(s.td, s.tdMono)}>{t.weight}</td>
      <td {...stylex.props(s.td)}>
        <span
          style={{
            fontSize: t.fontSize,
            lineHeight: `${t.lineHeight}px`,
            fontWeight: t.weight,
          }}>
          {t.role === 'display'
            ? 'Aa'
            : t.role === 'heading'
              ? 'Aa'
              : 'The quick brown fox'}
        </span>
      </td>
    </tr>
  );
}
