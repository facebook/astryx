'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSGrid} from '@xds/core/Grid';

const images = [
  {id: 1, alt: 'Mountain landscape'},
  {id: 2, alt: 'Ocean sunset'},
  {id: 3, alt: 'Forest trail'},
  {id: 4, alt: 'City skyline'},
  {id: 5, alt: 'Desert dunes'},
  {id: 6, alt: 'Snowy peaks'},
];

export default function AspectRatioImageGallery() {
  return (
    <XDSGrid columns={3} gap={4}>
      {images.map(({id, alt}) => (
        <XDSAspectRatio key={id} ratio={4 / 3}>
          <img
            src={`https://picsum.photos/seed/${id}/400/300`}
            alt={alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 8,
            }}
          />
        </XDSAspectRatio>
      ))}
    </XDSGrid>
  );
}
