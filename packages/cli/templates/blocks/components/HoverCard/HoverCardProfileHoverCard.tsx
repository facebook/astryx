'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function HoverCardProfileHoverCard() {
  return (
    <XDSHoverCard
      placement="below"
      content={
        <XDSVStack gap={2}>
          <XDSText type="label">Jane Doe</XDSText>
          <XDSText type="supporting" color="secondary">
            Software Engineer · San Francisco
          </XDSText>
          <XDSText type="body">
            Building great products with great people. Previously at Acme Corp.
          </XDSText>
        </XDSVStack>
      }>
      <XDSButton label="Jane Doe" variant="ghost" />
    </XDSHoverCard>
  );
}
