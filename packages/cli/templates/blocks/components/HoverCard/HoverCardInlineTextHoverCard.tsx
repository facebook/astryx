'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function HoverCardInlineTextHoverCard() {
  return (
    <XDSText type="body">
      The project is maintained by{' '}
      <XDSHoverCard
        content={
          <XDSHStack gap={3} vAlign="start">
            <XDSAvatar name="Jane Doe" size="md" />
            <XDSVStack gap={1}>
              <XDSText type="label">Jane Doe</XDSText>
              <XDSText type="supporting" color="secondary">
                Software Engineer
              </XDSText>
            </XDSVStack>
          </XDSHStack>
        }
        placement="above">
        Jane Doe
      </XDSHoverCard>
      ,{' '}
      <XDSHoverCard
        content={
          <XDSHStack gap={3} vAlign="start">
            <XDSAvatar name="John Smith" size="md" />
            <XDSVStack gap={1}>
              <XDSText type="label">John Smith</XDSText>
              <XDSText type="supporting" color="secondary">
                Product Manager
              </XDSText>
            </XDSVStack>
          </XDSHStack>
        }
        placement="above">
        John Smith
      </XDSHoverCard>
      , and others.
    </XDSText>
  );
}
