// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TimestampRelativeFormat() {
  const now = Date.now() / 1000;
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="supporting" color="secondary">
        Relative timestamps (hover for full date)
      </XDSText>
      <XDSStack direction="vertical" gap={2}>
        <XDSTimestamp value={now - 5} format="relative" color="primary" />
        <XDSTimestamp value={now - 120} format="relative" color="primary" />
        <XDSTimestamp value={now - 3600} format="relative" color="primary" />
        <XDSTimestamp value={now - 86400} format="relative" color="primary" />
        <XDSTimestamp value={now - 259200} format="relative" color="primary" />
        <XDSTimestamp value={now - 90 * 86400} format="relative" color="primary" />
      </XDSStack>
    </XDSStack>
  );
}
