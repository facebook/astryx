'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function HeadingCardGrid() {
  return (
    <XDSCard width={300}>
      <XDSVStack gap={2}>
        <XDSHeading level={3}>Card Title</XDSHeading>
        <XDSText type="body" maxLines={2} display="block">
          This is a card description that might be quite long and needs to be
          truncated after two lines to keep the card compact and uniform.
        </XDSText>
        <XDSText type="supporting" display="block">
          Updated 1 hour ago
        </XDSText>
      </XDSVStack>
    </XDSCard>
  );
}
