'use client';

import {useState} from 'react';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSMediaTheme} from '@xds/core/theme';
import {XDSDivider} from '@xds/core';
import {useImageModeTest, type Algorithm} from './useImageModeTest';

// =============================================================================
// Algorithm metadata
// =============================================================================

const ALGO_INFO: Record<Algorithm, {label: string; description: string}> = {
  gamma: {label: 'BT.709 Gamma', description: 'Luma on gamma-encoded sRGB, threshold 0.5. Fast but overestimates brightness of saturated colors.'},
  wcag: {label: 'WCAG 2', description: 'sRGB linearization + BT.709 coefficients, threshold 0.18. Standard web accessibility formula.'},
  apca: {label: 'APCA', description: 'sRGB linearization + perceptual power curve (Y^0.56), threshold 0.5. Best mid-tone discrimination. Targeting WCAG 3.'},
};

const ALGO_FN: Record<Algorithm, {fn: (r: number, g: number, b: number) => number; threshold: number}> = {
  gamma: {
    fn: (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255,
    threshold: 0.5,
  },
  wcag: {
    fn: (r, g, b) => {
      const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    },
    threshold: 0.18,
  },
  apca: {
    fn: (r, g, b) => {
      const lin = (c: number) => Math.pow(c / 255, 2.4);
      return Math.pow(0.2126729 * lin(r) + 0.7151522 * lin(g) + 0.0721750 * lin(b), 0.56);
    },
    threshold: 0.5,
  },
};

// =============================================================================
// Test data
// =============================================================================

const SOLID_COLORS: Array<{name: string; rgb: [number, number, number]}> = [
  {name: 'black', rgb: [0, 0, 0]},
  {name: 'white', rgb: [255, 255, 255]},
  {name: 'red', rgb: [255, 0, 0]},
  {name: 'green', rgb: [0, 255, 0]},
  {name: 'blue', rgb: [0, 0, 255]},
  {name: 'yellow', rgb: [255, 255, 0]},
  {name: 'cyan', rgb: [0, 255, 255]},
  {name: 'magenta', rgb: [255, 0, 255]},
  {name: 'mid-gray', rgb: [128, 128, 128]},
  {name: 'dark-gray', rgb: [64, 64, 64]},
  {name: 'light-gray', rgb: [192, 192, 192]},
  {name: 'orange', rgb: [255, 165, 0]},
  {name: 'navy', rgb: [0, 0, 128]},
  {name: 'forest', rgb: [0, 100, 0]},
  {name: 'maroon', rgb: [128, 0, 0]},
  {name: 'teal', rgb: [0, 128, 128]},
];

const IMAGE_SWATCHES = [
  {label: 'forest', src: 'https://picsum.photos/id/10/200/200'},
  {label: 'laptop', src: 'https://picsum.photos/id/15/200/200'},
  {label: 'clouds', src: 'https://picsum.photos/id/28/200/200'},
  {label: 'water', src: 'https://picsum.photos/id/36/200/200'},
  {label: 'door', src: 'https://picsum.photos/id/96/200/200'},
  {label: 'bones', src: 'https://picsum.photos/id/106/200/200'},
  {label: 'road', src: 'https://picsum.photos/id/136/200/200'},
  {label: 'puppy', src: 'https://picsum.photos/id/237/200/200'},
];

const BUTTON_REGION = {x: 0.5, y: 0.06, width: 0.44, height: 0.44};

// =============================================================================
// Shared styles (inline to avoid stylex issues in sandbox)
// =============================================================================

const swatchBoxStyle: React.CSSProperties = {
  position: 'relative',
  width: 64,
  height: 64,
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
};

const buttonPosStyle: React.CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
};

const gridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
};

const swatchStyle: React.CSSProperties = {
  textAlign: 'center',
  width: 72,
};

// =============================================================================
// Swatch components
// =============================================================================

function RemoveButton() {
  return (
    <XDSButton
      icon={<XDSIcon icon="close" size="xsm" />}
      label="Remove"
      variant="secondary"
      size="sm"
      isIconOnly
      style={{height: 20, minWidth: 20}}
      onClick={() => {}}
    />
  );
}

function Swatch({color, mode, value}: {color: typeof SOLID_COLORS[0]; mode: 'dark' | 'light'; value: number}) {
  return (
    <div style={swatchStyle}>
      <XDSMediaTheme mode={mode}>
        <div style={{...swatchBoxStyle, backgroundColor: `rgb(${color.rgb.join(',')})`}}>
          <div style={buttonPosStyle}>
            <RemoveButton />
          </div>
        </div>
      </XDSMediaTheme>
      <div style={{fontSize: 10, color: '#666', marginTop: 4, fontWeight: 600}}>{color.name}</div>
      <div style={{fontSize: 9, color: mode === 'dark' ? '#c44' : '#48a'}}>
        {value.toFixed(3)} → {mode}
      </div>
    </div>
  );
}

function ImageSwatch({src, label, algorithm}: {src: string; label: string; algorithm: Algorithm}) {
  const {mode, value} = useImageModeTest(src, {region: BUTTON_REGION, algorithm});
  return (
    <div style={swatchStyle}>
      {mode != null ? (
        <XDSMediaTheme mode={mode}>
          <div style={swatchBoxStyle}>
            <img
              src={src}
              alt={label}
              style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
            />
            <div style={buttonPosStyle}>
              <RemoveButton />
            </div>
          </div>
        </XDSMediaTheme>
      ) : (
        <div style={swatchBoxStyle}>
          <img
            src={src}
            alt={label}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          />
          <div style={buttonPosStyle}>
            <RemoveButton />
          </div>
        </div>
      )}
      <div style={{fontSize: 10, color: '#666', marginTop: 4}}>{label}</div>
      <div style={{fontSize: 9, color: mode === 'dark' ? '#c44' : mode === 'light' ? '#48a' : '#999'}}>
        {value != null ? `${value.toFixed(3)} → ${mode}` : 'detecting…'}
      </div>
    </div>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function MediaModePage() {
  const [algo, setAlgo] = useState<Algorithm>('apca');
  const info = ALGO_INFO[algo];
  const config = ALGO_FN[algo];

  return (
    <XDSVStack gap={6} style={{maxWidth: 800}}>
      <div>
        <XDSHeading level={2}>Media Mode Comparison</XDSHeading>
        <XDSText type="body" color="secondary">
          Compare luminance algorithms for detecting dark vs light surfaces.
          Used by useImageMode + XDSMediaTheme to adapt overlaid controls.
        </XDSText>
      </div>

      <XDSHStack gap={2}>
        {(Object.keys(ALGO_INFO) as Algorithm[]).map(id => (
          <XDSButton
            key={id}
            label={ALGO_INFO[id].label}
            variant={algo === id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setAlgo(id)}
          />
        ))}
      </XDSHStack>

      <div style={{fontSize: 12, color: '#888'}}>{info.description}</div>

      <XDSDivider />

      <XDSHeading level={4}>Solid Colors</XDSHeading>

      <div style={gridStyle}>
        {SOLID_COLORS.map(c => {
          const value = config.fn(...c.rgb);
          const mode: 'dark' | 'light' = value > config.threshold ? 'light' : 'dark';
          return <Swatch key={c.name} color={c} mode={mode} value={value} />;
        })}
      </div>

      <XDSDivider />

      <XDSHeading level={4}>Real Images</XDSHeading>
      <div style={{fontSize: 12, color: '#888'}}>
        Samples the upper-right corner where a remove button would sit.
        Switch algorithms above — images re-detect with the selected algorithm.
      </div>

      <div style={gridStyle}>
        {IMAGE_SWATCHES.map(img => (
          <ImageSwatch key={`${img.label}-${algo}`} src={img.src} label={img.label} algorithm={algo} />
        ))}
      </div>
    </XDSVStack>
  );
}
