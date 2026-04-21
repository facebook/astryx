'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const DATE = '2026-02-19T17:00:00Z';

export default function TimestampFormats() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          User-facing formats
        </XDSText>
        <XDSStack direction="horizontal" gap={4} vAlign="center">
          <XDSTimestamp value={DATE} format="date" />
          <XDSTimestamp value={DATE} format="date_time" />
          <XDSTimestamp value={DATE} format="time" />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          System formats (logs and dev tools)
        </XDSText>
        <XDSStack direction="horizontal" gap={4} vAlign="center">
          <XDSTimestamp value={DATE} format="system_date" type="code" />
          <XDSTimestamp value={DATE} format="system_date_time" type="code" />
          <XDSTimestamp value={DATE} format="system_time" type="code" />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
