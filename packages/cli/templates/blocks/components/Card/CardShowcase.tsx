'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

export default function CardShowcase() {
  return (
    <XDSCard width={320}>
      <XDSStack direction="vertical" gap={3}>
        <XDSStack direction="vertical" gap={1}>
          <XDSHeading level={4}>Project update</XDSHeading>
          <XDSText type="body" color="secondary">
            The latest build passed all checks and is ready for review.
          </XDSText>
        </XDSStack>
        <XDSStack direction="horizontal" gap={2}>
          <XDSButton label="Review" variant="primary" />
          <XDSButton label="Dismiss" variant="ghost" />
        </XDSStack>
      </XDSStack>
    </XDSCard>
  );
}
