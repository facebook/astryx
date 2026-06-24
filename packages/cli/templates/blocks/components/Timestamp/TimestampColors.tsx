// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const DATE = '2026-02-19T17:00:00Z';

export default function TimestampColors() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Primary
        </Text>
        <Timestamp value={DATE} format="date_time" color="primary" />
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Secondary
        </Text>
        <Timestamp value={DATE} format="date_time" color="secondary" />
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Disabled
        </Text>
        <Timestamp value={DATE} format="date_time" color="disabled" />
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Active
        </Text>
        <Timestamp value={DATE} format="date_time" color="active" />
      </Stack>
    </Stack>
  );
}
