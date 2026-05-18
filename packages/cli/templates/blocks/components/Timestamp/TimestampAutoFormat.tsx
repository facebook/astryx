// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TimestampAutoFormat() {
  const now = Date.now() / 1000;
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Recent — renders as relative
        </XDSText>
        <XDSStack direction="horizontal" gap={4} vAlign="center">
          <XDSTimestamp value={now - 300} format="auto" color="primary" />
          <XDSTimestamp value={now - 7200} format="auto" color="primary" />
          <XDSTimestamp value={now - 86400} format="auto" color="primary" />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Older than 7 days — renders as date_time
        </XDSText>
        <XDSStack direction="horizontal" gap={4} vAlign="center">
          <XDSTimestamp value="2025-01-15T09:30:00Z" format="auto" color="primary" />
          <XDSTimestamp value="2024-06-01T14:00:00Z" format="auto" color="primary" />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
