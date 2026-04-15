'use client';

import {XDSCarousel} from '@xds/core/Carousel';
import {XDSCard} from '@xds/core/Card';

export default function CarouselWithSnap() {
  return (
    <XDSCarousel gap={2} hasSnap>
      <XDSCard>Item 1</XDSCard>
      <XDSCard>Item 2</XDSCard>
      <XDSCard>Item 3</XDSCard>
      <XDSCard>Item 4</XDSCard>
    </XDSCarousel>
  );
}
