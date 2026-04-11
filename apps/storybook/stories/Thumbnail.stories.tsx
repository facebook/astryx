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
const SOLID_COLORS = [
  {name: 'black', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYGAAAAAEAAH2FzhVAAAAAElFTkSuQmCC', luma: 0.000},
  {name: 'white', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC', luma: 1.000},
  {name: 'red', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC', luma: 0.213},
  {name: 'green', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNg+M8AAAICAQB7CYF4AAAAAElFTkSuQmCC', luma: 0.715},
  {name: 'blue', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC', luma: 0.072},
  {name: 'yellow', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4/58BAAT/Af9dfQKHAAAAAElFTkSuQmCC', luma: 0.928},
  {name: 'cyan', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNg+P8fAAMBAf+2EqLVAAAAAElFTkSuQmCC', luma: 0.787},
  {name: 'magenta', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z/AfAAQAAf8iCjrwAAAAAElFTkSuQmCC', luma: 0.285},
  {name: 'mid-gray', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNoaGgAAAMEAYFL09IQAAAAAElFTkSuQmCC', luma: 0.502},
  {name: 'dark-gray', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNwcHAAAAGEAMGDX2mUAAAAAElFTkSuQmCC', luma: 0.251},
  {name: 'light-gray', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGM4cOAAAASEAkHhja8nAAAAAElFTkSuQmCC', luma: 0.753},
  {name: 'orange', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4v5QBAARLAaU/Dnq2AAAAAElFTkSuQmCC', luma: 0.675},
  {name: 'navy', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYGgAAACEAIHJde6SAAAAAElFTkSuQmCC', luma: 0.036},
  {name: 'forest', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgSGEAAADMAGWvkCi7AAAAAElFTkSuQmCC', luma: 0.280},
  {name: 'maroon', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNoYGAAAAGEAIH5/mWIAAAAAElFTkSuQmCC', luma: 0.107},
  {name: 'teal', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgaGgAAAGEAQFWjyAjAAAAAElFTkSuQmCC', luma: 0.395},
];

export const SolidColorTest: Story = {
  name: 'Solid Color Media Test',
  render: () => (
    <div>
      <p style={{fontSize: 12, color: '#888', marginBottom: 12}}>
        Solid 1×1 PNGs testing useImageMode detection. Current algorithm: BT.709 luma on gamma-encoded sRGB, threshold 0.5.
        <br />Button should be light on dark backgrounds, dark on light backgrounds.
      </p>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
        {SOLID_COLORS.map(c => (
          <div key={c.name} style={{textAlign: 'center'}}>
            <XDSThumbnail
              src={c.src}
              alt={c.name}
              onRemove={() => {}}
            />
            <div style={{fontSize: 10, color: '#666', marginTop: 4}}>{c.name}</div>
            <div style={{fontSize: 9, color: '#999'}}>luma {c.luma.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};
