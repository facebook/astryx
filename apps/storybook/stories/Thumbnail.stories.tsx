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

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/200',
    alt: 'Sample image',
  },
};

export const WithLabel: Story = {
  args: {
    src: 'https://picsum.photos/200',
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
        src="https://picsum.photos/200"
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
        src="https://picsum.photos/200"
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
    src: 'https://picsum.photos/200',
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
    src: 'https://picsum.photos/200',
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
    src: 'https://picsum.photos/200',
    alt: 'Disabled thumbnail',
    label: 'locked.jpg',
    onRemove: () => {},
    isDisabled: true,
  },
};

export const Gallery: Story = {
  render: function GalleryStory() {
    const initial = [
      {id: 1, src: 'https://picsum.photos/200?random=1', label: 'img_001.jpg'},
      {id: 2, src: 'https://picsum.photos/200?random=2', label: 'img_002.jpg'},
      {id: 3, src: undefined as string | undefined, label: 'notes.pdf', caption: '340 KB'},
      {id: 4, src: 'https://picsum.photos/200?random=3', label: 'img_003.jpg'},
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
