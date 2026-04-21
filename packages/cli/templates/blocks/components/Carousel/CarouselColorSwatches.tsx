'use client';

import {XDSCarousel} from '@xds/core/Carousel';

const COLORS = [
  '#e74c3c',
  '#e67e22',
  '#f1c40f',
  '#2ecc71',
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#e84393',
  '#00cec9',
  '#6c5ce7',
  '#fdcb6e',
];

export default function CarouselColorSwatches() {
  return (
    <div style={{maxWidth: 360}}>
      <XDSCarousel gap={1.5} aria-label="Color swatches">
        {COLORS.map(color => (
          <div
            key={color}
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              backgroundColor: color,
              flexShrink: 0,
            }}
            title={color}
          />
        ))}
      </XDSCarousel>
    </div>
  );
}
