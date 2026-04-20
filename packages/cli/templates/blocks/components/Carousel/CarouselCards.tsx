'use client';

import {XDSCarousel} from '@xds/core/Carousel';
import {XDSCard} from '@xds/core/Card';

const CARDS = [
  {id: 1, title: 'Design System', desc: 'Component library'},
  {id: 2, title: 'Documentation', desc: 'API reference'},
  {id: 3, title: 'Storybook', desc: 'Visual testing'},
  {id: 4, title: 'Theme Config', desc: 'Token overrides'},
  {id: 5, title: 'CLI Tools', desc: 'Code generation'},
  {id: 6, title: 'Accessibility', desc: 'ARIA patterns'},
];

export default function CarouselCards() {
  return (
    <div style={{maxWidth: 500}}>
      <XDSCarousel gap={2} hasSnap aria-label="Feature cards">
        {CARDS.map(card => (
          <XDSCard key={card.id} width={160}>
            <p style={{margin: 0, fontSize: 14, fontWeight: 600}}>
              {card.title}
            </p>
            <p style={{margin: '4px 0 0', fontSize: 12, color: '#666'}}>
              {card.desc}
            </p>
          </XDSCard>
        ))}
      </XDSCarousel>
    </div>
  );
}
