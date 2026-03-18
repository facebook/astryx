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

const BASE = {r1: 4, r2: 8, r3: 12, r4: 16};

const PRESETS: Record<string, number> = {
  sharp: 0,
  subtle: 0.5,
  default: 1,
  rounded: 1.5,
  pill: 2,
};

function computeTokens(m: number) {
  return {
    'radius-0': 0,
    'radius-1': +(BASE.r1 * m).toFixed(1),
    'radius-2': +(BASE.r2 * m).toFixed(1),
    'radius-3': +(BASE.r3 * m).toFixed(1),
    'radius-4': +(BASE.r4 * m).toFixed(1),
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
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
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
// Dropdown Item (hover support with dynamic radius)
// =============================================================================

function DropdownItem({label, radius, active}: {label: string; radius: number; active?: boolean}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 14px',
        fontSize: 15,
        color: 'light-dark(#333, #eee)',
        borderRadius: radius,
        backgroundColor: active || hovered ? 'light-dark(rgba(0,0,0,0.04), rgba(255,255,255,0.06))' : 'transparent',
        transition: 'border-radius 0.2s, background-color 0.15s',
        cursor: 'pointer',
      }}
    >
      {label}
    </div>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function RadiusPage() {
  const [multiplier, setMultiplier] = useState(1);
  const tokens = useMemo(() => computeTokens(multiplier), [multiplier]);
  const r4 = tokens['radius-4'];
  const r3 = tokens['radius-3'];
  const r2 = tokens['radius-2'];
  const r1 = tokens['radius-1'];

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
            Dynamic radius with numeric scale tokens
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* Controls */}
        <div {...stylex.props(styles.controls)}>
          <XDSVStack gap={4}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>Radius Multiplier</span>
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
                <XDSToken key={n} label={`${n}: ${val}dp`} color="gray" />
              ))}
            </XDSHStack>
          </XDSVStack>
        </div>

        <XDSDivider />

        {/* Default Radius Table */}
        <XDSVStack gap={3}>
          <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>Default Radius</span>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 14}}>
            <thead>
              <tr>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Token</th>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Internal Vanity</th>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Base Value</th>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Scales?</th>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Visual</th>
                <th style={{textAlign: 'left', padding: '12px 0', fontWeight: 600, borderBottom: '2px solid light-dark(#ddd, #444)'}}>Example Components</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', fontFamily: 'monospace'}}>radius-0</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>radius-none</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>0dp</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>{`No — always 0`}</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: 0}} /></td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', color: 'light-dark(#666, #aaa)'}}>dividers, table cells, side panels, shared edges (button groups)</td>
              </tr>
              <tr>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', fontFamily: 'monospace'}}>radius-1</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>radius-content</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>4dp</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>Yes</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: 4}} /></td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', color: 'light-dark(#666, #aaa)'}}>code blocks, thumbnails</td>
              </tr>
              <tr>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', fontFamily: 'monospace'}}>radius-2</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>radius-element</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>8dp</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>Yes</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: 8}} /></td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', color: 'light-dark(#666, #aaa)'}}>buttons, inputs, text areas, tokens, checkboxes</td>
              </tr>
              <tr>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', fontFamily: 'monospace'}}>radius-3</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>radius-container</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>12dp</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>Yes</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: 12}} /></td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', color: 'light-dark(#666, #aaa)'}}>cards, modals, popovers, dropdown menus, toasts</td>
              </tr>
              <tr>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', fontFamily: 'monospace'}}>radius-4</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>radius-page</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>16dp</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}>Yes</td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: 16}} /></td>
                <td style={{padding: '12px 0', borderBottom: '1px solid light-dark(#eee, #333)', color: 'light-dark(#666, #aaa)'}}>page sections, large containers</td>
              </tr>
              <tr>
                <td style={{padding: '12px 0', fontFamily: 'monospace'}}>radius-rounded</td>
                <td style={{padding: '12px 0'}}>radius-rounded</td>
                <td style={{padding: '12px 0'}}>9999dp</td>
                <td style={{padding: '12px 0'}}>{`No — always pill`}</td>
                <td style={{padding: '12px 0'}}><div style={{width: 40, height: 40, backgroundColor: 'light-dark(#ddd, #444)', borderRadius: 9999}} /></td>
                <td style={{padding: '12px 0', color: 'light-dark(#666, #aaa)'}}>badges, avatars, status dots, toggles</td>
              </tr>
            </tbody>
          </table>
        </XDSVStack>

        <XDSDivider />

        {/* radius-none */}
        <XDSVStack gap={4}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>radius-0</span>
            <span style={{fontSize: 13, color: 'light-dark(#666, #aaa)', fontStyle: 'italic'}}>0dp</span>
            <span style={{fontSize: 13, color: 'light-dark(#888, #777)', marginLeft: 'auto'}}>Always 0 &middot; ignores multiplier</span>
          </div>
          <div style={{display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start'}}>
            {/* Table cells */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Table Cells</span>
              <table style={{borderCollapse: 'collapse', fontSize: 14, border: '1px solid light-dark(#ddd, #444)', borderRadius: 0}}>
                <thead>
                  <tr>
                    <th style={{textAlign: 'left', padding: '8px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'light-dark(#666, #aaa)', borderBottom: '1px solid light-dark(#ddd, #444)', backgroundColor: 'light-dark(#f9f9f9, #2a2a2a)'}}>Name</th>
                    <th style={{textAlign: 'left', padding: '8px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'light-dark(#666, #aaa)', borderBottom: '1px solid light-dark(#ddd, #444)', backgroundColor: 'light-dark(#f9f9f9, #2a2a2a)'}}>Role</th>
                    <th style={{textAlign: 'left', padding: '8px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'light-dark(#666, #aaa)', borderBottom: '1px solid light-dark(#ddd, #444)', backgroundColor: 'light-dark(#f9f9f9, #2a2a2a)'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{padding: '10px 16px', borderBottom: '1px solid light-dark(#eee, #333)'}}>Alice</td>
                    <td style={{padding: '10px 16px', borderBottom: '1px solid light-dark(#eee, #333)'}}>Design</td>
                    <td style={{padding: '10px 16px', borderBottom: '1px solid light-dark(#eee, #333)', color: '#0D8626'}}>Active</td>
                  </tr>
                  <tr>
                    <td style={{padding: '10px 16px'}}>Bob</td>
                    <td style={{padding: '10px 16px'}}>Eng</td>
                    <td style={{padding: '10px 16px', color: '#0D8626'}}>Active</td>
                  </tr>
                </tbody>
              </table>
            </XDSVStack>

            {/* Side panel */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Side Panel</span>
              <div style={{border: '1px solid light-dark(#ddd, #444)', borderRadius: 0, padding: 8, width: 160, display: 'flex', flexDirection: 'column', gap: 2}}>
                <div style={{padding: '8px 12px', fontSize: 14, color: 'light-dark(#0064E0, #2694FE)', backgroundColor: 'light-dark(rgba(0,100,224,0.06), rgba(38,148,254,0.1))', borderRadius: 0}}>Dashboard</div>
                <div style={{padding: '8px 12px', fontSize: 14, color: 'light-dark(#666, #aaa)'}}>Analytics</div>
                <div style={{padding: '8px 12px', fontSize: 14, color: 'light-dark(#666, #aaa)'}}>Settings</div>
              </div>
            </XDSVStack>

            {/* Shared edges (button group) */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Shared Edges (Button Group)</span>
              <div style={{display: 'flex'}}>
                <button style={{padding: '8px 20px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', backgroundColor: 'light-dark(#0064E0, #2694FE)', color: '#fff', borderRadius: `${r2}px 0 0 ${r2}px`, transition: 'border-radius 0.2s'}}>Day</button>
                <button style={{padding: '8px 20px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: '1px solid light-dark(#ddd, #444)', borderLeft: 'none', backgroundColor: 'light-dark(#f0f0f0, #333)', color: 'light-dark(#333, #eee)', borderRadius: 0}}>Week</button>
                <button style={{padding: '8px 20px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: '1px solid light-dark(#ddd, #444)', borderLeft: 'none', backgroundColor: 'light-dark(#f0f0f0, #333)', color: 'light-dark(#333, #eee)', borderRadius: `0 ${r2}px ${r2}px 0`, transition: 'border-radius 0.2s'}}>Month</button>
              </div>
            </XDSVStack>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* radius-content */}
        <XDSVStack gap={4}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>radius-1</span>
            <span style={{fontSize: 13, color: 'light-dark(#666, #aaa)', fontStyle: 'italic'}}>4dp &times; multiplier</span>
          </div>
          <div style={{display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start'}}>
            {/* Code block */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Code Block</span>
              <div style={{
                backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
                border: '1px solid light-dark(#ddd, #444)',
                borderRadius: tokens['radius-1'],
                padding: '16px 20px',
                fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                fontSize: 14,
                color: 'light-dark(#333, #eee)',
                lineHeight: 1.8,
                width: 420,
                transition: 'border-radius 0.2s',
              }}>
                <span style={{color: '#5B08D8'}}>const</span> radius = <span style={{color: '#0064E0'}}>max</span>(<span style={{color: '#E9AF08'}}>0</span>, outer - padding);<br />
                <span style={{color: '#5B08D8'}}>const</span> theme = <span style={{color: '#0D8626'}}>&apos;default&apos;</span>;
              </div>
            </XDSVStack>

            {/* Thumbnails */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Thumbnails</span>
              <div style={{display: 'flex', gap: 12}}>
                <div style={{width: 64, height: 64, borderRadius: tokens['radius-1'], background: 'linear-gradient(135deg, #E9AF08, #E3193B)', transition: 'border-radius 0.2s'}} />
                <div style={{width: 64, height: 64, borderRadius: tokens['radius-1'], background: 'linear-gradient(135deg, #0064E0, #0D8626)', transition: 'border-radius 0.2s'}} />
                <div style={{width: 64, height: 64, borderRadius: tokens['radius-1'], background: 'linear-gradient(135deg, #5B08D8, #E3193B)', transition: 'border-radius 0.2s'}} />
                <div style={{width: 64, height: 64, borderRadius: tokens['radius-1'], background: 'linear-gradient(135deg, #0D8626, #0064E0)', transition: 'border-radius 0.2s'}} />
              </div>
            </XDSVStack>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* radius-element */}
        <XDSVStack gap={4}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>radius-2</span>
            <span style={{fontSize: 13, color: 'light-dark(#666, #aaa)', fontStyle: 'italic'}}>8dp &times; multiplier</span>
          </div>
          <div style={{display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start'}}>
            {/* Buttons */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Buttons</span>
              <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                <button style={{padding: '10px 24px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', backgroundColor: 'light-dark(#0064E0, #2694FE)', color: '#fff', borderRadius: tokens['radius-2'], transition: 'border-radius 0.2s'}}>Primary</button>
                <button style={{padding: '10px 24px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: '1px solid light-dark(#ddd, #444)', backgroundColor: 'light-dark(#fff, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-2'], transition: 'border-radius 0.2s'}}>Secondary</button>
                <button style={{padding: '10px 24px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-2'], transition: 'border-radius 0.2s'}}>Flat</button>
              </div>
            </XDSVStack>

            {/* Input */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Input</span>
              <input
                placeholder="Enter text..."
                style={{padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', border: '1px solid light-dark(#ddd, #444)', backgroundColor: 'light-dark(#fff, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-2'], outline: 'none', width: 220, transition: 'border-radius 0.2s'}}
              />
            </XDSVStack>

            {/* Text area */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Text Area</span>
              <textarea
                placeholder="Write something..."
                style={{padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', border: '1px solid light-dark(#ddd, #444)', backgroundColor: 'light-dark(#fff, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-2'], outline: 'none', width: 260, height: 80, resize: 'vertical', transition: 'border-radius 0.2s'}}
              />
            </XDSVStack>
          </div>

          {/* Tokens - second row */}
          <XDSVStack gap={2}>
            <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Tokens</span>
            <div style={{display: 'flex', gap: 8}}>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', fontSize: 14, fontWeight: 500, backgroundColor: 'light-dark(#f0f0f0, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-2'], transition: 'border-radius 0.2s'}}>Design <span style={{opacity: 0.4, cursor: 'pointer'}}>&times;</span></span>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', fontSize: 14, fontWeight: 500, backgroundColor: 'light-dark(#f0f0f0, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-2'], transition: 'border-radius 0.2s'}}>System <span style={{opacity: 0.4, cursor: 'pointer'}}>&times;</span></span>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', fontSize: 14, fontWeight: 500, backgroundColor: 'light-dark(#f0f0f0, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-2'], transition: 'border-radius 0.2s'}}>Radius <span style={{opacity: 0.4, cursor: 'pointer'}}>&times;</span></span>
            </div>
          </XDSVStack>
        </XDSVStack>

        <XDSDivider />

        {/* radius-container */}
        <XDSVStack gap={4}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>radius-3</span>
            <span style={{fontSize: 13, color: 'light-dark(#666, #aaa)', fontStyle: 'italic'}}>12dp &times; multiplier</span>
          </div>
          <div style={{display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start'}}>
            {/* Card */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Card</span>
              <div style={{border: '1px solid light-dark(#ddd, #444)', borderRadius: tokens['radius-3'], overflow: 'hidden', width: 280, backgroundColor: 'light-dark(#fff, #1a1a1a)', transition: 'border-radius 0.2s'}}>
                <div style={{width: '100%', height: 140, background: 'linear-gradient(135deg, #0064E0, #5B08D8)'}} />
                <div style={{padding: 16}}>
                  <div style={{fontWeight: 600, fontSize: 16, marginBottom: 4, color: 'light-dark(#333, #eee)'}}>Card title</div>
                  <div style={{fontSize: 14, color: 'light-dark(#666, #aaa)'}}>Grouped content.</div>
                </div>
              </div>
            </XDSVStack>

            {/* Modal */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Modal</span>
              <div style={{border: '1px solid light-dark(#ddd, #444)', borderRadius: tokens['radius-3'], width: 320, overflow: 'hidden', backgroundColor: 'light-dark(#fff, #1a1a1a)', transition: 'border-radius 0.2s'}}>
                <div style={{padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: 18, fontWeight: 600, color: 'light-dark(#333, #eee)'}}>Confirm action</span>
                  <span style={{fontSize: 20, color: 'light-dark(#999, #666)', cursor: 'pointer'}}>&times;</span>
                </div>
                <div style={{padding: '0 24px 20px', fontSize: 15, color: 'light-dark(#666, #aaa)', lineHeight: 1.5}}>Are you sure? This cannot be undone.</div>
                <div style={{padding: '16px 24px', borderTop: '1px solid light-dark(#eee, #333)', display: 'flex', justifyContent: 'flex-end', gap: 10}}>
                  <button style={{padding: '10px 24px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: '1px solid light-dark(#ddd, #444)', backgroundColor: 'light-dark(#fff, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-2'], transition: 'border-radius 0.2s'}}>Cancel</button>
                  <button style={{padding: '10px 24px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', backgroundColor: 'light-dark(#0064E0, #2694FE)', color: '#fff', borderRadius: tokens['radius-2'], transition: 'border-radius 0.2s'}}>Confirm</button>
                </div>
              </div>
            </XDSVStack>

            {/* Dropdown */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Dropdown</span>
              <div style={{border: '1px solid light-dark(#ddd, #444)', borderRadius: tokens['radius-3'], padding: 6, width: 200, backgroundColor: 'light-dark(#fff, #1a1a1a)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transition: 'border-radius 0.2s'}}>
                <DropdownItem label="Dashboard" radius={Math.max(0, tokens['radius-3'] - 6)} active />
                <DropdownItem label="Settings" radius={Math.max(0, tokens['radius-3'] - 6)} />
                <DropdownItem label="Profile" radius={Math.max(0, tokens['radius-3'] - 6)} />
                <DropdownItem label="Log out" radius={Math.max(0, tokens['radius-3'] - 6)} />
              </div>
            </XDSVStack>
          </div>

          {/* Toasts - second row */}
          <XDSVStack gap={2}>
            <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Toasts</span>
            <XDSVStack gap={2}>
              <div style={{border: '1px solid light-dark(#ddd, #444)', borderRadius: tokens['radius-3'], padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, width: 320, backgroundColor: 'light-dark(#fff, #1a1a1a)', color: 'light-dark(#333, #eee)', transition: 'border-radius 0.2s'}}>
                <div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#0D8626', flexShrink: 0}} />
                Saved successfully
              </div>
              <div style={{border: '1px solid light-dark(#ddd, #444)', borderRadius: tokens['radius-3'], padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, width: 320, backgroundColor: 'light-dark(#fff, #1a1a1a)', color: 'light-dark(#333, #eee)', transition: 'border-radius 0.2s'}}>
                <div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#E3193B', flexShrink: 0}} />
                Something went wrong
              </div>
            </XDSVStack>
          </XDSVStack>
        </XDSVStack>

        <XDSDivider />

        {/* radius-4 */}
        <XDSVStack gap={4}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>radius-4</span>
            <span style={{fontSize: 13, color: 'light-dark(#666, #aaa)', fontStyle: 'italic'}}>16dp &times; multiplier</span>
          </div>
          <div style={{display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start'}}>
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Page Section</span>
              <div style={{width: 400, height: 200, overflow: 'hidden', border: '1px solid light-dark(#ddd, #444)', borderRadius: r4, backgroundColor: 'light-dark(#fff, #1a1a1a)', transition: 'border-radius 0.2s', padding: 24}}>
                <div style={{fontWeight: 600, fontSize: 18, color: 'light-dark(#333, #eee)', marginBottom: 8}}>Page section</div>
                <div style={{fontSize: 14, color: 'light-dark(#666, #aaa)', lineHeight: 1.6, marginBottom: 20}}>This is a large page-level container that uses radius-4 for its corners. It typically wraps entire content sections.</div>
                <div style={{display: 'flex', gap: 12}}>
                  <div style={{flex: 1, border: '1px solid light-dark(#eee, #333)', borderRadius: r3, padding: 16, backgroundColor: 'light-dark(#f9f9f9, #222)', transition: 'border-radius 0.2s'}}>
                    <div style={{fontWeight: 600, fontSize: 14, color: 'light-dark(#333, #eee)', marginBottom: 4}}>Widget title</div>
                    <div style={{fontSize: 13, color: 'light-dark(#888, #777)'}}>Content</div>
                  </div>
                  <div style={{flex: 1, border: '1px solid light-dark(#eee, #333)', borderRadius: r3, padding: 16, backgroundColor: 'light-dark(#f9f9f9, #222)', transition: 'border-radius 0.2s'}}>
                    <div style={{fontWeight: 600, fontSize: 14, color: 'light-dark(#333, #eee)', marginBottom: 4}}>Widget title</div>
                    <div style={{fontSize: 13, color: 'light-dark(#888, #777)'}}>Content</div>
                  </div>
                </div>
              </div>
            </XDSVStack>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* radius-rounded */}
        <XDSVStack gap={4}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>radius-rounded</span>
            <span style={{fontSize: 13, color: 'light-dark(#666, #aaa)', fontStyle: 'italic'}}>9999px</span>
            <span style={{fontSize: 13, color: 'light-dark(#888, #777)', marginLeft: 'auto', fontStyle: 'italic'}}>Always pill &middot; ignores multiplier</span>
          </div>
          <div style={{display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start'}}>
            {/* Badges */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Badges</span>
              <div style={{display: 'flex', gap: 8}}>
                <span style={{display: 'inline-flex', padding: '4px 12px', fontSize: 13, fontWeight: 600, borderRadius: 9999, backgroundColor: 'light-dark(rgba(0,100,224,0.1), rgba(38,148,254,0.15))', color: 'light-dark(#0064E0, #4BA9FE)'}}>New</span>
                <span style={{display: 'inline-flex', padding: '4px 12px', fontSize: 13, fontWeight: 600, borderRadius: 9999, backgroundColor: 'light-dark(rgba(13,134,38,0.1), rgba(13,134,38,0.15))', color: 'light-dark(#0D8626, #26A756)'}}>Active</span>
                <span style={{display: 'inline-flex', padding: '4px 12px', fontSize: 13, fontWeight: 600, borderRadius: 9999, backgroundColor: 'light-dark(rgba(227,25,59,0.1), rgba(227,25,59,0.15))', color: 'light-dark(#E3193B, #F5394F)'}}>Error</span>
                <span style={{display: 'inline-flex', padding: '4px 12px', fontSize: 13, fontWeight: 600, borderRadius: 9999, backgroundColor: 'light-dark(rgba(233,175,8,0.1), rgba(233,175,8,0.15))', color: 'light-dark(#B8860B, #E9AF08)'}}>Pending</span>
              </div>
            </XDSVStack>

            {/* Avatars */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Avatars</span>
              <div style={{display: 'flex', gap: 8}}>
                <div style={{width: 48, height: 48, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #5B08D8, #E3193B)'}}>JD</div>
                <div style={{width: 48, height: 48, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #0064E0, #0D8626)'}}>AB</div>
                <div style={{width: 48, height: 48, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #E9AF08, #E3193B)'}}>KL</div>
              </div>
            </XDSVStack>

            {/* Status dots */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Status Dots</span>
              <XDSVStack gap={2}>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: 'light-dark(#333, #eee)'}}><div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#0D8626'}} />Online</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: 'light-dark(#333, #eee)'}}><div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#E9AF08'}} />Away</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: 'light-dark(#333, #eee)'}}><div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#E3193B'}} />Busy</div>
              </XDSVStack>
            </XDSVStack>

            {/* Toggles */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Toggles</span>
              <XDSVStack gap={3}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'light-dark(#333, #eee)'}}>
                  <div style={{width: 52, height: 30, borderRadius: 9999, backgroundColor: 'light-dark(#0064E0, #2694FE)', padding: 4, cursor: 'pointer'}}>
                    <div style={{width: 22, height: 22, borderRadius: 9999, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transform: 'translateX(22px)'}} />
                  </div>
                  Notifications
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'light-dark(#333, #eee)'}}>
                  <div style={{width: 52, height: 30, borderRadius: 9999, backgroundColor: 'light-dark(rgba(0,0,0,0.12), rgba(255,255,255,0.12))', padding: 4, cursor: 'pointer'}}>
                    <div style={{width: 22, height: 22, borderRadius: 9999, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'}} />
                  </div>
                  Dark mode
                </div>
              </XDSVStack>
            </XDSVStack>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* Concentric Radius */}
        <XDSVStack gap={4}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>Concentric Radius</span>
            <span style={{fontSize: 13, color: 'light-dark(#666, #aaa)', fontFamily: 'SF Mono, Monaco, Consolas, monospace'}}>max(0, outerRadius &minus; padding)</span>
          </div>
          <XDSText type="body" color="secondary">
            Inner radius = outer minus padding. Nested elements get concentric corners.
          </XDSText>
          <div style={{display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start'}}>
            {/* Nested elements */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Nested Elements</span>
              <div style={{display: 'flex', gap: 24}}>
                {/* Inset media - 10px pad */}
                <div style={{border: '1px solid light-dark(#ddd, #444)', borderRadius: r3, padding: 10, width: 220, display: 'flex', flexDirection: 'column', backgroundColor: 'light-dark(#fff, #1a1a1a)', transition: 'border-radius 0.2s'}}>
                  <div style={{width: '100%', height: 120, background: 'linear-gradient(135deg, #0064E0, #5B08D8)', borderRadius: Math.max(0, r3 - 10), marginBottom: 12, transition: 'border-radius 0.2s'}} />
                  <div style={{fontWeight: 600, fontSize: 15, marginBottom: 4, color: 'light-dark(#333, #eee)'}}>Inset media</div>
                  <div style={{fontSize: 13, fontFamily: 'SF Mono, Monaco, Consolas, monospace', color: 'light-dark(#888, #777)', lineHeight: 1.6, marginBottom: 12}}>
                    card: {r3}px, pad: 10px<br />&rarr; inner: {Math.max(0, +(r3 - 10).toFixed(1))}px
                  </div>
                  <button style={{width: '100%', padding: '10px 14px', backgroundColor: 'light-dark(#0064E0, #2694FE)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', borderRadius: Math.max(0, r3 - 10), transition: 'border-radius 0.2s'}}>Action</button>
                  <div style={{fontSize: 13, fontFamily: 'SF Mono, Monaco, Consolas, monospace', color: 'light-dark(#888, #777)', marginTop: 8}}>
                    btn: max(0, {r3} - 10) = {Math.max(0, +(r3 - 10).toFixed(1))}px
                  </div>
                </div>

                {/* Tighter pad - 8px */}
                <div style={{border: '1px solid light-dark(#ddd, #444)', borderRadius: r3, padding: 8, width: 220, display: 'flex', flexDirection: 'column', backgroundColor: 'light-dark(#fff, #1a1a1a)', transition: 'border-radius 0.2s'}}>
                  <div style={{width: '100%', height: 120, background: 'linear-gradient(135deg, #0064E0, #5B08D8)', borderRadius: Math.max(0, r3 - 8), marginBottom: 12, transition: 'border-radius 0.2s'}} />
                  <div style={{fontWeight: 600, fontSize: 15, marginBottom: 4, color: 'light-dark(#333, #eee)'}}>Tighter pad</div>
                  <div style={{fontSize: 13, fontFamily: 'SF Mono, Monaco, Consolas, monospace', color: 'light-dark(#888, #777)', lineHeight: 1.6, marginBottom: 12}}>
                    card: {r3}px, pad: 8px<br />&rarr; inner: {Math.max(0, +(r3 - 8).toFixed(1))}px
                  </div>
                  <button style={{width: '100%', padding: '10px 14px', backgroundColor: 'light-dark(#0064E0, #2694FE)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', borderRadius: Math.max(0, r3 - 8), transition: 'border-radius 0.2s'}}>Action</button>
                  <div style={{fontSize: 13, fontFamily: 'SF Mono, Monaco, Consolas, monospace', color: 'light-dark(#888, #777)', marginTop: 8}}>
                    btn: max(0, {r3} - 8) = {Math.max(0, +(r3 - 8).toFixed(1))}px
                  </div>
                </div>

                {/* Flush media - 0px pad, 4px inner padding for button */}
                <div style={{border: '1px solid light-dark(#ddd, #444)', borderRadius: r3, width: 220, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'light-dark(#fff, #1a1a1a)', transition: 'border-radius 0.2s'}}>
                  <div style={{width: '100%', height: 120, background: 'linear-gradient(135deg, #0064E0, #5B08D8)'}} />
                  <div style={{padding: '12px 10px 4px'}}>
                    <div style={{fontWeight: 600, fontSize: 15, marginBottom: 4, color: 'light-dark(#333, #eee)'}}>Flush media</div>
                    <div style={{fontSize: 13, fontFamily: 'SF Mono, Monaco, Consolas, monospace', color: 'light-dark(#888, #777)', lineHeight: 1.6, marginBottom: 12}}>
                      card: {r3}px, pad: 0<br />&rarr; inherits card
                    </div>
                  </div>
                  <div style={{padding: '0 4px 4px'}}>
                    <button style={{width: '100%', padding: '10px 14px', backgroundColor: 'light-dark(#0064E0, #2694FE)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', borderRadius: Math.max(0, r3 - 4), transition: 'border-radius 0.2s'}}>Action</button>
                  </div>
                  <div style={{fontSize: 13, fontFamily: 'SF Mono, Monaco, Consolas, monospace', color: 'light-dark(#888, #777)', padding: '4px 10px 10px'}}>
                    btn: max(0, {r3} - 4) = {Math.max(0, +(r3 - 4).toFixed(1))}px
                  </div>
                </div>
              </div>
            </XDSVStack>

            {/* Dropdown (4px pad) */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Dropdown (4px Pad)</span>
              <div style={{border: '1px solid light-dark(#ddd, #444)', borderRadius: r3, padding: 6, width: 200, backgroundColor: 'light-dark(#fff, #1a1a1a)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transition: 'border-radius 0.2s'}}>
                <DropdownItem label="Dashboard" radius={Math.max(0, r3 - 6)} active />
                <DropdownItem label="Settings" radius={Math.max(0, r3 - 6)} />
                <DropdownItem label="Profile" radius={Math.max(0, r3 - 6)} />
                <DropdownItem label="Log out" radius={Math.max(0, r3 - 6)} />
              </div>
              <div style={{fontSize: 13, fontFamily: 'SF Mono, Monaco, Consolas, monospace', color: 'light-dark(#888, #777)', marginTop: 4}}>
                menu: {r3}px, pad: 4px<br />&rarr; item: {Math.max(0, +(r3 - 4).toFixed(1))}px
              </div>
            </XDSVStack>
          </div>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
