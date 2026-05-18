// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function CardWithSimpleContent() {
  return (
    <XDSCard width={360}>
      <XDSStack direction="vertical" gap={2}>
        <XDSHeading level={3}>Project Overview</XDSHeading>
        <XDSText type="body" color="secondary">
          This project tracks the redesign of the onboarding flow. The goal is
          to reduce drop-off by 15% in Q2.
        </XDSText>
        <XDSText type="supporting" color="secondary">
          Last updated 2 hours ago
        </XDSText>
      </XDSStack>
    </XDSCard>
  );
}
