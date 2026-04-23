'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';

export default function CenterShowcase() {
  return (
    <XDSCenter axis="both" width="100%" height={240}>
      <XDSStack direction="vertical" gap={2} hAlign="center">
        <XDSBadge label="Centered" variant="info" />
        <XDSHeading level={4}>Nothing to see here</XDSHeading>
        <XDSText type="body" color="secondary">
          This content is centered on both axes.
        </XDSText>
      </XDSStack>
    </XDSCenter>
  );
}
