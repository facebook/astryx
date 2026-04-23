'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const DATE = '2026-02-19T17:00:00Z';

export default function TimestampColors() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          primary
        </XDSText>
        <XDSTimestamp value={DATE} format="date_time" color="primary" />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          secondary
        </XDSText>
        <XDSTimestamp value={DATE} format="date_time" color="secondary" />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          disabled
        </XDSText>
        <XDSTimestamp value={DATE} format="date_time" color="disabled" />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          active
        </XDSText>
        <XDSTimestamp value={DATE} format="date_time" color="active" />
      </XDSStack>
    </XDSStack>
  );
}
