// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSToken} from '@xds/core/Token';
import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TokenEndContent() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Trailing badges for counts or status
      </XDSText>
      <XDSStack direction="horizontal" gap={2} wrap="wrap">
        <XDSToken
          label="Inbox"
          color="blue"
          endContent={<XDSBadge variant="info" label={12} />}
        />
        <XDSToken
          label="Reviews"
          color="purple"
          endContent={<XDSBadge variant="purple" label={3} />}
        />
        <XDSToken
          label="Resolved"
          color="green"
          endContent={<XDSBadge variant="success" label="Done" />}
        />
      </XDSStack>
    </XDSStack>
  );
}
