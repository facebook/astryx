// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Thumbnail} from '@xds/core/Thumbnail';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const IMAGES = [
  {id: 1, src: 'https://lookaside.facebook.com/assets/astryx/moody-scene-vertical-1.png', alt: 'Dark cityscape at night', label: 'dark-city.jpg'},
  {id: 2, src: 'https://lookaside.facebook.com/assets/astryx/moody-scene-vertical-2.png', alt: 'Bright snowy landscape', label: 'snow.jpg'},
  {id: 3, src: 'https://lookaside.facebook.com/assets/astryx/moody-home-vertical-1.png', alt: 'Warm sunset over mountains', label: 'sunset.jpg'},
];

export default function ThumbnailRemovable() {
  const [items, setItems] = useState(IMAGES);

  return (
    <Stack direction="vertical" gap={4}>
      <Text type="supporting" color="secondary">
        Remove button adapts contrast to image luminance
      </Text>
      <Stack direction="horizontal" gap={3} vAlign="center">
        {items.map(item => (
          <Thumbnail
            key={item.id}
            src={item.src}
            alt={item.alt}
            label={item.label}
            onRemove={() =>
              setItems(prev => prev.filter(i => i.id !== item.id))
            }
          />
        ))}
        {items.length === 0 && (
          <Text type="supporting" color="secondary">
            All removed.
          </Text>
        )}
      </Stack>
    </Stack>
  );
}
