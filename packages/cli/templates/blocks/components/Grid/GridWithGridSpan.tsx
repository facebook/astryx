'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';

export default function GridWithGridSpan() {
  return (
    <XDSGrid columns={3} gap={4} width="100%" style={{maxWidth: 500}}>
      <XDSGridSpan rows={2}>
        <XDSCard variant="cyan">
          <XDSVStack gap={1}>
            <XDSText type="label" display="block">
              Featured Release
            </XDSText>
            <XDSText type="supporting" display="block">
              XDS 4.0 is now available with new layout primitives, refreshed
              tokens, and improved theming support across the system.
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
      <XDSCard>
        <XDSText type="label" display="block">
          Themes
        </XDSText>
        <XDSText type="supporting" display="block">
          6 published
        </XDSText>
      </XDSCard>
      <XDSCard>
        <XDSText type="label" display="block">
          Icons
        </XDSText>
        <XDSText type="supporting" display="block">
          312 available
        </XDSText>
      </XDSCard>
      <XDSCard>
        <XDSText type="label" display="block">
          Patterns
        </XDSText>
        <XDSText type="supporting" display="block">
          18 documented
        </XDSText>
      </XDSCard>
      <XDSCard>
        <XDSText type="label" display="block">
          Contributors
        </XDSText>
        <XDSText type="supporting" display="block">
          42 active
        </XDSText>
      </XDSCard>
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
