'use client';

import {XDSCarousel} from '@xds/core/Carousel';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const TEAM = [
  {name: 'Alice Chen', role: 'Engineering Lead', color: 'blue' as const},
  {name: 'Bob Smith', role: 'Product Designer', color: 'purple' as const},
  {name: 'Carol Davis', role: 'Product Manager', color: 'green' as const},
];

export default function CarouselSnap() {
  return (
    <XDSStack direction="vertical" gap={3} style={{maxWidth: 520, padding: 8}}>
      <XDSText type="body" weight="bold">
        Team members
      </XDSText>
      <XDSCarousel gap={2} hasSnap hasButtons aria-label="Team members">
        {TEAM.map(person => (
          <XDSCard key={person.name} width={180} minHeight={140}>
            <XDSStack direction="vertical" gap={3} hAlign="center">
              <XDSAvatar name={person.name} size="medium" />
              <XDSStack direction="vertical" gap={1} hAlign="center">
                <XDSText type="body" weight="bold">
                  {person.name}
                </XDSText>
                <XDSBadge variant={person.color} label={person.role} />
              </XDSStack>
            </XDSStack>
          </XDSCard>
        ))}
      </XDSCarousel>
    </XDSStack>
  );
}
