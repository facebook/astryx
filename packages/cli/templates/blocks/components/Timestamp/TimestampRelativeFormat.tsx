'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';

export default function TimestampRelativeFormat() {
  const now = Date.now() / 1000;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-start',
      }}>
      <XDSTimestamp value={now - 5} format="relative" />
      <XDSTimestamp value={now - 120} format="relative" />
      <XDSTimestamp value={now - 3600} format="relative" />
      <XDSTimestamp value={now - 86400} format="relative" />
      <XDSTimestamp value={now - 259200} format="relative" />
      <XDSTimestamp value={now - 90 * 86400} format="relative" />
    </div>
  );
}
