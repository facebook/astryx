'use client';

import {XDSCarousel} from '@xds/core/Carousel';
import {XDSThumbnail} from '@xds/core/Thumbnail';

const IMAGES = [
  {id: 1, src: 'https://picsum.photos/id/1042/200/200', label: 'dark.jpg'},
  {id: 2, src: 'https://picsum.photos/id/1043/200/200', label: 'light.jpg'},
  {id: 3, src: 'https://picsum.photos/id/1044/200/200', label: 'warm.jpg'},
  {id: 4, src: 'https://picsum.photos/id/1047/200/200', label: 'mixed.jpg'},
  {id: 5, src: 'https://picsum.photos/id/1050/200/200', label: 'nature.jpg'},
  {id: 6, src: 'https://picsum.photos/id/1055/200/200', label: 'city.jpg'},
  {id: 7, src: 'https://picsum.photos/id/1060/200/200', label: 'ocean.jpg'},
  {id: 8, src: 'https://picsum.photos/id/1069/200/200', label: 'forest.jpg'},
];

export default function CarouselScrollSnap() {
  return (
    <div style={{maxWidth: 400}}>
      <XDSCarousel gap={2} hasSnap aria-label="Snapping gallery">
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
