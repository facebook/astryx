'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';

export default function TimestampRelativeFormat() {
  return (
    <XDSTimestamp value={Date.now() / 1000 - 3600} format="relative" />
  );
}
