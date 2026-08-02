// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const DATE = '2026-02-19T17:00:00Z';

export default function TimestampTimezone() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          User-facing with timezone
        </Text>
        <Stack direction="horizontal" gap={4} vAlign="center">
          <Timestamp
            value={DATE}
            format="date_time"
            isTimezoneShown
            color="primary"
          />
          <Timestamp
            value={DATE}
            format="time"
            isTimezoneShown
            color="primary"
          />
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          System formats stay machine-readable — never suffixed with a zone
        </Text>
        <Stack direction="horizontal" gap={4} vAlign="center">
          <Timestamp
            value={DATE}
            format="system_date_time"
            type="code"
            color="primary"
          />
          <Timestamp
            value={DATE}
            format="system_time"
            type="code"
            color="primary"
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
