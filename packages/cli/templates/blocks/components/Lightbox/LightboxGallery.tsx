// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useLightbox} from '@astryxdesign/core/Lightbox';

const PHOTOS = [
  {
    src: 'https://picsum.photos/id/10/1200/800',
    alt: 'Forest path',
    caption: 'A winding path through the forest',
  },
  {
    src: 'https://picsum.photos/id/15/1200/800',
    alt: 'Mountain lake',
    caption: 'Still waters of a mountain lake',
  },
  {
    src: 'https://picsum.photos/id/20/1200/800',
    alt: 'Beach at sunset',
    caption: 'Golden hour at the beach',
  },
  {
    src: 'https://picsum.photos/id/25/1200/800',
    alt: 'City skyline',
  },
];

export default function LightboxGallery() {
  const lightbox = useLightbox({media: PHOTOS});

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
          maxWidth: 480,
        }}>
        {PHOTOS.map((photo, i) => (
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            style={{
              width: '100%',
              aspectRatio: '3 / 2',
              objectFit: 'cover',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'block',
            }}
            {...lightbox.getTriggerProps(i)}
          />
        ))}
      </div>
      {lightbox.element}
    </>
  );
}
