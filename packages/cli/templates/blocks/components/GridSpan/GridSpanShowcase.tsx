'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';

export default function GridSpanShowcase() {
  return (
    <XDSGrid columns={4} gap={3} width={400}>
      <XDSGridSpan columns={3}>
        <XDSCard height={80}>
          <XDSText type="body" color="secondary">
            Spans 3 columns
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
      <XDSCard height={80}>
        <XDSText type="body" color="secondary">
          1 col
        </XDSText>
      </XDSCard>
      <XDSGridSpan rows={2}>
        <XDSCard>
          <XDSText type="body" color="secondary">
            1 col
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
      <XDSGridSpan columns={3}>
        <XDSCard height={80}>
          <XDSText type="body" color="secondary">
            Full-width row
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
      <XDSCard height={80}>
        <XDSText type="body" color="secondary">
          1 col
        </XDSText>
      </XDSCard>
      <XDSGridSpan columns={2}>
        <XDSCard height={80}>
          <XDSText type="body" color="secondary">
            Spans 2 columns
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
    </XDSGrid>
  );
}
