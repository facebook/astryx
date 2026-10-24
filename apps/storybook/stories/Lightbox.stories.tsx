// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useEffect, useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Dialog} from '@astryxdesign/core/Dialog';
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

/**
 * Photos open from their thumbnails and close back into the one showing:
 * `sourceFor` hands the viewer each item's thumbnail, and the photo zooms
 * out of it (UIKit's zoom transition). Page to another photo and close, or
 * drag it down: it lands in its own thumbnail.
 */
export const ZoomFromThumbnails: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [index, setIndex] = useState(0);
    const thumbnails = useRef<(HTMLImageElement | null)[]>([]);
    return (
      <>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          {GALLERY_MEDIA.map((item, i) => (
            <button
              key={item.src}
              type="button"
              aria-label={`Open ${item.alt}`}
              style={{padding: 0, border: 0, background: 'none'}}
              onClick={() => {
                setIndex(i);
                setIsOpen(true);
              }}>
              <img
                ref={element => {
                  thumbnails.current[i] = element;
                }}
                src={item.src}
                alt=""
                style={{
                  display: 'block',
                  width: 96,
                  height: 96,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            </button>
          ))}
        </div>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={GALLERY_MEDIA}
          index={index}
          onIndexChange={setIndex}
          sourceFor={i => thumbnails.current[i] ?? null}
          hasZoom
        />
      </>
    );
  },
};

/**
 * A viewer the page renders only while it is open: closing it, by any path,
 * gives the thumbnail back.
 */
export const MountedWhileOpen: Story = {
  render: () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const thumbnails = useRef<(HTMLImageElement | null)[]>([]);
    return (
      <>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          {GALLERY_MEDIA.map((item, i) => (
            <button
              key={item.src}
              type="button"
              aria-label={`Open ${item.alt}`}
              style={{padding: 0, border: 0, background: 'none'}}
              onClick={() => setOpenIndex(i)}>
              <img
                ref={element => {
                  thumbnails.current[i] = element;
                }}
                src={item.src}
                alt=""
                style={{
                  display: 'block',
                  width: 96,
                  height: 96,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            </button>
          ))}
        </div>
        {openIndex != null && (
          <Lightbox
            isOpen
            onOpenChange={open => {
              if (!open) {
                setOpenIndex(null);
              }
            }}
            media={GALLERY_MEDIA}
            index={openIndex}
            onIndexChange={setOpenIndex}
            sourceFor={i => thumbnails.current[i] ?? null}
            hasZoom
          />
        )}
      </>
    );
  },
};

/**
 * A photo opened from a dialog: Escape closes the photo first, and while it
 * zooms back into its thumbnail the dialog stays.
 */
export const InsideADialog: Story = {
  render: () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const thumbnail = useRef<HTMLImageElement | null>(null);
    return (
      <>
        <button onClick={() => setIsDialogOpen(true)}>Open dialog</button>
        <Dialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div style={{padding: 16}}>
            <button
              type="button"
              aria-label="Open Forest path"
              style={{padding: 0, border: 0, background: 'none'}}
              onClick={() => setIsOpen(true)}>
              <img
                ref={thumbnail}
                src={SAMPLE_IMAGE}
                alt=""
                style={{
                  display: 'block',
                  width: 96,
                  height: 96,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            </button>
          </div>
        </Dialog>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={{src: SAMPLE_IMAGE, alt: 'Forest path'}}
          sourceFor={() => thumbnail.current}
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

/**
 * Photos and a video in one gallery: the video page has no zoom, and the
 * controls a photo's tap hid come back on it.
 */
export const GalleryWithVideo: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [index, setIndex] = useState(0);
    return (
      <>
        <button onClick={() => setIsOpen(true)}>
          Open gallery with a video
        </button>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={[
            GALLERY_MEDIA[0],
            {
              src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
              alt: 'Flower blooming',
              type: 'video',
            },
          ]}
          index={index}
          onIndexChange={setIndex}
          hasZoom
        />
      </>
    );
  },
};

/**
 * Media that arrive after the page mounts the viewer (loaded later): it
 * behaves as one given its media from the start.
 */
export const MediaArrivesLater: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [media, setMedia] = useState<typeof GALLERY_MEDIA>([]);
    useEffect(() => {
      const timer = setTimeout(() => setMedia(GALLERY_MEDIA), 300);
      return () => clearTimeout(timer);
    }, []);
    return (
      <>
        <button disabled={media.length === 0} onClick={() => setIsOpen(true)}>
          Open the loaded gallery
        </button>
        <Lightbox
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          media={media}
          hasZoom
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
