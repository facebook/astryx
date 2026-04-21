'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function HoverCardProfileHoverCard() {
  return (
    <XDSHoverCard
      placement="below"
      content={
        <XDSVStack gap={3}>
          <XDSAvatar name="Jane Doe" size="lg" />
          <XDSVStack gap={1}>
            <XDSText type="label">Jane Doe</XDSText>
            <XDSText type="supporting" color="secondary">
              Software Engineer · San Francisco
            </XDSText>
          </XDSVStack>
          <XDSText type="body">
            Building great products with great people. Previously at Acme Corp.
          </XDSText>
        </XDSVStack>
      }>
      <XDSButton label="Jane Doe" variant="ghost" />
    </XDSHoverCard>
  );
}
