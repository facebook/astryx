// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const DATE = '2026-02-19T17:00:00Z';

export default function TimestampTooltipTimezones() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Local + UTC — hover to compare
        </Text>
        <Timestamp
          value={DATE}
          format="relative"
          color="primary"
          tooltipEntries={[
            {format: 'date_time', label: 'Local'},
            {timezoneID: 'UTC', format: 'date_time', label: 'UTC'},
          ]}
        />
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Incident origin zone alongside the reader&rsquo;s
        </Text>
        <Timestamp
          value={DATE}
          format="date_time"
          color="primary"
          tooltipEntries={[
            {format: 'date_time', label: 'Local'},
            {
              timezoneID: 'America/Los_Angeles',
              format: 'date_time',
              label: 'Origin',
            },
          ]}
        />
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Friendly line plus a machine-precise line
        </Text>
        <Timestamp
          value={DATE}
          format="date_time"
          color="primary"
          tooltipEntries={[
            {format: 'full'},
            {format: 'system_date_time', label: 'ISO'},
          ]}
        />
      </Stack>
    </Stack>
  );
}
