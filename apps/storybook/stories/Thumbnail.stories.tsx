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
  args: {
    src: 'https://picsum.photos/200',
    alt: 'Removable thumbnail',
    label: 'photo.png',
    onRemove: () => {},
  },
};

export const WithCaption: Story = {
  args: {
    src: 'https://picsum.photos/200',
    alt: 'Photo with metadata',
    label: 'screenshot.png',
    caption: '2.4 MB',
    onRemove: () => {},
  },
};

export const Clickable: Story = {
  args: {
    src: 'https://picsum.photos/200',
    alt: 'Clickable thumbnail',
    onClick: () => alert('Clicked!'),
    onRemove: () => {},
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
  args: {
    label: 'report.pdf',
    caption: '1.2 MB',
    onRemove: () => {},
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
  render: () => (
    <div style={{display: 'flex', gap: 8}}>
      <XDSThumbnail
        src="https://picsum.photos/200?random=1"
        alt="Photo 1"
        label="img_001.jpg"
        onRemove={() => {}}
      />
      <XDSThumbnail
        src="https://picsum.photos/200?random=2"
        alt="Photo 2"
        label="img_002.jpg"
        onRemove={() => {}}
      />
      <XDSThumbnail
        label="notes.pdf"
        caption="340 KB"
        onRemove={() => {}}
      />
      <XDSThumbnail
        src="https://picsum.photos/200?random=3"
        alt="Photo 3"
        label="img_003.jpg"
        onRemove={() => {}}
      />
    </div>
  ),
};
