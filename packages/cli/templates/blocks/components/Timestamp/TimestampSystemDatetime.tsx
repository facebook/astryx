'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';

export default function TimestampSystemDatetime() {
  return (
    <XDSTimestamp value="2026-02-19T17:00:00Z" format="system_date_time" type="code" />
  );
}
