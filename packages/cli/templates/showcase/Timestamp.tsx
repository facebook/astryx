'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';

export default function TimestampShowcase() {
  return <XDSTimestamp date={new Date()} />;
}
