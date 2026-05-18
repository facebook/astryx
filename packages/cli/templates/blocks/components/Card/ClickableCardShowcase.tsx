// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';

export default function ClickableCardShowcase() {
  return (
    <XDSClickableCard label="Settings" href="#" width={320}>
      <XDSStack direction="vertical" gap={2}>
        <XDSHeading level={4}>Settings</XDSHeading>
        <XDSText type="body" color="secondary">
          Click anywhere on this card to navigate. Nested buttons and links work
          independently.
        </XDSText>
      </XDSStack>
    </XDSClickableCard>
  );
}
