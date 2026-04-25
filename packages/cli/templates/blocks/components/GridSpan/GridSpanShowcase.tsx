'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';

export default function GridSpanShowcase() {
  return (
    <XDSGrid columns={3} gap={3}>
      <XDSGridSpan columns={2}>
        <XDSCard variant="muted" padding={4} height={80}>
          <XDSText type="body" color="secondary">
            Spans 2 columns
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
      <XDSCard variant="muted" padding={4} height={80}>
        <XDSText type="body" color="secondary">
          1 col
        </XDSText>
      </XDSCard>
      <XDSCard variant="muted" padding={4} height={60}>
        <XDSText type="body" color="secondary">
          1 col
        </XDSText>
      </XDSCard>
      <XDSGridSpan columns={2}>
        <XDSCard variant="muted" padding={4} height={60}>
          <XDSText type="body" color="secondary">
            Spans 2 columns
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
      <XDSGridSpan columns="full">
        <XDSCard variant="muted" padding={4} height={60}>
          <XDSText type="body" color="secondary">
            Full-width row
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
    </XDSGrid>
  );
}
