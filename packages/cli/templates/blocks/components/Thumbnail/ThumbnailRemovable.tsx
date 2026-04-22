'use client';

import {useState} from 'react';
import {XDSThumbnail} from '@xds/core/Thumbnail';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const IMAGES = [
  {id: 1, src: 'https://picsum.photos/id/1042/200/200', alt: 'Dark cityscape at night', label: 'dark-city.jpg'},
  {id: 2, src: 'https://picsum.photos/id/1043/200/200', alt: 'Bright snowy landscape', label: 'snow.jpg'},
  {id: 3, src: 'https://picsum.photos/id/1044/200/200', alt: 'Warm sunset over mountains', label: 'sunset.jpg'},
];

export default function ThumbnailRemovable() {
  const [items, setItems] = useState(IMAGES);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Remove button adapts contrast to image luminance
      </XDSText>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        {items.map(item => (
          <XDSThumbnail
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
          <XDSText type="supporting" color="secondary">
            All removed.
          </XDSText>
        )}
      </XDSStack>
    </XDSStack>
  );
}
