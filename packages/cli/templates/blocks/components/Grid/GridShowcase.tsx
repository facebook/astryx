'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSGrid} from '@xds/core/Grid';

export default function GridShowcase() {
  return (
    <XDSGrid columns={3} gap={2} width={400}>
      {Array.from({length: 12}, (_, i) => (
        <XDSCard key={i}>Item {i + 1}</XDSCard>
      ))}
    </XDSGrid>
  );
}
