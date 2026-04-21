'use client';

import {XDSCarousel} from '@xds/core/Carousel';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const FEATURES = [
  {title: 'Design System', desc: 'Tokens, components, and patterns'},
  {title: 'Documentation', desc: 'API reference and guides'},
  {title: 'Storybook', desc: 'Visual testing and previews'},
  {title: 'Theme Config', desc: 'Token overrides and branding'},
  {title: 'CLI Tools', desc: 'Scaffolding and code generation'},
  {title: 'Accessibility', desc: 'ARIA patterns and audits'},
];

export default function CarouselCards() {
  return (
    <XDSCarousel gap={2} hasSnap aria-label="Feature cards">
      {FEATURES.map(item => (
        <XDSCard key={item.title} width={180}>
          <XDSStack direction="vertical" gap={1}>
            <XDSText type="body" weight="bold">
              {item.title}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {item.desc}
            </XDSText>
          </XDSStack>
        </XDSCard>
      ))}
    </XDSCarousel>
  );
}
