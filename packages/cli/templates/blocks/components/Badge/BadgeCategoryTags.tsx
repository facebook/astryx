// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function BadgeCategoryTags() {
  return (
    <XDSStack direction="vertical" gap={6}>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          Teams
        </XDSText>
        <XDSStack direction="horizontal" gap={2} style={{flexWrap: 'wrap'}}>
          <XDSBadge variant="blue" label="Design" />
          <XDSBadge variant="cyan" label="DevOps" />
          <XDSBadge variant="green" label="Backend" />
          <XDSBadge variant="pink" label="Marketing" />
          <XDSBadge variant="purple" label="Engineering" />
          <XDSBadge variant="teal" label="Research" />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          Priority
        </XDSText>
        <XDSStack direction="horizontal" gap={2}>
          <XDSBadge variant="orange" label="Urgent" />
          <XDSBadge variant="red" label="Critical" />
          <XDSBadge variant="yellow" label="Review" />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
