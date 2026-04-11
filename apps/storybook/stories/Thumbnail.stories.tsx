import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSThumbnail} from '@xds/core/Thumbnail';

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
// Solid-color diagnostic: compare luminance algorithms
// =============================================================================

// 1×1 solid-color PNGs for deterministic testing
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

/** Current: BT.709 luma on gamma-encoded sRGB (what useImageMode uses) */
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
 * APCA perceptual lightness (Y to Lc).
 * Simplified from apca-w3: linearize sRGB, compute Y, then apply
 * perceptual lightness curve. Returns 0–1 where 0.5 ≈ perceptual mid.
 *
 * Uses APCA's unique sRGB-to-Y coefficients (different from BT.709)
 * and a soft-clamp power curve for perceived lightness.
 */
function apcaLightness(r: number, g: number, b: number): number {
  // APCA uses a piecewise sRGB linearization with exponent 2.4
  const lin = (c: number) => Math.pow(c / 255, 2.4);
  // APCA coefficients for sRGB → Y (slightly different from BT.709)
  const y = 0.2126729 * lin(r) + 0.7151522 * lin(g) + 0.0721750 * lin(b);
  // Soft-clamp perceptual lightness: power curve ~0.56
  // This maps linear Y to a perceptual scale where 0.5 ≈ mid-gray
  const Lc = Math.pow(y, 0.56);
  return Lc;
}

type AlgoId = 'gamma' | 'wcag' | 'apca';

const ALGORITHMS: Array<{id: AlgoId; label: string; fn: (r: number, g: number, b: number) => number; threshold: number}> = [
  {id: 'gamma', label: 'BT.709 Gamma (current)', fn: gammaLuma, threshold: 0.5},
  {id: 'wcag', label: 'WCAG 2 Luminance', fn: wcagLuminance, threshold: 0.18},
  {id: 'apca', label: 'APCA Lightness', fn: apcaLightness, threshold: 0.5},
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
            Compare how different luminance algorithms classify each color.
            The button adapts based on the selected algorithm's threshold.
          </p>
          <div style={{display: 'flex', gap: 8}}>
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
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
          {SOLID_COLORS.map(c => {
            const value = current.fn(...c.rgb);
            const mode = value > current.threshold ? 'light' : 'dark';
            return (
              <div key={c.name} style={{textAlign: 'center', width: 72}}>
                <XDSThumbnail
                  src={c.src}
                  alt={c.name}
                  onRemove={() => {}}
                />
                <div style={{fontSize: 10, color: '#666', marginTop: 4, fontWeight: 600}}>{c.name}</div>
                <div style={{fontSize: 9, color: '#999'}}>
                  {value.toFixed(3)} → {mode}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 16, fontSize: 11, color: '#888', maxWidth: 600}}>
          <strong>Thresholds:</strong> BT.709 Gamma = 0.5 | WCAG 2 = 0.18 (relative luminance mid-point for 4.5:1 ratio) | APCA = 0.5
          <br /><br />
          <strong>Key differences:</strong>
          <ul style={{margin: '4px 0', paddingLeft: 16}}>
            <li>BT.709 Gamma overestimates brightness of saturated colors (uses gamma-encoded values)</li>
            <li>WCAG 2 linearizes first — saturated colors correctly read darker</li>
            <li>APCA applies a perceptual lightness curve on top of linearization — better mid-tone discrimination</li>
          </ul>
          <strong>Watch for:</strong> red, blue, teal, forest — these differ most between algorithms.
        </div>
      </div>
    );
  },
};
