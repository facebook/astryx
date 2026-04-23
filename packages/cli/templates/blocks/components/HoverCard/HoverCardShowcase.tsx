'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';

export default function HoverCardShowcase() {
  return (
    <XDSHoverCard
      placement="above"
      isDefaultOpen
      content={
        <XDSVStack gap={1} style={{width: 200}}>
          <XDSHeading level={5}>Jane Doe</XDSHeading>
          <XDSText type="supporting" color="secondary">Software Engineer</XDSText>
          <XDSText type="body">Building great products with great people.</XDSText>
        </XDSVStack>
      }>
      <XDSButton label="Hover me" />
    </XDSHoverCard>
  );
}
