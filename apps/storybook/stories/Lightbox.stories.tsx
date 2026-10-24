// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Lightbox, useLightbox} from '@astryxdesign/core/Lightbox';

const meta: Meta<typeof Lightbox> = {
  title: 'Core/Lightbox',
  component: Lightbox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Lightbox>;

const SAMPLE_IMAGE = 'https://picsum.photos/id/10/1200/800';
const GALLERY_MEDIA = [
  {
    src: 'https://picsum.photos/id/10/1200/800',
    alt: 'Forest path',
    caption: 'A winding path through the forest',
  },
  {src: 'https://picsum.photos/id/15/1200/800', alt: 'Mountain lake'},
  {
    src: 'https://picsum.photos/id/20/1200/800',
    alt: 'Beach sunset',
    caption: 'Golden hour at the beach',
  },
  {src: 'https://picsum.photos/id/25/1200/800', alt: 'City skyline'},
];

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open lightbox</button>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={{
            src: SAMPLE_IMAGE,
            alt: 'Forest path',
            caption: 'A winding path through the forest',
          }}
        />
      </>
    );
  },
};

export const Gallery: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [index, setIndex] = useState(0);
    return (
      <>
        <div style={{display: 'flex', gap: '8px'}}>
          {GALLERY_MEDIA.map((item, i) => (
            <img
              key={item.src}
              src={item.src}
              alt={item.alt}
              style={{
                width: 120,
                height: 80,
                objectFit: 'cover',
                cursor: 'pointer',
                borderRadius: 4,
              }}
              onClick={() => {
                setIndex(i);
                setIsOpen(true);
              }}
            />
          ))}
        </div>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={GALLERY_MEDIA}
          index={index}
          onIndexChange={setIndex}
        />
      </>
    );
  },
};

/**
 * The parent decides whether the viewer closes: here it asks first. When it
 * keeps the viewer open, a photo dragged down comes back.
 */
export const ConfirmClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open, confirm to close</button>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={next => {
            if (next || window.confirm('Close the photo?')) {
              setIsOpen(next);
            }
          }}
          media={{src: SAMPLE_IMAGE, alt: 'Forest path'}}
        />
      </>
    );
  },
};

export const WithZoom: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open with zoom</button>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={{src: SAMPLE_IMAGE, alt: 'Forest path'}}
          hasZoom
        />
      </>
    );
  },
};

/**
 * A gallery a phone can page through: drag or flick between photos (Photos'
 * 40 pt gap), pinch or double-tap one to zoom, and drag a zoomed photo to its
 * edge before the next drag pages.
 */
export const GalleryWithZoom: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [index, setIndex] = useState(0);
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open gallery with zoom</button>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={GALLERY_MEDIA}
          index={index}
          onIndexChange={setIndex}
          hasZoom
        />
      </>
    );
  },
};

/**
 * A controlled gallery whose parent keeps its index (it pages only with its
 * own buttons, say while a change is confirmed): a swipe returns to the
 * photo the parent shows.
 */
export const GalleryKeepsIndex: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <button onClick={() => setIsOpen(true)}>
          Open gallery that keeps its photo
        </button>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={GALLERY_MEDIA}
          index={0}
          onIndexChange={() => {}}
          hasZoom
        />
      </>
    );
  },
};

export const WithCaption: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open with caption</button>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={{
            src: SAMPLE_IMAGE,
            alt: 'Forest path',
            caption:
              'A beautiful forest path winding through tall trees on a misty morning',
          }}
        />
      </>
    );
  },
};

export const Video: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open video</button>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={{
            src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
            alt: 'Flower blooming',
            type: 'video',
            caption: 'A flower blooming in time-lapse',
          }}
        />
      </>
    );
  },
};

export const WithHook: Story = {
  render: () => {
    const lightbox = useLightbox({media: GALLERY_MEDIA});
    return (
      <>
        <div style={{display: 'flex', gap: '8px'}}>
          {GALLERY_MEDIA.map((item, i) => (
            <img
              key={item.src}
              src={item.src}
              alt={item.alt}
              style={{
                width: 120,
                height: 80,
                objectFit: 'cover',
                cursor: 'pointer',
                borderRadius: 4,
              }}
              {...lightbox.getTriggerProps(i)}
            />
          ))}
        </div>
        {lightbox.element}
      </>
    );
  },
};
