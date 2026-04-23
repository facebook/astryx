'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';

export default function GridWithGridSpan() {
  return (
    <XDSGrid columns={4} gap={4}>
      <XDSGridSpan columns={2}>
        <XDSCard variant="cyan">
          <XDSVStack gap={1}>
            <XDSText type="label" display="block">
              Featured Release
            </XDSText>
            <XDSText type="supporting" display="block">
              XDS 4.0 is now available with new layout primitives
            </XDSText>
          </XDSVStack>
        </XDSCard>
      </XDSGridSpan>
      <XDSCard>
        <XDSText type="label" display="block">
          Components
        </XDSText>
        <XDSText type="supporting" display="block">
          54 available
        </XDSText>
      </XDSCard>
      <XDSCard>
        <XDSText type="label" display="block">
          Templates
        </XDSText>
        <XDSText type="supporting" display="block">
          28 available
        </XDSText>
      </XDSCard>
      <XDSCard>
        <XDSText type="label" display="block">
          Tokens
        </XDSText>
        <XDSText type="supporting" display="block">
          120 defined
        </XDSText>
      </XDSCard>
      <XDSGridSpan columns={3}>
        <XDSCard variant="cyan">
          <XDSVStack gap={1}>
            <XDSText type="label" display="block">
              Migration Guide
            </XDSText>
            <XDSText type="supporting" display="block">
              Step-by-step instructions for upgrading from v3 to v4
            </XDSText>
          </XDSVStack>
        </XDSCard>
      </XDSGridSpan>
      <XDSGridSpan columns="full">
        <XDSCard variant="cyan">
          <XDSVStack gap={1}>
            <XDSText type="label" display="block">
              Community Showcase
            </XDSText>
            <XDSText type="supporting" display="block">
              See how teams are building with XDS across the organization
            </XDSText>
          </XDSVStack>
        </XDSCard>
      </XDSGridSpan>
    </XDSGrid>
  );
}
