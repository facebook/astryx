// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSThumbnail} from '@xds/core/Thumbnail';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const ATTACHMENTS = [
  {id: 1, src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-1.jpg', alt: 'River through a valley', label: 'valley.jpg'},
  {id: 2, src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-2.jpg', alt: 'Foggy mountain peak', label: 'mountain.jpg'},
  {id: 3, src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-3.jpg', alt: 'Golden retriever puppy', label: 'puppy.jpg'},
  {id: 4, src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-4.jpg', alt: 'Bridge at sunset', label: 'bridge.jpg'},
];

export default function ThumbnailGallery() {
  const [selected, setSelected] = useState<string | null>(null);
  const [items, setItems] = useState(ATTACHMENTS);

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="supporting" color="secondary">
        Click to preview, dismiss to remove
      </XDSText>
      <XDSStack direction="horizontal" gap={2} vAlign="center">
        {items.map(item => (
          <XDSThumbnail
            key={item.id}
            src={item.src}
            alt={item.alt}
            label={item.label}
            onClick={() => setSelected(item.label)}
            onRemove={() =>
              setItems(prev => prev.filter(i => i.id !== item.id))
            }
          />
        ))}
      </XDSStack>
      {selected != null && (
        <XDSText type="supporting" color="active">
          Previewing: {selected}
        </XDSText>
      )}
    </XDSStack>
  );
}
