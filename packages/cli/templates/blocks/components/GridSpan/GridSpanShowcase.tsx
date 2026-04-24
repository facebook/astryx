'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';

export default function GridSpanShowcase() {
  return (
    <XDSGrid columns={3} gap={3}>
      <XDSGridSpan columns={2}>
        <XDSCard padding={3}>Spans 2 columns</XDSCard>
      </XDSGridSpan>
      <XDSCard padding={3}>1 col</XDSCard>
      <XDSCard padding={3}>1 col</XDSCard>
      <XDSGridSpan columns="full">
        <XDSCard padding={3}>Full width row</XDSCard>
      </XDSGridSpan>
    </XDSGrid>
  );
}
