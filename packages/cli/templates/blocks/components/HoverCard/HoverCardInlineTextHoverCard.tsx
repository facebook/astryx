'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function HoverCardInlineTextHoverCard() {
  return (
    <XDSText type="body">
      The project is maintained by{' '}
      <XDSHoverCard
        content={
          <XDSVStack gap={1}>
            <XDSText type="label">Jane Doe</XDSText>
            <XDSText type="supporting" color="secondary">
              Software Engineer
            </XDSText>
            <XDSText type="body">
              Building great products with great people.
            </XDSText>
          </XDSVStack>
        }
        placement="above">
        Jane Doe
      </XDSHoverCard>
      ,{' '}
      <XDSHoverCard
        content={
          <XDSVStack gap={1}>
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
