// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const DATE = '2026-02-19T17:00:00Z';

export default function TimestampTimezone() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          User-facing with timezone
        </XDSText>
        <XDSStack direction="horizontal" gap={4} vAlign="center">
          <XDSTimestamp value={DATE} format="date_time" isTimezoneShown color="primary" />
          <XDSTimestamp value={DATE} format="time" isTimezoneShown color="primary" />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          System formats with timezone
        </XDSText>
        <XDSStack direction="horizontal" gap={4} vAlign="center">
          <XDSTimestamp value={DATE} format="system_date_time" isTimezoneShown type="code" color="primary" />
          <XDSTimestamp value={DATE} format="system_time" isTimezoneShown type="code" color="primary" />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
