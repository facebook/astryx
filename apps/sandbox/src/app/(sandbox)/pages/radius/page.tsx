'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core';
import {XDSButton} from '@xds/core/Button';
import {XDSToken} from '@xds/core/Token';
// =============================================================================
// Constants
// =============================================================================

const BASE = {content: 4, element: 8, container: 12};

const PRESETS: Record<string, number> = {
  sharp: 0,
  subtle: 0.5,
  default: 1,
  rounded: 1.5,
  pill: 2,
};

function computeTokens(m: number) {
  return {
    'radius-none': 0,
    'radius-content': +(BASE.content * m).toFixed(1),
    'radius-element': +(BASE.element * m).toFixed(1),
    'radius-container': +(BASE.container * m).toFixed(1),
    'radius-rounded': 9999,
  };
}

// =============================================================================
// Styles — same patterns as type-scale-explorer
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
  formula: {
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    fontSize: 13,
    padding: '12px 16px',
    backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
    borderRadius: 6,
    color: 'light-dark(#333, #eee)',
  },
  tokenBar: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  tokenChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    backgroundColor: 'light-dark(#fff, #333)',
    border: '1px solid light-dark(#ddd, #444)',
    borderRadius: 6,
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    fontSize: 11,
  },
  tokenName: {
    color: 'light-dark(#666, #aaa)',
  },
  tokenVal: {
    color: 'light-dark(#0064E0, #2694FE)',
    fontWeight: 600,
  },
  // Section headers
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'light-dark(#666, #aaa)',
  },
  sectionToken: {
    fontSize: 11,
    color: 'light-dark(#888, #777)',
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
  },
  sectionNote: {
    fontSize: 11,
    color: 'light-dark(#888, #777)',
    marginLeft: 'auto',
  },
  // Component layout
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
  },
  componentLabel: {
    fontSize: 10,
    color: 'light-dark(#888, #777)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  // radius-none
  table: {
    border: '1px solid light-dark(#ddd, #444)',
    borderRadius: 0,
    overflow: 'hidden',
    fontSize: 13,
    width: 320,
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    padding: '8px 12px',
    backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
    fontWeight: 600,
    fontSize: 11,
    color: 'light-dark(#666, #aaa)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid light-dark(#ddd, #444)',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    padding: '8px 12px',
    color: 'light-dark(#333, #eee)',
    borderBottom: '1px solid light-dark(#eee, #333)',
  },
  tableRowLast: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    padding: '8px 12px',
    color: 'light-dark(#333, #eee)',
  },
  sidePanel: {
    border: '1px solid light-dark(#ddd, #444)',
    borderRadius: 0,
    padding: 16,
    width: 180,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  sideItem: {
    padding: '6px 10px',
    fontSize: 12,
    color: 'light-dark(#666, #aaa)',
    cursor: 'pointer',
    transition: 'border-radius 0.2s',
  },
  sideItemActive: {
    backgroundColor: 'light-dark(rgba(0,100,224,0.08), rgba(38,148,254,0.12))',
    color: 'light-dark(#0064E0, #2694FE)',
  },
  // Buttons
  btn: {
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 500,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-radius 0.2s',
  },
  btnSm: {padding: '6px 14px', fontSize: 13},
  btnPrimary: {backgroundColor: 'light-dark(#0064E0, #2694FE)', color: '#fff'},
  btnSecondary: {
    backgroundColor: 'light-dark(#f0f0f0, #333)',
    color: 'light-dark(#333, #eee)',
    borderColor: 'light-dark(#ddd, #444)',
  },
  btnFlat: {backgroundColor: 'transparent', color: 'light-dark(#333, #eee)'},
  // Inputs
  input: {
    padding: '8px 12px',
    border: '1px solid light-dark(#ddd, #444)',
    backgroundColor: 'light-dark(#fff, #333)',
    color: 'light-dark(#333, #eee)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    width: 180,
    transition: 'border-radius 0.2s',
  },
  textarea: {
    padding: '8px 12px',
    border: '1px solid light-dark(#ddd, #444)',
    backgroundColor: 'light-dark(#fff, #333)',
    color: 'light-dark(#333, #eee)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    width: 200,
    height: 60,
    resize: 'vertical',
    transition: 'border-radius 0.2s',
  },
  // Code block
  codeBlock: {
    backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
    border: '1px solid light-dark(#ddd, #444)',
    padding: '12px 14px',
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    fontSize: 12,
    color: 'light-dark(#666, #ccc)',
    lineHeight: 1.6,
    width: 300,
    transition: 'border-radius 0.2s',
  },
  thumb: {width: 48, height: 48, flexShrink: 0, transition: 'border-radius 0.2s'},
  token: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '0 8px',
    height: 24,
    backgroundColor: 'light-dark(#f0f0f0, #333)',
    fontSize: 13,
    fontWeight: 500,
    color: 'light-dark(#333, #eee)',
    transition: 'border-radius 0.2s',
  },
  tokenX: {fontSize: 13, opacity: 0.5, cursor: 'pointer'},
  // Card
  card: {
    border: '1px solid light-dark(#ddd, #444)',
    overflow: 'hidden',
    width: 200,
    backgroundColor: 'light-dark(#fff, #1a1a1a)',
    boxShadow: '0 0 1px rgba(0,0,0,0.1)',
    transition: 'border-radius 0.2s',
  },
  cardMedia: {width: '100%', height: 100, background: 'linear-gradient(135deg, #0064E0, #5B08D8)'},
  cardBody: {padding: 12},
  cardTitle: {fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'light-dark(#333, #eee)'},
  cardDesc: {fontSize: 12, color: 'light-dark(#666, #aaa)'},
  // Modal
  modal: {
    border: '1px solid light-dark(#ddd, #444)',
    width: 260,
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
    backgroundColor: 'light-dark(#fff, #1a1a1a)',
    transition: 'border-radius 0.2s',
  },
  modalHeader: {padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'},
  modalTitle: {fontSize: 14, fontWeight: 600, color: 'light-dark(#333, #eee)'},
  modalClose: {color: 'light-dark(#999, #666)', cursor: 'pointer'},
  modalBody: {padding: '0 16px 14px', fontSize: 13, color: 'light-dark(#666, #aaa)', lineHeight: 1.5},
  modalFooter: {padding: '10px 16px', borderTop: '1px solid light-dark(#eee, #333)', display: 'flex', justifyContent: 'flex-end', gap: 8},
  // Dropdown
  dropdown: {
    border: '1px solid light-dark(#ddd, #444)',
    padding: 4,
    width: 170,
    backgroundColor: 'light-dark(#fff, #1a1a1a)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    transition: 'border-radius 0.2s',
  },
  dropdownItem: {padding: '7px 10px', fontSize: 13, color: 'light-dark(#333, #eee)', cursor: 'pointer', transition: 'border-radius 0.2s'},
  dropdownItemActive: {backgroundColor: 'light-dark(rgba(0,0,0,0.04), rgba(255,255,255,0.06))'},
  // Toast
  toast: {
    border: '1px solid light-dark(#ddd, #444)',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    width: 240,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    backgroundColor: 'light-dark(#fff, #1a1a1a)',
    color: 'light-dark(#333, #eee)',
    transition: 'border-radius 0.2s',
  },
  toastDot: {width: 10, height: 10, borderRadius: '50%', flexShrink: 0},
  // Badge
  badge: {display: 'inline-flex', padding: '2px 8px', fontSize: 11, fontWeight: 600},
  badgeInfo: {backgroundColor: 'light-dark(rgba(0,100,224,0.1), rgba(38,148,254,0.15))', color: 'light-dark(#0064E0, #4BA9FE)'},
  badgeSuccess: {backgroundColor: 'light-dark(rgba(13,134,38,0.1), rgba(13,134,38,0.15))', color: 'light-dark(#0D8626, #26A756)'},
  badgeError: {backgroundColor: 'light-dark(rgba(227,25,59,0.1), rgba(227,25,59,0.15))', color: 'light-dark(#E3193B, #F5394F)'},
  badgeWarning: {backgroundColor: 'light-dark(rgba(233,175,8,0.1), rgba(233,175,8,0.15))', color: 'light-dark(#B8860B, #E9AF08)'},
  // Avatar
  avatar: {width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff'},
  // Status
  statusDot: {width: 10, height: 10, borderRadius: '50%'},
  statusRow: {display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'light-dark(#666, #aaa)'},
  // Switch
  switchEl: {width: 40, height: 24, padding: 4, cursor: 'pointer'},
  switchOff: {backgroundColor: 'light-dark(rgba(0,0,0,0.12), rgba(255,255,255,0.12))'},
  switchOn: {backgroundColor: 'light-dark(#0064E0, #2694FE)'},
  switchThumb: {width: 16, height: 16, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'},
  switchThumbOn: {transform: 'translateX(16px)'},
  switchRow: {display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'light-dark(#333, #eee)'},
  // Concentric
  concentricCard: {
    border: '1px solid light-dark(#ddd, #444)',
    padding: 10,
    width: 190,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'light-dark(#fff, #1a1a1a)',
    transition: 'border-radius 0.2s',
  },
  concentricMedia: {
    width: '100%',
    height: 80,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
    marginBottom: 8,
    transition: 'border-radius 0.2s',
  },
  concentricTitle: {fontSize: 13, fontWeight: 500, marginBottom: 2, color: 'light-dark(#333, #eee)'},
  concentricDetail: {fontSize: 11, fontFamily: 'SF Mono, Monaco, Consolas, monospace', color: 'light-dark(#888, #777)', lineHeight: 1.5},
  concentricBtn: {
    display: 'block',
    width: '100%',
    padding: '6px 14px',
    marginTop: 8,
    backgroundColor: 'light-dark(#0064E0, #2694FE)',
    color: '#fff',
    border: 'none',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'border-radius 0.2s',
  },
  flushCard: {
    border: '1px solid light-dark(#ddd, #444)',
    width: 190,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'light-dark(#fff, #1a1a1a)',
    transition: 'border-radius 0.2s',
  },
  flushMedia: {width: '100%', height: 80, background: 'linear-gradient(135deg, #0064E0, #5B08D8)'},
  flushBody: {padding: 4, flex: 1},
  flushBtn: {
    display: 'block',
    width: 'calc(100% - 8px)',
    margin: '0 4px 4px',
    padding: '6px 14px',
    backgroundColor: 'light-dark(#0064E0, #2694FE)',
    color: '#fff',
    border: 'none',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'border-radius 0.2s',
  },
  // Table styles (shared)
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
    backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
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
  // Demo table for radius-none
  demoTable: {
    borderCollapse: 'collapse',
    fontSize: 13,
    border: '1px solid light-dark(#ddd, #444)',
    borderRadius: 0,
    overflow: 'hidden',
  },
  demoTh: {
    textAlign: 'left',
    padding: '8px 12px',
    fontWeight: 600,
    fontSize: 11,
    color: 'light-dark(#666, #aaa)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid light-dark(#ddd, #444)',
    backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
  },
  demoTd: {
    padding: '8px 12px',
    borderBottom: '1px solid light-dark(#eee, #333)',
    color: 'light-dark(#333, #eee)',
  },
  demoTdLast: {
    padding: '8px 12px',
    color: 'light-dark(#333, #eee)',
  },
});

// =============================================================================
// Page
// =============================================================================

export default function RadiusPage() {
  const [multiplier, setMultiplier] = useState(1);
  const tokens = useMemo(() => computeTokens(multiplier), [multiplier]);
  const ct = tokens['radius-container'];
  const el = tokens['radius-element'];
  const co = tokens['radius-content'];

  const activePreset = Object.entries(PRESETS).find(
    ([, v]) => Math.abs(v - multiplier) < 0.001,
  )?.[0];

  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap={8}>
        {/* Header */}
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Corner Radius</XDSHeading>
          <XDSText type="body" color="secondary">
            Dynamic radius with semantic usage
          </XDSText>
        </XDSVStack>

        {/* Controls */}
        <div {...stylex.props(styles.controls)}>
          <XDSVStack gap={4}>
            <div {...stylex.props(styles.controlGroup)}>
              <span {...stylex.props(styles.label)}>Radius Multiplier</span>
              <XDSHStack gap={3} vAlign="center">
                <input type="range" min={0} max={2} step={0.05} value={multiplier}
                  onChange={e => setMultiplier(parseFloat(e.target.value))}
                  {...stylex.props(styles.slider)} style={{maxWidth: 360}} />
                <span {...stylex.props(styles.sliderValue)}>{multiplier}&times;</span>
              </XDSHStack>
            </div>
            <XDSHStack gap={2}>
              {Object.entries(PRESETS).map(([name, value]) => (
                <XDSButton
                  key={name}
                  label={name.charAt(0).toUpperCase() + name.slice(1)}
                  variant={activePreset === name ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setMultiplier(value)}
                />
              ))}
            </XDSHStack>
            <div {...stylex.props(styles.tokenBar)}>
              {Object.entries(tokens).map(([n, val]) => (
                <XDSToken
                  key={n}
                  label={`${n}  ${val}px`}
                  color="gray"
                />
              ))}
            </div>
          </XDSVStack>
        </div>

        {/* Default Radius Table */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Default Radius</XDSHeading>
          <table {...stylex.props(styles.table)}>
            <thead>
              <tr>
                <th {...stylex.props(styles.th)}>Token</th>
                <th {...stylex.props(styles.th)}>Base Value</th>
                <th {...stylex.props(styles.th)}>Scales?</th>
                <th {...stylex.props(styles.th)}>Visual</th>
                <th {...stylex.props(styles.th)}>Example Components</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td {...stylex.props(styles.td)}><code>radius-none</code></td>
                <td {...stylex.props(styles.td, styles.tdMono)}>0dp</td>
                <td {...stylex.props(styles.td)}>No &mdash; always 0</td>
                <td {...stylex.props(styles.td)}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ccc, #555)', borderRadius: 0}} /></td>
                <td {...stylex.props(styles.td)}>dividers, table cells, side panels, shared edges (button groups)</td>
              </tr>
              <tr>
                <td {...stylex.props(styles.td)}><code>radius-content</code></td>
                <td {...stylex.props(styles.td, styles.tdMono)}>4dp</td>
                <td {...stylex.props(styles.td)}>Yes</td>
                <td {...stylex.props(styles.td)}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ccc, #555)', borderRadius: co}} /></td>
                <td {...stylex.props(styles.td)}>code blocks, thumbnails</td>
              </tr>
              <tr>
                <td {...stylex.props(styles.td)}><code>radius-element</code></td>
                <td {...stylex.props(styles.td, styles.tdMono)}>8dp</td>
                <td {...stylex.props(styles.td)}>Yes</td>
                <td {...stylex.props(styles.td)}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ccc, #555)', borderRadius: el}} /></td>
                <td {...stylex.props(styles.td)}>buttons, inputs, text areas, tokens, checkboxes</td>
              </tr>
              <tr>
                <td {...stylex.props(styles.td)}><code>radius-container</code></td>
                <td {...stylex.props(styles.td, styles.tdMono)}>12dp</td>
                <td {...stylex.props(styles.td)}>Yes</td>
                <td {...stylex.props(styles.td)}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ccc, #555)', borderRadius: ct}} /></td>
                <td {...stylex.props(styles.td)}>cards, modals, popovers, dropdown menus, toasts</td>
              </tr>
              <tr>
                <td {...stylex.props(styles.td)}><code>radius-rounded</code></td>
                <td {...stylex.props(styles.td, styles.tdMono)}>9999dp</td>
                <td {...stylex.props(styles.td)}>No &mdash; always pill</td>
                <td {...stylex.props(styles.td)}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ccc, #555)', borderRadius: 9999}} /></td>
                <td {...stylex.props(styles.td)}>badges, avatars, status dots, toggles</td>
              </tr>
            </tbody>
          </table>
        </XDSVStack>

        <XDSDivider />

        {/* radius-none */}
        <XDSVStack gap={4}>
          <XDSHStack gap={3} vAlign="center">
            <span {...stylex.props(styles.label)}>radius-none</span>
            <XDSText type="supporting" color="secondary">
              0dp &middot; Always 0 &middot; ignores multiplier
            </XDSText>
          </XDSHStack>
          <div {...stylex.props(styles.componentRow)}>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Table cells</div>
              <table {...stylex.props(styles.demoTable)}>
                <thead>
                  <tr>
                    <th {...stylex.props(styles.demoTh)}>Name</th>
                    <th {...stylex.props(styles.demoTh)}>Role</th>
                    <th {...stylex.props(styles.demoTh)}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td {...stylex.props(styles.demoTd)}>Alice</td>
                    <td {...stylex.props(styles.demoTd)}>Design</td>
                    <td {...stylex.props(styles.demoTd)} style={{color: '#0D8626'}}>Active</td>
                  </tr>
                  <tr>
                    <td {...stylex.props(styles.demoTd)}>Bob</td>
                    <td {...stylex.props(styles.demoTd)}>Eng</td>
                    <td {...stylex.props(styles.demoTd)} style={{color: '#0D8626'}}>Active</td>
                  </tr>
                  <tr>
                    <td {...stylex.props(styles.demoTdLast)}>Charlie</td>
                    <td {...stylex.props(styles.demoTdLast)}>PM</td>
                    <td {...stylex.props(styles.demoTdLast)} style={{color: '#B8860B'}}>Away</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Side panel</div>
              <div {...stylex.props(styles.sidePanel)}>
                <div {...stylex.props(styles.sideItem, styles.sideItemActive)}>Dashboard</div>
                <div {...stylex.props(styles.sideItem)}>Analytics</div>
                <div {...stylex.props(styles.sideItem)}>Settings</div>
              </div>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Shared edges (button group)</div>
              <XDSHStack gap={0}>
                <XDSButton label="Day" variant="primary" size="sm" />
                <XDSButton label="Week" variant="secondary" size="sm" />
                <XDSButton label="Month" variant="secondary" size="sm" />
              </XDSHStack>
            </div>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* radius-content */}
        <XDSVStack gap={3}>
          <XDSHStack gap={3} vAlign="center">
            <span {...stylex.props(styles.sectionTitle)}>radius-content</span>
            <span {...stylex.props(styles.sectionToken)}>4dp &times; multiplier</span>
          </XDSHStack>
          <div {...stylex.props(styles.componentRow)}>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Code block</div>
              <div {...stylex.props(styles.codeBlock)} style={{borderRadius: co}}>
                <span style={{color: '#5B08D8'}}>const</span> radius = <span style={{color: '#0064E0'}}>max</span>(<span style={{color: '#E9AF08'}}>0</span>, outer - padding);<br />
                <span style={{color: '#5B08D8'}}>const</span> theme = <span style={{color: '#0D8626'}}>&apos;default&apos;</span>;
              </div>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Thumbnails</div>
              <XDSHStack gap={2}>
                <div {...stylex.props(styles.thumb)} style={{borderRadius: co, background: 'linear-gradient(135deg,#E9AF08,#E3193B)'}} />
                <div {...stylex.props(styles.thumb)} style={{borderRadius: co, background: 'linear-gradient(135deg,#0064E0,#0D8626)'}} />
                <div {...stylex.props(styles.thumb)} style={{borderRadius: co, background: 'linear-gradient(135deg,#5B08D8,#E3193B)'}} />
                <div {...stylex.props(styles.thumb)} style={{borderRadius: co, background: 'linear-gradient(135deg,#0D8626,#0064E0)'}} />
              </XDSHStack>
            </div>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* radius-element */}
        <XDSVStack gap={3}>
          <XDSHStack gap={3} vAlign="center">
            <span {...stylex.props(styles.sectionTitle)}>radius-element</span>
            <span {...stylex.props(styles.sectionToken)}>8dp &times; multiplier</span>
          </XDSHStack>
          <div {...stylex.props(styles.componentRow)}>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Buttons</div>
              <XDSHStack gap={2}>
                <button {...stylex.props(styles.btn, styles.btnPrimary)} style={{borderRadius: el}}>Primary</button>
                <button {...stylex.props(styles.btn, styles.btnSecondary)} style={{borderRadius: el}}>Secondary</button>
                <button {...stylex.props(styles.btn, styles.btnFlat)} style={{borderRadius: el}}>Flat</button>
              </XDSHStack>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Input</div>
              <input {...stylex.props(styles.input)} style={{borderRadius: el}} placeholder="Enter text..." />
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Text area</div>
              <textarea {...stylex.props(styles.textarea)} style={{borderRadius: el}} placeholder="Write something..." />
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Tokens</div>
              <XDSHStack gap={2}>
                <span {...stylex.props(styles.token)} style={{borderRadius: co}}>Design <span {...stylex.props(styles.tokenX)}>&times;</span></span>
                <span {...stylex.props(styles.token)} style={{borderRadius: co}}>System <span {...stylex.props(styles.tokenX)}>&times;</span></span>
                <span {...stylex.props(styles.token)} style={{borderRadius: co}}>Radius <span {...stylex.props(styles.tokenX)}>&times;</span></span>
              </XDSHStack>
            </div>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* radius-container */}
        <XDSVStack gap={3}>
          <XDSHStack gap={3} vAlign="center">
            <span {...stylex.props(styles.sectionTitle)}>radius-container</span>
            <span {...stylex.props(styles.sectionToken)}>12dp &times; multiplier</span>
          </XDSHStack>
          <div {...stylex.props(styles.componentRow)}>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Card</div>
              <div {...stylex.props(styles.card)} style={{borderRadius: ct}}>
                <div {...stylex.props(styles.cardMedia)} />
                <div {...stylex.props(styles.cardBody)}>
                  <div {...stylex.props(styles.cardTitle)}>Card title</div>
                  <div {...stylex.props(styles.cardDesc)}>Grouped content.</div>
                </div>
              </div>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Modal</div>
              <div {...stylex.props(styles.modal)} style={{borderRadius: ct}}>
                <div {...stylex.props(styles.modalHeader)}>
                  <span {...stylex.props(styles.modalTitle)}>Confirm action</span>
                  <span {...stylex.props(styles.modalClose)}>&times;</span>
                </div>
                <div {...stylex.props(styles.modalBody)}>Are you sure? This cannot be undone.</div>
                <div {...stylex.props(styles.modalFooter)}>
                  <button {...stylex.props(styles.btn, styles.btnSm, styles.btnSecondary)} style={{borderRadius: el}}>Cancel</button>
                  <button {...stylex.props(styles.btn, styles.btnSm, styles.btnPrimary)} style={{borderRadius: el}}>Confirm</button>
                </div>
              </div>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Dropdown</div>
              <div {...stylex.props(styles.dropdown)} style={{borderRadius: ct}}>
                <div {...stylex.props(styles.dropdownItem, styles.dropdownItemActive)} style={{borderRadius: Math.max(0, ct - 4)}}>Dashboard</div>
                <div {...stylex.props(styles.dropdownItem)} style={{borderRadius: Math.max(0, ct - 4)}}>Settings</div>
                <div {...stylex.props(styles.dropdownItem)} style={{borderRadius: Math.max(0, ct - 4)}}>Profile</div>
                <div {...stylex.props(styles.dropdownItem)} style={{borderRadius: Math.max(0, ct - 4)}}>Log out</div>
              </div>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Toasts</div>
              <XDSVStack gap={2}>
                <div {...stylex.props(styles.toast)} style={{borderRadius: ct}}><div {...stylex.props(styles.toastDot)} style={{background: '#0D8626'}} /><span>Saved successfully</span></div>
                <div {...stylex.props(styles.toast)} style={{borderRadius: ct}}><div {...stylex.props(styles.toastDot)} style={{background: '#E3193B'}} /><span>Something went wrong</span></div>
              </XDSVStack>
            </div>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* radius-rounded */}
        <XDSVStack gap={3}>
          <XDSHStack gap={3} vAlign="center">
            <span {...stylex.props(styles.sectionTitle)}>radius-rounded</span>
            <span {...stylex.props(styles.sectionToken)}>9999px</span>
            <span {...stylex.props(styles.sectionNote)}>Always pill &middot; ignores multiplier</span>
          </XDSHStack>
          <div {...stylex.props(styles.componentRow)}>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Badges</div>
              <XDSHStack gap={2}>
                <span {...stylex.props(styles.badge, styles.badgeInfo)} style={{borderRadius: 9999}}>New</span>
                <span {...stylex.props(styles.badge, styles.badgeSuccess)} style={{borderRadius: 9999}}>Active</span>
                <span {...stylex.props(styles.badge, styles.badgeError)} style={{borderRadius: 9999}}>Error</span>
                <span {...stylex.props(styles.badge, styles.badgeWarning)} style={{borderRadius: 9999}}>Pending</span>
              </XDSHStack>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Avatars</div>
              <XDSHStack gap={2}>
                <div {...stylex.props(styles.avatar)} style={{borderRadius: 9999, background: 'linear-gradient(135deg,#5B08D8,#E3193B)'}}>JD</div>
                <div {...stylex.props(styles.avatar)} style={{borderRadius: 9999, background: 'linear-gradient(135deg,#0064E0,#0D8626)'}}>AB</div>
                <div {...stylex.props(styles.avatar)} style={{borderRadius: 9999, background: 'linear-gradient(135deg,#E9AF08,#E3193B)'}}>KL</div>
              </XDSHStack>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Status dots</div>
              <XDSVStack gap={2}>
                <div {...stylex.props(styles.statusRow)}><div {...stylex.props(styles.statusDot)} style={{background: '#0D8626'}} />Online</div>
                <div {...stylex.props(styles.statusRow)}><div {...stylex.props(styles.statusDot)} style={{background: '#E9AF08'}} />Away</div>
                <div {...stylex.props(styles.statusRow)}><div {...stylex.props(styles.statusDot)} style={{background: '#E3193B'}} />Busy</div>
              </XDSVStack>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Toggles</div>
              <XDSVStack gap={2}>
                <div {...stylex.props(styles.switchRow)}><div {...stylex.props(styles.switchEl, styles.switchOn)} style={{borderRadius: 9999}}><div {...stylex.props(styles.switchThumb, styles.switchThumbOn)} style={{borderRadius: 9999}} /></div><span>Notifications</span></div>
                <div {...stylex.props(styles.switchRow)}><div {...stylex.props(styles.switchEl, styles.switchOff)} style={{borderRadius: 9999}}><div {...stylex.props(styles.switchThumb)} style={{borderRadius: 9999}} /></div><span>Dark mode</span></div>
              </XDSVStack>
            </div>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* Concentric Radius */}
        <XDSVStack gap={3}>
          <XDSHStack gap={3} vAlign="center">
            <span {...stylex.props(styles.sectionTitle)}>Concentric Radius</span>
            <span {...stylex.props(styles.sectionToken)}>max(0, outerRadius &minus; padding)</span>
          </XDSHStack>
          <XDSText type="supporting" color="secondary">
            Inner radius = outer minus padding. Nested elements get concentric corners.
          </XDSText>
          <div {...stylex.props(styles.componentRow)}>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Nested elements</div>
              <XDSHStack gap={4}>
                <div {...stylex.props(styles.concentricCard)} style={{borderRadius: ct}}>
                  <div {...stylex.props(styles.concentricMedia)} style={{borderRadius: Math.max(0, ct - 10)}} />
                  <div style={{paddingInline: 2, flex: 1}}>
                    <div {...stylex.props(styles.concentricTitle)}>Inset media</div>
                    <div {...stylex.props(styles.concentricDetail)}>card: {ct}px, pad: 10px<br />&rarr; inner: {Math.max(0, +(ct - 10).toFixed(1))}px</div>
                  </div>
                  <button {...stylex.props(styles.concentricBtn)} style={{borderRadius: Math.max(0, ct - 10)}}>Action</button>
                  <div {...stylex.props(styles.concentricDetail)} style={{marginTop: 4}}>btn: max(0, {ct} - 10) = {Math.max(0, +(ct - 10).toFixed(1))}px</div>
                </div>
                <div {...stylex.props(styles.concentricCard)} style={{borderRadius: ct, padding: 8}}>
                  <div {...stylex.props(styles.concentricMedia)} style={{borderRadius: Math.max(0, ct - 8)}} />
                  <div style={{paddingInline: 2, flex: 1}}>
                    <div {...stylex.props(styles.concentricTitle)}>Tighter pad</div>
                    <div {...stylex.props(styles.concentricDetail)}>card: {ct}px, pad: 8px<br />&rarr; inner: {Math.max(0, +(ct - 8).toFixed(1))}px</div>
                  </div>
                  <button {...stylex.props(styles.concentricBtn)} style={{borderRadius: Math.max(0, ct - 8)}}>Action</button>
                  <div {...stylex.props(styles.concentricDetail)} style={{marginTop: 4}}>btn: max(0, {ct} - 8) = {Math.max(0, +(ct - 8).toFixed(1))}px</div>
                </div>
                <div {...stylex.props(styles.flushCard)} style={{borderRadius: ct}}>
                  <div {...stylex.props(styles.flushMedia)} />
                  <div {...stylex.props(styles.flushBody)}>
                    <div {...stylex.props(styles.concentricTitle)}>Flush media</div>
                    <div {...stylex.props(styles.concentricDetail)}>card: {ct}px, pad: 0<br />&rarr; inherits card</div>
                  </div>
                  <button {...stylex.props(styles.flushBtn)} style={{borderRadius: Math.max(0, ct - 4)}}>Action</button>
                  <div {...stylex.props(styles.concentricDetail)} style={{margin: '4px 4px 0'}}>btn: max(0, {ct} - 4) = {Math.max(0, +(ct - 4).toFixed(1))}px</div>
                </div>
              </XDSHStack>
            </div>
            <div {...stylex.props(styles.componentGroup)}>
              <div {...stylex.props(styles.componentLabel)}>Dropdown (4px pad)</div>
              <div {...stylex.props(styles.dropdown)} style={{borderRadius: ct, width: 190}}>
                <div {...stylex.props(styles.dropdownItem, styles.dropdownItemActive)} style={{borderRadius: Math.max(0, ct - 4)}}>Dashboard</div>
                <div {...stylex.props(styles.dropdownItem)} style={{borderRadius: Math.max(0, ct - 4)}}>Settings</div>
                <div {...stylex.props(styles.dropdownItem)} style={{borderRadius: Math.max(0, ct - 4)}}>Profile</div>
                <div {...stylex.props(styles.dropdownItem)} style={{borderRadius: Math.max(0, ct - 4)}}>Log out</div>
              </div>
              <div {...stylex.props(styles.concentricDetail)} style={{marginTop: 6}}>menu: {ct}px, pad: 4px<br />&rarr; item: {Math.max(0, +(ct - 4).toFixed(1))}px</div>
            </div>
          </div>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
