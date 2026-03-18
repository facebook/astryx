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

        <XDSDivider />

        {/* radius-none */}
        <XDSVStack gap={4}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>radius-none</span>
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
              <XDSHStack gap={0}>
                <XDSButton label="Day" variant="primary" size="sm" />
                <XDSButton label="Week" variant="secondary" size="sm" />
                <XDSButton label="Month" variant="secondary" size="sm" />
              </XDSHStack>
            </XDSVStack>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* radius-content */}
        <XDSVStack gap={4}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>radius-content</span>
            <span style={{fontSize: 13, color: 'light-dark(#666, #aaa)', fontStyle: 'italic'}}>4dp &times; multiplier</span>
          </div>
          <div style={{display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start'}}>
            {/* Code block */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Code Block</span>
              <div style={{
                backgroundColor: 'light-dark(#f5f5f5, #2a2a2a)',
                border: '1px solid light-dark(#ddd, #444)',
                borderRadius: tokens['radius-content'],
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
                <div style={{width: 64, height: 64, borderRadius: tokens['radius-content'], background: 'linear-gradient(135deg, #E9AF08, #E3193B)', transition: 'border-radius 0.2s'}} />
                <div style={{width: 64, height: 64, borderRadius: tokens['radius-content'], background: 'linear-gradient(135deg, #0064E0, #0D8626)', transition: 'border-radius 0.2s'}} />
                <div style={{width: 64, height: 64, borderRadius: tokens['radius-content'], background: 'linear-gradient(135deg, #5B08D8, #E3193B)', transition: 'border-radius 0.2s'}} />
                <div style={{width: 64, height: 64, borderRadius: tokens['radius-content'], background: 'linear-gradient(135deg, #0D8626, #0064E0)', transition: 'border-radius 0.2s'}} />
              </div>
            </XDSVStack>
          </div>
        </XDSVStack>

        <XDSDivider />

        {/* radius-element */}
        <XDSVStack gap={4}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'light-dark(#0064E0, #2694FE)'}}>radius-element</span>
            <span style={{fontSize: 13, color: 'light-dark(#666, #aaa)', fontStyle: 'italic'}}>8dp &times; multiplier</span>
          </div>
          <div style={{display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start'}}>
            {/* Buttons */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Buttons</span>
              <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                <button style={{padding: '10px 24px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', backgroundColor: 'light-dark(#0064E0, #2694FE)', color: '#fff', borderRadius: tokens['radius-element'], transition: 'border-radius 0.2s'}}>Primary</button>
                <button style={{padding: '10px 24px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: '1px solid light-dark(#ddd, #444)', backgroundColor: 'light-dark(#fff, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-element'], transition: 'border-radius 0.2s'}}>Secondary</button>
                <button style={{padding: '10px 24px', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-element'], transition: 'border-radius 0.2s'}}>Flat</button>
              </div>
            </XDSVStack>

            {/* Input */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Input</span>
              <input
                placeholder="Enter text..."
                style={{padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', border: '1px solid light-dark(#ddd, #444)', backgroundColor: 'light-dark(#fff, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-element'], outline: 'none', width: 220, transition: 'border-radius 0.2s'}}
              />
            </XDSVStack>

            {/* Text area */}
            <XDSVStack gap={2}>
              <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Text Area</span>
              <textarea
                placeholder="Write something..."
                style={{padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', border: '1px solid light-dark(#ddd, #444)', backgroundColor: 'light-dark(#fff, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-element'], outline: 'none', width: 260, height: 80, resize: 'vertical', transition: 'border-radius 0.2s'}}
              />
            </XDSVStack>
          </div>

          {/* Tokens - second row */}
          <XDSVStack gap={2}>
            <span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'light-dark(#888, #777)'}}>Tokens</span>
            <div style={{display: 'flex', gap: 8}}>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', fontSize: 14, fontWeight: 500, backgroundColor: 'light-dark(#f0f0f0, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-element'], transition: 'border-radius 0.2s'}}>Design <span style={{opacity: 0.4, cursor: 'pointer'}}>&times;</span></span>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', fontSize: 14, fontWeight: 500, backgroundColor: 'light-dark(#f0f0f0, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-element'], transition: 'border-radius 0.2s'}}>System <span style={{opacity: 0.4, cursor: 'pointer'}}>&times;</span></span>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', fontSize: 14, fontWeight: 500, backgroundColor: 'light-dark(#f0f0f0, #333)', color: 'light-dark(#333, #eee)', borderRadius: tokens['radius-element'], transition: 'border-radius 0.2s'}}>Radius <span style={{opacity: 0.4, cursor: 'pointer'}}>&times;</span></span>
            </div>
          </XDSVStack>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
