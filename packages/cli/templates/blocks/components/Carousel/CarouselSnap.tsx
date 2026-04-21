'use client';

import {XDSCarousel} from '@xds/core/Carousel';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const TEAM = [
  {name: 'Alice Chen', role: 'Engineering', color: 'blue' as const},
  {name: 'Bob Smith', role: 'Design', color: 'purple' as const},
  {name: 'Carol Davis', role: 'Product', color: 'green' as const},
  {name: 'Dan Wilson', role: 'Marketing', color: 'orange' as const},
  {name: 'Eve Park', role: 'Research', color: 'teal' as const},
  {name: 'Frank Lee', role: 'Engineering', color: 'blue' as const},
  {name: 'Grace Kim', role: 'Design', color: 'purple' as const},
  {name: 'Hank Torres', role: 'Product', color: 'green' as const},
];

export default function CarouselSnap() {
  return (
    <XDSCarousel gap={2} hasSnap hasButtons aria-label="Team members">
      {TEAM.map(person => (
        <XDSCard key={person.name} width={160}>
          <XDSStack direction="vertical" gap={2}>
            <XDSText type="body" weight="bold">
              {person.name}
            </XDSText>
            <XDSBadge variant={person.color} label={person.role} />
          </XDSStack>
        </XDSCard>
      ))}
    </XDSCarousel>
  );
}
