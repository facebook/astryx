'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';

export default function TimestampLiveUpdating() {
  return (
    <XDSTimestamp value={Date.now() / 1000 - 120} format="relative" isLive />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: TimestampLiveUpdating,
};
