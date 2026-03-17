'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core';

// =============================================================================
// Radius Computation
// =============================================================================

const BASE = {content: 4, element: 8, container: 12};

const PRESETS: Record<string, number> = {
  sharp: 0,
  subtle: 0.5,
  default: 1,
  rounded: 1.5,
  pill: 2,
};

interface RadiusToken {
  name: string;
  base: number | null;
  scales: boolean;
  computed: number;
  examples: string;
}

function computeScale(multiplier: number): RadiusToken[] {
  return [
    {name: 'radius-none', base: null, scales: false, computed: 0, examples: 'Dividers, table cells, side panels, shared edges'},
    {name: 'radius-content', base: BASE.content, scales: true, computed: +(BASE.content * multiplier).toFixed(1), examples: 'Code blocks, thumbnails'},
    {name: 'radius-element', base: BASE.element, scales: true, computed: +(BASE.element * multiplier).toFixed(1), examples: 'Buttons, inputs, selects, tokens'},
    {name: 'radius-container', base: BASE.container, scales: true, computed: +(BASE.container * multiplier).toFixed(1), examples: 'Cards, modals, popovers, dropdowns, toasts'},
    {name: 'radius-rounded', base: null, scales: false, computed: 9999, examples: 'Badges, avatars, status dots, toggles'},
  ];
}

// =============================================================================
// Styles (copied from Ernest's type-scale-explorer)
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
  fixedBadge: {
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
  swatch: {
    display: 'inline-block',
    backgroundColor: 'light-dark(#0064E0, #2694FE)',
    transition: 'border-radius 0.2s',
  },
  componentRow: {
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  componentGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 120,
  },
  componentLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'light-dark(#888, #777)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  demoCard: {
    border: '1px solid light-dark(#ddd, #444)',
    overflow: 'hidden',
    width: 180,
    backgroundColor: 'light-dark(#fff, #1a1a1a)',
    transition: 'border-radius 0.2s',
  },
  demoCardMedia: {
    width: '100%',
    height: 80,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
  },
  demoCardBody: {
    padding: 10,
  },
  demoDropdown: {
    border: '1px solid light-dark(#ddd, #444)',
    padding: 4,
    width: 160,
    backgroundColor: 'light-dark(#fff, #1a1a1a)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    transition: 'border-radius 0.2s',
  },
  demoDropdownItem: {
    padding: '6px 10px',
    fontSize: 13,
    color: 'light-dark(#333, #eee)',
    transition: 'border-radius 0.2s',
  },
  demoDropdownItemActive: {
    backgroundColor: 'light-dark(rgba(0,0,0,0.04), rgba(255,255,255,0.06))',
  },
  concentricCard: {
    border: '1px solid light-dark(#ddd, #444)',
    padding: 10,
    width: 170,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'light-dark(#fff, #1a1a1a)',
    transition: 'border-radius 0.2s',
  },
  concentricMedia: {
    width: '100%',
    height: 60,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
    marginBottom: 8,
    transition: 'border-radius 0.2s',
  },
  sampleText: {
    margin: 0,
    color: 'light-dark(#333, #eee)',
  },
});

// =============================================================================
// Component
// =============================================================================

export default function RadiusPage() {
  const [multiplier, setMultiplier] = useState(1);
  const scale = useMemo(() => computeScale(multiplier), [multiplier]);

  const activePreset = Object.entries(PRESETS).find(
    ([, v]) => Math.abs(v - multiplier) < 0.001,
  )?.[0];

  const ct = scale[3].computed;
  const el = scale[2].computed;
  const co = scale[1].computed;

  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap={8}>
        {/* Header */}
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Corner Radius</XDSHeading>
          <XDSText type="body" color="secondary">
            Dynamic radius with semantic usage. Adjust the multiplier to see how
            the five tokens respond. None and rounded are fixed; content,
            element, and container scale with the multiplier.
          </XDSText>
        </XDSVStack>

        {/* Controls */}
        <div {...stylex.props(styles.controls)}>
          <XDSVStack gap={4}>
            {/* Presets */}
            <div {...stylex.props(styles.controlGroup)}>
              <span {...stylex.props(styles.label)}>Presets</span>
              <XDSHStack gap={2}>
                {Object.entries(PRESETS).map(([name, value]) => (
                  <button
                    key={name}
                    {...stylex.props(
                      styles.presetButton,
                      activePreset === name && styles.presetButtonActive,
                    )}
                    onClick={() => setMultiplier(value)}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </button>
                ))}
              </XDSHStack>
            </div>

            {/* Multiplier */}
            <div {...stylex.props(styles.controlGroup)}>
              <span {...stylex.props(styles.label)}>Multiplier</span>
              <XDSHStack gap={3} vAlign="center">
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.05}
                  value={multiplier}
                  onChange={e =>
                    setMultiplier(parseFloat(e.target.value))
                  }
                  {...stylex.props(styles.slider)}
                />
                <span {...stylex.props(styles.sliderValue)}>
                  {multiplier}&times;
                </span>
              </XDSHStack>
            </div>

            {/* Formula */}
            <div {...stylex.props(styles.formula)}>
              computed = base &times; {multiplier}
              <br />
              none (0px) and rounded (9999px) are fixed
            </div>
          </XDSVStack>
        </div>

        <XDSDivider />

        {/* Token Table */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Computed Tokens</XDSHeading>

          <table {...stylex.props(styles.table)}>
            <thead>
              <tr>
                <th {...stylex.props(styles.th)}>Token</th>
                <th {...stylex.props(styles.th)}>Base</th>
                <th {...stylex.props(styles.th)}>Computed</th>
                <th {...stylex.props(styles.th)}>Examples</th>
                <th {...stylex.props(styles.th)}>Preview</th>
              </tr>
            </thead>
            <tbody>
              {scale.map(token => (
                <tr key={token.name}>
                  <td {...stylex.props(styles.td)}>
                    <code>{token.name}</code>
                    {!token.scales && (
                      <span {...stylex.props(styles.badge, styles.fixedBadge)}>
                        fixed
                      </span>
                    )}
                  </td>
                  <td {...stylex.props(styles.td, styles.tdMono)}>
                    {token.base != null ? `${token.base}px` : '\u2014'}
                  </td>
                  <td {...stylex.props(styles.td, styles.tdMono)}>
                    {token.computed === 9999 ? '9999px' : `${token.computed}px`}
                  </td>
                  <td {...stylex.props(styles.td)}>
                    <XDSText type="supporting" color="secondary">
                      {token.examples}
                    </XDSText>
                  </td>
                  <td {...stylex.props(styles.td)}>
                    <div
                      {...stylex.props(styles.swatch)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: token.computed === 9999 ? 9999 : token.computed,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </XDSVStack>

        <XDSDivider />

        {/* Live Preview — Container */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Live Preview</XDSHeading>
          <XDSText type="supporting" color="secondary">
            Drag the slider to see how components respond at each token level.
          </XDSText>

          <div {...stylex.props(styles.preview)}>
            <XDSVStack gap={8}>
              {/* radius-container */}
              <XDSVStack gap={3}>
                <XDSText type="label">radius-container ({ct}px)</XDSText>
                <div {...stylex.props(styles.componentRow)}>
                  <div {...stylex.props(styles.componentGroup)}>
                    <div {...stylex.props(styles.componentLabel)}>Card</div>
                    <div {...stylex.props(styles.demoCard)} style={{borderRadius: ct}}>
                      <div {...stylex.props(styles.demoCardMedia)} />
                      <div {...stylex.props(styles.demoCardBody)}>
                        <XDSText type="body" weight="bold">Card title</XDSText>
                        <XDSText type="supporting" color="secondary">Grouped content.</XDSText>
                      </div>
                    </div>
                  </div>
                  <div {...stylex.props(styles.componentGroup)}>
                    <div {...stylex.props(styles.componentLabel)}>Dropdown</div>
                    <div {...stylex.props(styles.demoDropdown)} style={{borderRadius: ct}}>
                      <div {...stylex.props(styles.demoDropdownItem, styles.demoDropdownItemActive)} style={{borderRadius: Math.max(0, ct - 4)}}>Dashboard</div>
                      <div {...stylex.props(styles.demoDropdownItem)} style={{borderRadius: Math.max(0, ct - 4)}}>Settings</div>
                      <div {...stylex.props(styles.demoDropdownItem)} style={{borderRadius: Math.max(0, ct - 4)}}>Profile</div>
                    </div>
                  </div>
                </div>
              </XDSVStack>

              {/* radius-element */}
              <XDSVStack gap={3}>
                <XDSText type="label">radius-element ({el}px)</XDSText>
                <div {...stylex.props(styles.componentRow)}>
                  <div {...stylex.props(styles.componentGroup)}>
                    <div {...stylex.props(styles.componentLabel)}>Swatches</div>
                    <XDSHStack gap={3}>
                      <div {...stylex.props(styles.swatch)} style={{width: 36, height: 36, borderRadius: el}} />
                      <div {...stylex.props(styles.swatch)} style={{width: 48, height: 48, borderRadius: el}} />
                      <div {...stylex.props(styles.swatch)} style={{width: 64, height: 64, borderRadius: el}} />
                    </XDSHStack>
                  </div>
                </div>
              </XDSVStack>

              {/* radius-content */}
              <XDSVStack gap={3}>
                <XDSText type="label">radius-content ({co}px)</XDSText>
                <div {...stylex.props(styles.componentRow)}>
                  <div {...stylex.props(styles.componentGroup)}>
                    <div {...stylex.props(styles.componentLabel)}>Swatches</div>
                    <XDSHStack gap={3}>
                      <div {...stylex.props(styles.swatch)} style={{width: 36, height: 36, borderRadius: co}} />
                      <div {...stylex.props(styles.swatch)} style={{width: 48, height: 48, borderRadius: co}} />
                      <div {...stylex.props(styles.swatch)} style={{width: 64, height: 64, borderRadius: co}} />
                    </XDSHStack>
                  </div>
                </div>
              </XDSVStack>
            </XDSVStack>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* Concentric Radius */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Concentric Radius</XDSHeading>
          <XDSText type="supporting" color="secondary">
            Inner radius = max(0, outerRadius &minus; padding). Nested elements
            get concentric corners that converge to sharp as nesting deepens.
          </XDSText>

          <XDSHStack gap={4}>
            {[
              {label: '10px padding', pad: 10},
              {label: '8px padding', pad: 8},
              {label: '4px padding', pad: 4},
            ].map(({label, pad}) => {
              const inner = Math.max(0, +(ct - pad).toFixed(1));
              return (
                <div key={label} style={{flex: 1}}>
                  <XDSVStack gap={2}>
                    <XDSText type="label">{label}</XDSText>
                    <XDSText type="supporting" color="secondary">
                      outer: {ct}px &rarr; inner: {inner}px
                    </XDSText>
                    <div {...stylex.props(styles.concentricCard)} style={{borderRadius: ct, padding: pad}}>
                      <div {...stylex.props(styles.concentricMedia)} style={{borderRadius: inner}} />
                      <p style={{margin: 0}} {...stylex.props(styles.sampleText)}>
                        Content inside
                      </p>
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
