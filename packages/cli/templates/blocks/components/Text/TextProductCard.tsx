'use client';

import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Stack';

export default function TextProductCard() {
  return (
    <XDSCard padding={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSHeading level={4}>Quarterly design review</XDSHeading>
        <XDSText type="body" maxLines={2} display="block">
          Review the latest component audit results, discuss the new color token
          strategy, and align on the typography scale changes planned for Q2.
        </XDSText>
        <XDSText type="supporting" display="block">
          Updated 5 minutes ago by Sarah Chen
        </XDSText>
      </XDSStack>
    </XDSCard>
  );
}
