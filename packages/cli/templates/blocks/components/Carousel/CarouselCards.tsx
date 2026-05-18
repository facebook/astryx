// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCarousel} from '@xds/core/Carousel';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const FEATURES = [
  {
    title: 'Design System',
    desc: 'Tokens, components, and patterns',
  },
  {
    title: 'Documentation',
    desc: 'API reference and usage guides',
  },
  {
    title: 'Sandbox',
    desc: 'Visual testing and previews',
  },
  {
    title: 'Library',
    desc: 'Component and hook information',
  },
  {
    title: 'Contributing',
    desc: 'Open source development',
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
          <XDSCard key={item.title} width={200} minHeight={100}>
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
    </XDSStack>
  );
}
