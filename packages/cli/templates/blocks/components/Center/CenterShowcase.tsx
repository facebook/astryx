'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';

export default function CenterShowcase() {
  return (
    <XDSCenter axis="both" width="100%" height={240}>
      <XDSStack direction="vertical" gap={2} hAlign="center">
        <XDSHeading level={4}>Centered content</XDSHeading>
        <XDSText type="body" color="secondary">
          Horizontally and vertically aligned.
        </XDSText>
      </XDSStack>
    </XDSCenter>
  );
}
