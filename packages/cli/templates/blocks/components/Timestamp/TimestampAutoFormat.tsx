// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Timestamp} from '@xds/core/Timestamp';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function TimestampAutoFormat() {
  const now = Date.now() / 1000;
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Recent — renders as relative
        </Text>
        <Stack direction="horizontal" gap={4} vAlign="center">
          <Timestamp value={now - 300} format="auto" color="primary" />
          <Timestamp value={now - 7200} format="auto" color="primary" />
          <Timestamp value={now - 86400} format="auto" color="primary" />
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Older than 7 days — renders as date_time
        </Text>
        <Stack direction="horizontal" gap={4} vAlign="center">
          <Timestamp value="2025-01-15T09:30:00Z" format="auto" color="primary" />
          <Timestamp value="2024-06-01T14:00:00Z" format="auto" color="primary" />
        </Stack>
      </Stack>
    </Stack>
  );
}
