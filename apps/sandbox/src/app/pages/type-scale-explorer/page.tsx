'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core';

// =============================================================================
// Type Scale Computation
// =============================================================================

interface TypeScaleConfig {
  base: number;
  ratio: number;
  lineHeightGrid: number;
}

interface TypeScaleStep {
  name: string;
  exponent: number;
  rawSize: number;
  fontSize: number;
  lineHeight: number;
  lineHeightRatio: number;
}

const SCALE_STEPS = [
  {name: 'xs', exponent: -2},
  {name: 'sm', exponent: -1},
  {name: 'md', exponent: 0},
  {name: 'lg', exponent: 1},
  {name: 'xl', exponent: 2},
  {name: '2xl', exponent: 3},
  {name: '3xl', exponent: 4},
];

function computeLineHeight(fontSize: number, grid: number): number {
  // Target ratio varies by size (tighter for large text)
  const targetRatio = fontSize < 20 ? 1.5 : fontSize < 32 ? 1.4 : 1.25;
  const ideal = fontSize * targetRatio;
  const snapped = Math.round(ideal / grid) * grid;

  // Ensure minimum breathing room
  const minimum = Math.ceil((fontSize + 4) / grid) * grid;
  return Math.max(snapped, minimum);
}

function generateTypeScale(config: TypeScaleConfig): TypeScaleStep[] {
  return SCALE_STEPS.map(step => {
    const rawSize = config.base * Math.pow(config.ratio, step.exponent);
    const fontSize = Math.round(rawSize);
    const lineHeight = computeLineHeight(fontSize, config.lineHeightGrid);

    return {
      ...step,
      rawSize,
      fontSize,
      lineHeight,
      lineHeightRatio: lineHeight / fontSize,
    };
  });
}

// =============================================================================
// Preset Configurations
// =============================================================================

const PRESETS: Record<string, TypeScaleConfig> = {
  dense: {base: 12, ratio: 1.125, lineHeightGrid: 4},
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
    maxWidth: 1200,
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
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid light-dark(#ddd, #444)',
    fontWeight: 600,
    color: 'light-dark(#333, #eee)',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid light-dark(#eee, #333)',
    color: 'light-dark(#333, #eee)',
  },
  tdMono: {
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    fontSize: 13,
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
  badge: {
    display: 'inline-block',
    padding: '2px 6px',
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 4,
    backgroundColor: 'light-dark(#e0e0e0, #444)',
    color: 'light-dark(#666, #aaa)',
    marginLeft: 8,
  },
  collisionWarning: {
    backgroundColor: 'light-dark(#fff3cd, #4a3f00)',
    color: 'light-dark(#856404, #ffc107)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  formula: {
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    fontSize: 13,
    padding: '12px 16px',
    backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
    borderRadius: 6,
    color: 'light-dark(#333, #eee)',
  },
});

// =============================================================================
// Component
// =============================================================================

export default function TypeScaleExplorerPage() {
  const [config, setConfig] = useState<TypeScaleConfig>(PRESETS.default);

  const scale = useMemo(() => generateTypeScale(config), [config]);

  // Detect collisions (adjacent sizes that round to same value)
  const collisions = useMemo(() => {
    const seen = new Set<number>();
    const collided = new Set<number>();
    for (const step of scale) {
      if (seen.has(step.fontSize)) {
        collided.add(step.fontSize);
      }
      seen.add(step.fontSize);
    }
    return collided;
  }, [scale]);

  const activePreset = Object.entries(PRESETS).find(
    ([, preset]) =>
      preset.base === config.base &&
      Math.abs(preset.ratio - config.ratio) < 0.001 &&
      preset.lineHeightGrid === config.lineHeightGrid,
  )?.[0];

  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap={8}>
        {/* Header */}
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Type Scale Explorer</XDSHeading>
          <XDSText type="body" color="secondary">
            Experiment with ratio-based type scales. Adjust the base size and
            ratio to see how they affect the generated scale. Line heights snap
            to the nearest grid value.
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
                  {Object.entries(RATIOS).map(([name, value]) => (
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

            {/* Formula */}
            <div {...stylex.props(styles.formula)}>
              fontSize = {config.base} × {config.ratio.toFixed(3)}
              <sup>n</sup> → round to nearest pixel
              <br />
              lineHeight = snap(fontSize × 1.25–1.5, {config.lineHeightGrid}px
              grid)
            </div>
          </XDSVStack>
        </div>

        <XDSDivider />

        {/* Scale Table */}
        <XDSVStack gap={3}>
          <div {...stylex.props(styles.sectionHeader)}>
            <XDSHeading level={2}>Computed Scale</XDSHeading>
            {collisions.size > 0 && (
              <span {...stylex.props(styles.badge, styles.collisionWarning)}>
                ⚠️ {collisions.size} collision{collisions.size > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <table {...stylex.props(styles.table)}>
            <thead>
              <tr>
                <th {...stylex.props(styles.th)}>Token</th>
                <th {...stylex.props(styles.th)}>Exponent</th>
                <th {...stylex.props(styles.th)}>Raw</th>
                <th {...stylex.props(styles.th)}>Font Size</th>
                <th {...stylex.props(styles.th)}>Line Height</th>
                <th {...stylex.props(styles.th)}>LH Ratio</th>
              </tr>
            </thead>
            <tbody>
              {scale.map(step => (
                <tr key={step.name}>
                  <td {...stylex.props(styles.td)}>
                    <code>--text-{step.name}</code>
                    {collisions.has(step.fontSize) && (
                      <span
                        {...stylex.props(
                          styles.badge,
                          styles.collisionWarning,
                        )}>
                        collision
                      </span>
                    )}
                  </td>
                  <td {...stylex.props(styles.td, styles.tdMono)}>
                    {step.exponent >= 0 ? '+' : ''}
                    {step.exponent}
                  </td>
                  <td {...stylex.props(styles.td, styles.tdMono)}>
                    {step.rawSize.toFixed(2)}px
                  </td>
                  <td {...stylex.props(styles.td, styles.tdMono)}>
                    {step.fontSize}px
                  </td>
                  <td {...stylex.props(styles.td, styles.tdMono)}>
                    {step.lineHeight}px
                  </td>
                  <td {...stylex.props(styles.td, styles.tdMono)}>
                    {step.lineHeightRatio.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </XDSVStack>

        <XDSDivider />

        {/* Live Preview */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Live Preview</XDSHeading>

          <div {...stylex.props(styles.preview)}>
            <XDSVStack gap={4}>
              {scale
                .slice()
                .reverse()
                .map(step => (
                  <p
                    key={step.name}
                    style={{
                      fontSize: step.fontSize,
                      lineHeight: `${step.lineHeight}px`,
                    }}
                    {...stylex.props(styles.sampleText)}>
                    <strong>{step.name}</strong> — The quick brown fox jumps
                    over the lazy dog ({step.fontSize}px / {step.lineHeight}px)
                  </p>
                ))}
            </XDSVStack>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* Side-by-Side Comparison */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Preset Comparison</XDSHeading>
          <XDSText type="supporting" color="secondary">
            See how the same semantic tokens render across different theme
            presets.
          </XDSText>

          <XDSHStack gap={4}>
            {Object.entries(PRESETS).map(([name, preset]) => {
              const presetScale = generateTypeScale(preset);
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
                        {presetScale.slice(2, 6).map(step => (
                          <p
                            key={step.name}
                            style={{
                              fontSize: step.fontSize,
                              lineHeight: `${step.lineHeight}px`,
                              margin: 0,
                            }}
                            {...stylex.props(styles.sampleText)}>
                            {step.name}: {step.fontSize}px
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
      </XDSVStack>
    </div>
  );
}
