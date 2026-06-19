// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Timestamp} from '@xds/core/Timestamp';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function TimestampRelativeFormat() {
  const now = Date.now() / 1000;
  return (
    <Stack direction="vertical" gap={3}>
      <Text type="supporting" color="secondary">
        Relative timestamps (hover for full date)
      </Text>
      <Stack direction="vertical" gap={2}>
        <Timestamp value={now - 5} format="relative" color="primary" />
        <Timestamp value={now - 120} format="relative" color="primary" />
        <Timestamp value={now - 3600} format="relative" color="primary" />
        <Timestamp value={now - 86400} format="relative" color="primary" />
        <Timestamp value={now - 259200} format="relative" color="primary" />
        <Timestamp value={now - 90 * 86400} format="relative" color="primary" />
      </Stack>
    </Stack>
  );
}
