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
  role: 'heading' | 'body' | 'supporting';
  exponent: number;
  weight: number;
  rawSize: number;
  fontSize: number;
  lineHeight: number;
  lineHeightRatio: number;
}

// Semantic type roles mapped to scale exponents
const TYPE_ROLES: Array<{
  name: string;
  role: 'heading' | 'body' | 'supporting';
  exponent: number;
  weight: number;
}> = [
  {name: 'h1', role: 'heading', exponent: 4, weight: 600},
  {name: 'h2', role: 'heading', exponent: 3, weight: 600},
  {name: 'h3', role: 'heading', exponent: 2, weight: 600},
  {name: 'h4', role: 'heading', exponent: 1, weight: 600},
  {name: 'h5', role: 'heading', exponent: 0, weight: 600},
  {name: 'h6', role: 'heading', exponent: -1, weight: 600},
  {name: 'body-lg', role: 'body', exponent: 1, weight: 400},
  {name: 'body', role: 'body', exponent: 0, weight: 400},
  {name: 'body-sm', role: 'body', exponent: -1, weight: 400},
  {name: 'label', role: 'body', exponent: 0, weight: 500},
  {name: 'supporting', role: 'supporting', exponent: -1, weight: 400},
  {name: 'caption', role: 'supporting', exponent: -2, weight: 400},
];

function computeLineHeight(
  fontSize: number,
  grid: number,
  role: 'heading' | 'body' | 'supporting',
): number {
  // Tighter line heights for headings, more relaxed for body
  let targetRatio: number;
  if (role === 'heading') {
    targetRatio = fontSize < 24 ? 1.3 : fontSize < 32 ? 1.25 : 1.2;
  } else {
    targetRatio = fontSize < 16 ? 1.4 : 1.5;
  }

  const ideal = fontSize * targetRatio;
  const snapped = Math.round(ideal / grid) * grid;

  // Ensure minimum breathing room
  const minimum = Math.ceil((fontSize + 2) / grid) * grid;
  return Math.max(snapped, minimum);
}

function generateTypeStyles(config: TypeScaleConfig): TypeStyle[] {
  const styles = TYPE_ROLES.map(role => {
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
    };
  });

  // Enforce 1px minimum step between heading sizes
  const headings = styles.filter(s => s.role === 'heading');
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].fontSize >= headings[i - 1].fontSize) {
      headings[i].fontSize = headings[i - 1].fontSize - 1;
      headings[i].lineHeight = computeLineHeight(
        headings[i].fontSize,
        config.lineHeightGrid,
        'heading',
      );
      headings[i].lineHeightRatio =
        headings[i].lineHeight / headings[i].fontSize;
    }
  }

  return styles;
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

const styles = stylex.create({
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
  presetButton: {
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
  presetButtonActive: {
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
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid light-dark(#eee, #333)',
    color: 'light-dark(#333, #eee)',
  },
  tdMono: {
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    fontSize: 12,
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
  formula: {
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    fontSize: 12,
    padding: '12px 16px',
    backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
    borderRadius: 6,
    color: 'light-dark(#333, #eee)',
  },
  // Landing page preview styles
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
    padding: '64px 24px',
    textAlign: 'center',
    maxWidth: 600,
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
});

// =============================================================================
// Component
// =============================================================================

type PreviewTab = 'scale' | 'landing' | 'comparison';

export default function TypeScaleExplorerPage() {
  const [config, setConfig] = useState<TypeScaleConfig>(PRESETS.default);
  const [activeTab, setActiveTab] = useState<PreviewTab>('scale');

  const typeStyles = useMemo(() => generateTypeStyles(config), [config]);

  const headings = typeStyles.filter(s => s.role === 'heading');
  const bodyStyles = typeStyles.filter(
    s => s.role === 'body' || s.role === 'supporting',
  );

  const activePreset = Object.entries(PRESETS).find(
    ([, preset]) =>
      preset.base === config.base &&
      Math.abs(preset.ratio - config.ratio) < 0.001 &&
      preset.lineHeightGrid === config.lineHeightGrid,
  )?.[0];

  const getStyle = (name: string) =>
    typeStyles.find(s => s.name === name) || typeStyles[0];

  return (
    <div {...stylex.props(styles.container)}>
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
        <div {...stylex.props(styles.controls)}>
          <XDSVStack gap={4}>
            {/* Presets */}
            <div {...stylex.props(styles.controlGroup)}>
              <span {...stylex.props(styles.label)}>Presets</span>
              <XDSHStack gap={2}>
                {Object.entries(PRESETS).map(([name, preset]) => (
                  <button
                    key={name}
                    {...stylex.props(
                      styles.presetButton,
                      activePreset === name && styles.presetButtonActive,
                    )}
                    onClick={() => setConfig(preset)}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </button>
                ))}
              </XDSHStack>
            </div>

            <XDSHStack gap={6}>
              {/* Base Size */}
              <div {...stylex.props(styles.controlGroup)}>
                <span {...stylex.props(styles.label)}>Base Size</span>
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
                    {...stylex.props(styles.slider)}
                  />
                  <span {...stylex.props(styles.sliderValue)}>
                    {config.base}px
                  </span>
                </XDSHStack>
              </div>

              {/* Ratio */}
              <div {...stylex.props(styles.controlGroup)}>
                <span {...stylex.props(styles.label)}>Scale Ratio</span>
                <select
                  value={
                    Object.entries(RATIOS).find(
                      ([, v]) => Math.abs(v - config.ratio) < 0.001,
                    )?.[0] || ''
                  }
                  onChange={e =>
                    setConfig(c => ({...c, ratio: RATIOS[e.target.value]}))
                  }
                  {...stylex.props(styles.select)}>
                  {Object.entries(RATIOS).map(([name]) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid */}
              <div {...stylex.props(styles.controlGroup)}>
                <span {...stylex.props(styles.label)}>Line Height Grid</span>
                <select
                  value={config.lineHeightGrid}
                  onChange={e =>
                    setConfig(c => ({
                      ...c,
                      lineHeightGrid: Number(e.target.value),
                    }))
                  }
                  {...stylex.props(styles.select)}>
                  <option value={2}>2px</option>
                  <option value={4}>4px (default)</option>
                  <option value={8}>8px</option>
                </select>
              </div>
            </XDSHStack>
          </XDSVStack>
        </div>

        {/* Tab Bar */}
        <div {...stylex.props(styles.tabBar)}>
          <button
            {...stylex.props(
              styles.tab,
              activeTab === 'scale' && styles.tabActive,
            )}
            onClick={() => setActiveTab('scale')}>
            Type Scale
          </button>
          <button
            {...stylex.props(
              styles.tab,
              activeTab === 'landing' && styles.tabActive,
            )}
            onClick={() => setActiveTab('landing')}>
            Landing Page
          </button>
          <button
            {...stylex.props(
              styles.tab,
              activeTab === 'comparison' && styles.tabActive,
            )}
            onClick={() => setActiveTab('comparison')}>
            Preset Comparison
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'scale' && (
          <div {...stylex.props(styles.twoColumn)}>
            {/* Scale Table */}
            <XDSVStack gap={4}>
              <XDSHeading level={3}>Headings</XDSHeading>
              <table {...stylex.props(styles.table)}>
                <thead>
                  <tr>
                    <th {...stylex.props(styles.th)}>Style</th>
                    <th {...stylex.props(styles.th)}>Size</th>
                    <th {...stylex.props(styles.th)}>Line H</th>
                    <th {...stylex.props(styles.th)}>Weight</th>
                    <th {...stylex.props(styles.th)}>Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {headings.map(style => (
                    <tr key={style.name} {...stylex.props(styles.roleHeading)}>
                      <td {...stylex.props(styles.td)}>{style.name}</td>
                      <td {...stylex.props(styles.td, styles.tdMono)}>
                        {style.fontSize}px
                      </td>
                      <td {...stylex.props(styles.td, styles.tdMono)}>
                        {style.lineHeight}px
                      </td>
                      <td {...stylex.props(styles.td, styles.tdMono)}>
                        {style.weight}
                      </td>
                      <td {...stylex.props(styles.td)}>
                        <span
                          style={{
                            fontSize: style.fontSize,
                            lineHeight: `${style.lineHeight}px`,
                            fontWeight: style.weight,
                          }}>
                          Aa
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <XDSHeading level={3}>Body &amp; Supporting</XDSHeading>
              <table {...stylex.props(styles.table)}>
                <thead>
                  <tr>
                    <th {...stylex.props(styles.th)}>Style</th>
                    <th {...stylex.props(styles.th)}>Size</th>
                    <th {...stylex.props(styles.th)}>Line H</th>
                    <th {...stylex.props(styles.th)}>Weight</th>
                    <th {...stylex.props(styles.th)}>Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {bodyStyles.map(style => (
                    <tr
                      key={style.name}
                      {...stylex.props(
                        style.role === 'body'
                          ? styles.roleBody
                          : styles.roleSupporting,
                      )}>
                      <td {...stylex.props(styles.td)}>{style.name}</td>
                      <td {...stylex.props(styles.td, styles.tdMono)}>
                        {style.fontSize}px
                      </td>
                      <td {...stylex.props(styles.td, styles.tdMono)}>
                        {style.lineHeight}px
                      </td>
                      <td {...stylex.props(styles.td, styles.tdMono)}>
                        {style.weight}
                      </td>
                      <td {...stylex.props(styles.td)}>
                        <span
                          style={{
                            fontSize: style.fontSize,
                            lineHeight: `${style.lineHeight}px`,
                            fontWeight: style.weight,
                          }}>
                          The quick brown fox
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </XDSVStack>

            {/* Live Preview */}
            <XDSVStack gap={4}>
              <XDSHeading level={3}>Live Preview</XDSHeading>
              <div {...stylex.props(styles.preview)}>
                <XDSVStack gap={4}>
                  {headings.map(style => (
                    <p
                      key={style.name}
                      style={{
                        fontSize: style.fontSize,
                        lineHeight: `${style.lineHeight}px`,
                        fontWeight: style.weight,
                        margin: 0,
                      }}
                      {...stylex.props(styles.sampleText)}>
                      {style.name}: A wizard&apos;s job is to vex chumps quickly
                      in fog
                    </p>
                  ))}
                  <XDSDivider />
                  {bodyStyles.slice(0, 3).map(style => (
                    <p
                      key={style.name}
                      style={{
                        fontSize: style.fontSize,
                        lineHeight: `${style.lineHeight}px`,
                        fontWeight: style.weight,
                        margin: 0,
                      }}
                      {...stylex.props(styles.sampleText)}>
                      {style.name}: The quick brown fox jumps over the lazy dog.
                      Pack my box with five dozen liquor jugs.
                    </p>
                  ))}
                </XDSVStack>
              </div>
            </XDSVStack>
          </div>
        )}

        {activeTab === 'landing' && (
          <div {...stylex.props(styles.landingPreview)}>
            {/* Nav */}
            <nav {...stylex.props(styles.landingNav)}>
              <span
                style={{
                  fontSize: getStyle('body').fontSize,
                  fontWeight: 700,
                }}
                {...stylex.props(styles.landingLogo)}>
                Acme Inc
              </span>
              <div {...stylex.props(styles.landingNavLinks)}>
                {['Features', 'Pricing', 'About', 'Contact'].map(link => (
                  <span
                    key={link}
                    style={{
                      fontSize: getStyle('body-sm').fontSize,
                      fontWeight: getStyle('body-sm').weight,
                    }}
                    {...stylex.props(styles.landingNavLink)}>
                    {link}
                  </span>
                ))}
              </div>
            </nav>

            {/* Hero */}
            <div {...stylex.props(styles.landingHero)}>
              <h1
                style={{
                  fontSize: getStyle('h1').fontSize,
                  lineHeight: `${getStyle('h1').lineHeight}px`,
                  fontWeight: getStyle('h1').weight,
                }}
                {...stylex.props(styles.landingHeroTitle)}>
                Your digital transformation begins here
              </h1>
              <p
                style={{
                  fontSize: getStyle('body-lg').fontSize,
                  lineHeight: `${getStyle('body-lg').lineHeight}px`,
                  fontWeight: getStyle('body-lg').weight,
                }}
                {...stylex.props(styles.landingHeroSubtitle)}>
                Unlock the full potential of your business. Start your journey
                today and experience the future of business software.
              </p>
              <div {...stylex.props(styles.landingHeroButtons)}>
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
                No credit card required
              </p>
            </div>

            {/* Features */}
            <div {...stylex.props(styles.landingFeatures)}>
              <h2
                style={{
                  fontSize: getStyle('h2').fontSize,
                  lineHeight: `${getStyle('h2').lineHeight}px`,
                  fontWeight: getStyle('h2').weight,
                }}
                {...stylex.props(styles.landingFeaturesTitle)}>
                SaaS solutions that drive results
              </h2>
              <p
                style={{
                  fontSize: getStyle('body').fontSize,
                  lineHeight: `${getStyle('body').lineHeight}px`,
                  fontWeight: getStyle('body').weight,
                }}
                {...stylex.props(styles.landingFeaturesSubtitle)}>
                Explore our suite of powerful software solutions.
              </p>

              <div {...stylex.props(styles.landingFeatureGrid)}>
                {[
                  {
                    title: 'Enterprise planning',
                    desc: 'Seamlessly manage and integrate all core business processes.',
                  },
                  {
                    title: 'Project management',
                    desc: 'Ensure project success by efficiently planning and tracking.',
                  },
                  {
                    title: 'Analytics dashboard',
                    desc: 'Leverage data-driven insights to make informed decisions.',
                  },
                ].map(feature => (
                  <div
                    key={feature.title}
                    {...stylex.props(styles.landingFeatureCard)}>
                    <h3
                      style={{
                        fontSize: getStyle('h4').fontSize,
                        lineHeight: `${getStyle('h4').lineHeight}px`,
                        fontWeight: getStyle('h4').weight,
                      }}
                      {...stylex.props(styles.landingFeatureTitle)}>
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        fontSize: getStyle('body-sm').fontSize,
                        lineHeight: `${getStyle('body-sm').lineHeight}px`,
                        fontWeight: getStyle('body-sm').weight,
                      }}
                      {...stylex.props(styles.landingFeatureDesc)}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <XDSVStack gap={4}>
            <XDSText type="supporting" color="secondary">
              See how the same semantic styles render across different theme
              presets.
            </XDSText>

            <XDSHStack gap={4}>
              {Object.entries(PRESETS).map(([name, preset]) => {
                const presetStyles = generateTypeStyles(preset);
                const presetHeadings = presetStyles.filter(
                  s => s.role === 'heading',
                );
                return (
                  <div key={name} style={{flex: 1}}>
                    <XDSVStack gap={2}>
                      <XDSText type="label">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {preset.base}px base, {preset.ratio} ratio
                      </XDSText>
                      <div {...stylex.props(styles.preview)}>
                        <XDSVStack gap={2}>
                          {presetHeadings.slice(0, 4).map(style => (
                            <p
                              key={style.name}
                              style={{
                                fontSize: style.fontSize,
                                lineHeight: `${style.lineHeight}px`,
                                fontWeight: style.weight,
                                margin: 0,
                              }}
                              {...stylex.props(styles.sampleText)}>
                              {style.name}: {style.fontSize}px
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
