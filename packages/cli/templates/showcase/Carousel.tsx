'use client';

import {XDSCarousel} from '@xds/core/Carousel';
import {XDSThumbnail} from '@xds/core/Thumbnail';

const IMAGES = [
  {id: 1, src: 'https://picsum.photos/id/1042/200/200', label: 'dark.jpg'},
  {id: 2, src: 'https://picsum.photos/id/1043/200/200', label: 'light.jpg'},
  {id: 3, src: 'https://picsum.photos/id/1044/200/200', label: 'warm.jpg'},
  {id: 4, src: 'https://picsum.photos/id/1047/200/200', label: 'mixed.jpg'},
  {id: 5, src: 'https://picsum.photos/id/1050/200/200', label: 'nature.jpg'},
];

export default function CarouselShowcase() {
  return (
    <div style={{maxWidth: 400}}>
      <XDSCarousel gap={1} aria-label="Photo thumbnails">
        {IMAGES.map(img => (
          <XDSThumbnail
            key={img.id}
            src={img.src}
            alt={img.label}
            label={img.label}
          />
        ))}
      </XDSCarousel>
    </div>
  );
}
