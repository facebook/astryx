'use client';

import {XDSStack} from '@xds/core/Layout';
import {XDSBadge} from '@xds/core/Badge';
import {XDSText} from '@xds/core/Text';

export default function StackDirections() {
  return (
    <XDSStack direction="horizontal" gap={10} hAlign="center">
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Horizontal
        </XDSText>
        <XDSStack direction="horizontal" gap={2}>
          <XDSBadge label="React" />
          <XDSBadge label="TypeScript" />
          <XDSBadge label="Node.js" />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Vertical
        </XDSText>
        <XDSStack direction="vertical" gap={2}>
          <XDSBadge label="React" />
          <XDSBadge label="TypeScript" />
          <XDSBadge label="Node.js" />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
