// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useLightbox} from '@astryxdesign/core/Lightbox';
import {Grid} from '@astryxdesign/core/Grid';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';

const PHOTOS = [
  {
    src: 'https://lookaside.facebook.com/assets/astryx/Neutral-Backpack.png',
    alt: 'Backpack',
    caption: 'A backpack displayed on a neutral background.',
  },
  {
    src: 'https://lookaside.facebook.com/assets/astryx/building.png',
    alt: 'Modern building',
    caption: 'A modern building with a contemporary architectural design.',
  },
  {
    src: 'https://lookaside.facebook.com/assets/astryx/light-scene-horizontal-1.png',
    alt: 'Coastal shoreline with ocean waves',
    caption:
      'A scenic coastline with waves rolling onto a sandy beach beneath a clear sky.',
  },
  {
    src: 'https://lookaside.facebook.com/assets/astryx/illustrative-vertical-1.png',
    alt: 'Illustrated lakeside landscape at sunset',
    caption:
      'A stylized landscape illustration featuring pink clouds reflected over a calm lake at sunset.',
  },
];

export default function LightboxGallery() {
  const lightbox = useLightbox({media: PHOTOS});

  return (
    <>
      <Grid columns={2} gap={2} style={{width: 136}}>
        {PHOTOS.map((photo, i) => (
          <Thumbnail
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            label={photo.alt}
            onClick={() => lightbox.open(i)}
          />
        ))}
      </Grid>
      {lightbox.element}
    </>
  );
}
