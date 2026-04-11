import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSThumbnail} from '@xds/core/Thumbnail';
import {useImageMode} from '@xds/core/hooks';

const meta: Meta<typeof XDSThumbnail> = {
  title: 'Core/XDSThumbnail',
  component: XDSThumbnail,
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL',
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image',
    },
    label: {
      control: 'text',
      description: 'Label below the thumbnail',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the thumbnail is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSThumbnail>;

// Deterministic picsum images by ID
const DARK_IMAGE = 'https://picsum.photos/id/1042/200/200'; // dark interior
const LIGHT_IMAGE = 'https://picsum.photos/id/1043/200/200'; // bright snow/sky
const WARM_IMAGE = 'https://picsum.photos/id/1044/200/200'; // warm tones
const MIXED_IMAGE = 'https://picsum.photos/id/1047/200/200'; // mixed tones

export const Default: Story = {
  args: {
    src: LIGHT_IMAGE,
    alt: 'Sample image',
  },
};

export const WithLabel: Story = {
  args: {
    src: WARM_IMAGE,
    alt: 'Vacation photo',
    label: 'vacation.jpg',
  },
};

export const WithRemove: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);
    if (!visible) return <p style={{color: '#888', fontSize: 12}}>Removed. <button onClick={() => setVisible(true)}>Undo</button></p>;
    return (
      <XDSThumbnail
        src={LIGHT_IMAGE}
        alt="Removable thumbnail"
        label="photo.png"
        onRemove={() => setVisible(false)}
      />
    );
  },
};

export const WithCaption: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);
    if (!visible) return <p style={{color: '#888', fontSize: 12}}>Removed. <button onClick={() => setVisible(true)}>Undo</button></p>;
    return (
      <XDSThumbnail
        src={WARM_IMAGE}
        alt="Photo with metadata"
        label="screenshot.png"
        caption="2.4 MB"
        onRemove={() => setVisible(false)}
      />
    );
  },
};

export const Clickable: Story = {
  args: {
    src: MIXED_IMAGE,
    alt: 'Clickable thumbnail',
    onClick: () => alert('Clicked!'),
    label: 'preview.jpg',
  },
};

export const Loading: Story = {
  name: 'Loading (no preview)',
  args: {
    isLoading: true,
    label: 'uploading.jpg',
  },
};

export const Uploading: Story = {
  name: 'Uploading (with preview)',
  args: {
    src: WARM_IMAGE,
    alt: 'Uploading preview',
    isLoading: true,
    label: 'vacation.jpg',
  },
};

export const Placeholder: Story = {
  name: 'No Image (Placeholder)',
  render: () => {
    const [visible, setVisible] = useState(true);
    if (!visible) return <p style={{color: '#888', fontSize: 12}}>Removed. <button onClick={() => setVisible(true)}>Undo</button></p>;
    return (
      <XDSThumbnail
        label="report.pdf"
        caption="1.2 MB"
        onRemove={() => setVisible(false)}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    src: LIGHT_IMAGE,
    alt: 'Disabled thumbnail',
    label: 'locked.jpg',
    onRemove: () => {},
    isDisabled: true,
  },
};

export const MediaModeTest: Story = {
  name: 'Media Mode (dark vs light images)',
  render: function MediaModeStory() {
    const images = [
      {src: DARK_IMAGE, label: 'dark.jpg', alt: 'Dark image'},
      {src: LIGHT_IMAGE, label: 'light.jpg', alt: 'Light image'},
      {src: MIXED_IMAGE, label: 'mixed.jpg', alt: 'Mixed tones'},
      {src: WARM_IMAGE, label: 'warm.jpg', alt: 'Warm tones'},
    ];
    const [items, setItems] = useState(images);
    return (
      <div>
        <p style={{fontSize: 12, color: '#888', marginBottom: 8}}>
          Remove buttons should adapt: light icon on dark images, dark icon on light images.
        </p>
        <div style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}>
          {items.map(item => (
            <XDSThumbnail
              key={item.label}
              src={item.src}
              alt={item.alt}
              label={item.label}
              onRemove={() => setItems(prev => prev.filter(i => i.label !== item.label))}
            />
          ))}
          {items.length === 0 && (
            <p style={{color: '#888', fontSize: 12}}>
              All removed. <button onClick={() => setItems(images)}>Reset</button>
            </p>
          )}
        </div>
      </div>
    );
  },
};

export const Gallery: Story = {
  render: function GalleryStory() {
    const initial = [
      {id: 1, src: DARK_IMAGE, label: 'dark.jpg'},
      {id: 2, src: LIGHT_IMAGE, label: 'light.jpg'},
      {id: 3, src: undefined as string | undefined, label: 'notes.pdf', caption: '340 KB'},
      {id: 4, src: WARM_IMAGE, label: 'warm.jpg'},
    ];
    const [items, setItems] = useState(initial);
    return (
      <div style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}>
        {items.map(item => (
          <XDSThumbnail
            key={item.id}
            src={item.src}
            alt={item.label}
            label={item.label}
            caption={item.caption}
            onRemove={() => setItems(prev => prev.filter(i => i.id !== item.id))}
          />
        ))}
        {items.length === 0 && (
          <p style={{color: '#888', fontSize: 12}}>
            All removed. <button onClick={() => setItems(initial)}>Reset</button>
          </p>
        )}
      </div>
    );
  },
};

/**
 * Solid-color test images (1×1 PNGs) for evaluating useImageMode detection.
 * Each shows the color name, expected BT.709 gamma-luma, and the detected mode.
 *
 * Known issues with current BT.709 gamma-encoded approach:
 * - Pure red (luma 0.213) reads as "dark" — debatable perceptually
 * - Pure blue (luma 0.072) reads as very dark — correct
 * - Teal (luma 0.395) reads as "dark" — could go either way
 *
 * WCAG relative luminance (with sRGB linearization) would give
 * more perceptually accurate results.
 */

// =============================================================================
// Algorithm comparison — renders buttons with manually computed modes
// =============================================================================

import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSMediaTheme} from '@xds/core/theme';

const SOLID_COLORS: Array<{name: string; rgb: [number, number, number]; src: string}> = [
  {name: 'black', rgb: [0, 0, 0], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYGAAAAAEAAH2FzhVAAAAAElFTkSuQmCC'},
  {name: 'white', rgb: [255, 255, 255], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC'},
  {name: 'red', rgb: [255, 0, 0], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC'},
  {name: 'green', rgb: [0, 255, 0], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNg+M8AAAICAQB7CYF4AAAAAElFTkSuQmCC'},
  {name: 'blue', rgb: [0, 0, 255], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC'},
  {name: 'yellow', rgb: [255, 255, 0], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4/58BAAT/Af9dfQKHAAAAAElFTkSuQmCC'},
  {name: 'cyan', rgb: [0, 255, 255], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNg+P8fAAMBAf+2EqLVAAAAAElFTkSuQmCC'},
  {name: 'magenta', rgb: [255, 0, 255], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z/AfAAQAAf8iCjrwAAAAAElFTkSuQmCC'},
  {name: 'mid-gray', rgb: [128, 128, 128], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNoaGgAAAMEAYFL09IQAAAAAElFTkSuQmCC'},
  {name: 'dark-gray', rgb: [64, 64, 64], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNwcHAAAAGEAMGDX2mUAAAAAElFTkSuQmCC'},
  {name: 'light-gray', rgb: [192, 192, 192], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGM4cOAAAASEAkHhja8nAAAAAElFTkSuQmCC'},
  {name: 'orange', rgb: [255, 165, 0], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4v5QBAARLAaU/Dnq2AAAAAElFTkSuQmCC'},
  {name: 'navy', rgb: [0, 0, 128], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYGgAAACEAIHJde6SAAAAAElFTkSuQmCC'},
  {name: 'forest', rgb: [0, 100, 0], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgSGEAAADMAGWvkCi7AAAAAElFTkSuQmCC'},
  {name: 'maroon', rgb: [128, 0, 0], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNoYGAAAAGEAIH5/mWIAAAAAElFTkSuQmCC'},
  {name: 'teal', rgb: [0, 128, 128], src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGgAAAGEAQFWjyAjAAAAAElFTkSuQmCC'},
];

/** BT.709 luma on gamma-encoded sRGB (what useImageMode currently uses) */
function gammaLuma(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** WCAG 2: Relative luminance with sRGB linearization */
function wcagLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * APCA perceptual lightness.
 * Linearize sRGB, compute Y with APCA coefficients, apply perceptual curve.
 */
function apcaLightness(r: number, g: number, b: number): number {
  const lin = (c: number) => Math.pow(c / 255, 2.4);
  const y = 0.2126729 * lin(r) + 0.7151522 * lin(g) + 0.0721750 * lin(b);
  return Math.pow(y, 0.56);
}

type AlgoId = 'gamma' | 'wcag' | 'apca';

const ALGORITHMS: Array<{id: AlgoId; label: string; fn: (r: number, g: number, b: number) => number; threshold: number; description: string}> = [
  {id: 'gamma', label: 'BT.709 Gamma', fn: gammaLuma, threshold: 0.5, description: 'Current useImageMode. Luma on gamma-encoded sRGB.'},
  {id: 'wcag', label: 'WCAG 2', fn: wcagLuminance, threshold: 0.18, description: 'Linearize sRGB first, then BT.709 coefficients. Threshold 0.18 ≈ perceptual mid.'},
  {id: 'apca', label: 'APCA', fn: apcaLightness, threshold: 0.5, description: 'Linearize + perceptual power curve (Y^0.56). Best mid-tone discrimination.'},
];

/** A single swatch: solid color background with a button rendered via XDSMediaTheme */

/** Solid-color swatch: manually rendered with XDSMediaTheme */
function Swatch({color, mode, value}: {color: typeof SOLID_COLORS[0]; mode: 'dark' | 'light'; value: number}) {
  return (
    <div style={{textAlign: 'center', width: 72}}>
      <div style={{
        position: 'relative',
        width: 64,
        height: 64,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: `rgb(${color.rgb.join(',')})`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}>
        <div style={{position: 'absolute', top: 4, right: 4}}>
          <XDSMediaTheme mode={mode}>
            <XDSButton
              icon={<XDSIcon icon="close" size="xsm" />}
              label="Remove"
              variant="secondary"
              size="sm"
              isIconOnly
              xstyle={{height: 20, minWidth: 20, '--button-radius': '4px'} as any}
              onClick={() => {}}
            />
          </XDSMediaTheme>
        </div>
      </div>
      <div style={{fontSize: 10, color: '#666', marginTop: 4, fontWeight: 600}}>{color.name}</div>
      <div style={{fontSize: 9, color: mode === 'dark' ? '#c44' : '#48a'}}>
        {value.toFixed(3)} → {mode}
      </div>
    </div>
  );
}

/** Image swatch: uses useImageMode to detect, renders with XDSMediaTheme */
function ImageSwatch({src, label}: {src: string; label: string}) {
  const mode = useImageMode(src, {fallback: null});
  return (
    <div style={{textAlign: 'center', width: 72}}>
      <div style={{
        position: 'relative',
        width: 64,
        height: 64,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}>
        <img src={src} alt={label} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        <div style={{position: 'absolute', top: 4, right: 4}}>
          {mode != null ? (
            <XDSMediaTheme mode={mode}>
              <XDSButton
                icon={<XDSIcon icon="close" size="xsm" />}
                label="Remove"
                variant="secondary"
                size="sm"
                isIconOnly
                xstyle={{height: 20, minWidth: 20, '--button-radius': '4px'} as any}
                onClick={() => {}}
              />
            </XDSMediaTheme>
          ) : (
            <XDSButton
              icon={<XDSIcon icon="close" size="xsm" />}
              label="Remove"
              variant="secondary"
              size="sm"
              isIconOnly
              xstyle={{height: 20, minWidth: 20, '--button-radius': '4px'} as any}
              onClick={() => {}}
            />
          )}
        </div>
      </div>
      <div style={{fontSize: 10, color: '#666', marginTop: 4}}>{label}</div>
      <div style={{fontSize: 9, color: mode === 'dark' ? '#c44' : mode === 'light' ? '#48a' : '#999'}}>
        {mode ?? 'detecting…'}
      </div>
    </div>
  );
}

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

export const AlgorithmComparison: Story = {
  name: 'Algorithm Comparison',
  render: function AlgoCompare() {
    const [algo, setAlgo] = useState<AlgoId>('gamma');
    const current = ALGORITHMS.find(a => a.id === algo)!;
    return (
      <div>
        <div style={{marginBottom: 16}}>
          <p style={{fontSize: 13, color: '#555', margin: '0 0 8px'}}>
            <strong>Solid colors</strong> — button mode computed per algorithm. Switch to see differences.
          </p>
          <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
            {ALGORITHMS.map(a => (
              <button
                key={a.id}
                onClick={() => setAlgo(a.id)}
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  background: algo === a.id ? '#0064E0' : '#fff',
                  color: algo === a.id ? '#fff' : '#333',
                  cursor: 'pointer',
                }}>
                {a.label}
              </button>
            ))}
          </div>
          <p style={{fontSize: 11, color: '#888', margin: 0}}>{current.description}</p>
        </div>

        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32}}>
          {SOLID_COLORS.map(c => {
            const value = current.fn(...c.rgb);
            const mode = value > current.threshold ? 'light' : 'dark';
            return <Swatch key={c.name} color={c} mode={mode} value={value} />;
          })}
        </div>

        <div style={{marginBottom: 16}}>
          <p style={{fontSize: 13, color: '#555', margin: '0 0 8px'}}>
            <strong>Real images</strong> — useImageMode detects mode live (BT.709 Gamma, threshold 0.5).
          </p>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16}}>
          {IMAGE_SWATCHES.map(img => (
            <ImageSwatch key={img.label} src={img.src} label={img.label} />
          ))}
        </div>

        <div style={{marginTop: 16, fontSize: 11, color: '#888', maxWidth: 600}}>
          <strong>Watch for:</strong> red, blue, teal, forest, maroon — these diverge most between algorithms.
          <br />
          <span style={{color: '#c44'}}>● dark</span>{' '}
          <span style={{color: '#48a'}}>● light</span>
        </div>
      </div>
    );
  },
};
