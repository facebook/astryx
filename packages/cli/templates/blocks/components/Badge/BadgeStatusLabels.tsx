// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function BadgeStatusLabels() {
  return (
    <XDSStack direction="vertical" gap={6}>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          System status
        </XDSText>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          <XDSBadge variant="success" label="Active" />
          <XDSBadge variant="warning" label="Pending" />
          <XDSBadge variant="error" label="Failed" />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          Workflow
        </XDSText>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          <XDSBadge variant="neutral" label="Draft" />
          <XDSBadge variant="info" label="In Review" />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
