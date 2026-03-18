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
});

// =============================================================================
// Page
// =============================================================================

export default function RadiusPage() {
  const [multiplier, setMultiplier] = useState(1);
  const tokens = useMemo(() => computeTokens(multiplier), [multiplier]);

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

        <XDSDivider />

        {/* Controls */}
        <div {...stylex.props(styles.controls)}>
          <XDSVStack gap={4}>
            <span {...stylex.props(styles.label)}>Radius Multiplier</span>
            <XDSHStack gap={3} vAlign="center">
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={multiplier}
                onChange={e => setMultiplier(parseFloat(e.target.value))}
                {...stylex.props(styles.slider)}
                style={{maxWidth: 360}}
              />
              <span {...stylex.props(styles.sliderValue)}>
                base number: 4 &times; {multiplier}
              </span>
            </XDSHStack>
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
            <XDSHStack gap={2}>
              {Object.entries(tokens).map(([n, val]) => (
                <XDSToken key={n} label={`${n}  ${val}px`} color="gray" />
              ))}
            </XDSHStack>
          </XDSVStack>
        </div>

        <XDSDivider />

        {/* Default Radius Table */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Default Radius</XDSHeading>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 14}}>
            <thead>
              <tr>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Token</th>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Base Value</th>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Scales?</th>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Visual</th>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Example Components</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', fontFamily: 'monospace'}}>radius-none</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>0dp</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>No — always 0</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: 0}} /></td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', color: 'light-dark(#666, #aaa)'}}>dividers, table cells, side panels, shared edges (button groups)</td>
              </tr>
              <tr>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', fontFamily: 'monospace'}}>radius-content</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>4dp</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>Yes</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: tokens['radius-content']}} /></td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', color: 'light-dark(#666, #aaa)'}}>code blocks, thumbnails</td>
              </tr>
              <tr>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', fontFamily: 'monospace'}}>radius-element</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>8dp</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>Yes</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: tokens['radius-element']}} /></td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', color: 'light-dark(#666, #aaa)'}}>buttons, inputs, text areas, tokens, checkboxes</td>
              </tr>
              <tr>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', fontFamily: 'monospace'}}>radius-container</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>12dp</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>Yes</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: tokens['radius-container']}} /></td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', color: 'light-dark(#666, #aaa)'}}>cards, modals, popovers, dropdown menus, toasts</td>
              </tr>
              <tr>
                <td style={{padding: '12px 0', fontFamily: 'monospace'}}>radius-rounded</td>
                <td style={{padding: '12px 0'}}>9999dp</td>
                <td style={{padding: '12px 0'}}>No — always pill</td>
                <td style={{padding: '12px 0'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: 9999}} /></td>
                <td style={{padding: '12px 0', color: 'light-dark(#666, #aaa)'}}>badges, avatars, status dots, toggles</td>
              </tr>
            </tbody>
          </table>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
