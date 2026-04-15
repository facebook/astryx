'use client';

import {XDSCarousel} from '@xds/core/Carousel';

export default function CarouselBasic() {
  return (
    <XDSCarousel gap={1}>
      <div style={{width: 200, height: 150, background: 'var(--color-accent-muted)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>A</div>
      <div style={{width: 200, height: 150, background: 'var(--color-accent-muted)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>B</div>
      <div style={{width: 200, height: 150, background: 'var(--color-accent-muted)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>C</div>
    </XDSCarousel>
  );
}
