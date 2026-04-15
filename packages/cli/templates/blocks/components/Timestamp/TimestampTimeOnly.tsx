'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';

export default function TimestampTimeOnly() {
  return (
    <XDSTimestamp value="2026-02-19T17:00:00Z" format="time" />
  );
}
