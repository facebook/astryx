'use client';

import {XDSCarousel} from '@xds/core/Carousel';

export default function CarouselNoButtons() {
  return (
    <XDSCarousel hasButtons={false} aria-label="Photo gallery">
      <img src="https://placehold.co/300x200" alt="Photo 1" style={{borderRadius: 8}} />
      <img src="https://placehold.co/300x200" alt="Photo 2" style={{borderRadius: 8}} />
    </XDSCarousel>
  );
}
