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

// Deterministic test images — no random seeds
const DARK_IMAGE = 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=200&h=200&fit=crop'; // dark night sky
const LIGHT_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop'; // light clouds
const MIXED_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&fit=crop'; // landscape, light sky / dark ground
const WARM_IMAGE = 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop'; // warm sunset

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
      {src: DARK_IMAGE, label: 'dark-sky.jpg', alt: 'Dark night sky'},
      {src: LIGHT_IMAGE, label: 'clouds.jpg', alt: 'Light clouds'},
      {src: MIXED_IMAGE, label: 'landscape.jpg', alt: 'Mixed landscape'},
      {src: WARM_IMAGE, label: 'sunset.jpg', alt: 'Warm sunset'},
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
      {id: 1, src: DARK_IMAGE, label: 'night.jpg'},
      {id: 2, src: LIGHT_IMAGE, label: 'clouds.jpg'},
      {id: 3, src: undefined as string | undefined, label: 'notes.pdf', caption: '340 KB'},
      {id: 4, src: WARM_IMAGE, label: 'sunset.jpg'},
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
