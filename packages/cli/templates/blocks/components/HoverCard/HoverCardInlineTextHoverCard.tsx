'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function HoverCardInlineTextHoverCard() {
  return (
    <XDSText type="body">
      The project is maintained by{' '}
      <XDSHoverCard
        content={
          <XDSVStack gap={2}>
            <XDSAvatar name="Jane Doe" size="md" />
            <XDSText type="label">Jane Doe</XDSText>
            <XDSText type="supporting" color="secondary">
              Software Engineer
            </XDSText>
          </XDSVStack>
        }
        placement="above">
        Jane Doe
      </XDSHoverCard>
      ,{' '}
      <XDSHoverCard
        content={
          <XDSVStack gap={2}>
            <XDSAvatar name="John Smith" size="md" />
            <XDSText type="label">John Smith</XDSText>
            <XDSText type="supporting" color="secondary">
              Product Manager
            </XDSText>
          </XDSVStack>
        }
        placement="above">
        John Smith
      </XDSHoverCard>
      , and others.
    </XDSText>
  );
}
