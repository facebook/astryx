'use client';

import {XDSCarousel} from '@xds/core/Carousel';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const FEATURES = [
  {
    title: 'Design System',
    desc: 'Tokens, components, and patterns',
    count: 48,
    badge: 'blue' as const,
  },
  {
    title: 'Documentation',
    desc: 'API reference and usage guides',
    count: 124,
    badge: 'green' as const,
  },
  {
    title: 'Storybook',
    desc: 'Visual testing and previews',
    count: 86,
    badge: 'purple' as const,
  },
];

export default function CarouselCards() {
  return (
    <XDSStack direction="vertical" gap={3} style={{maxWidth: 520, padding: 8}}>
      <XDSText type="body" weight="bold">
        Browse features
      </XDSText>
      <XDSCarousel gap={2} hasSnap aria-label="Feature cards">
        {FEATURES.map(item => (
          <XDSCard key={item.title} width={200}>
            <XDSStack direction="vertical" gap={2}>
              <XDSStack direction="vertical" gap={1}>
                <XDSText type="body" weight="bold">
                  {item.title}
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  {item.desc}
                </XDSText>
              </XDSStack>
              <XDSBadge variant={item.badge} label={`${item.count} items`} />
            </XDSStack>
          </XDSCard>
        ))}
      </XDSCarousel>
    </XDSStack>
  );
}
