'use client';

import {XDSOverflowList} from '@xds/core/OverflowList';

export default function OverflowListShowcase() {
  return (
    <XDSOverflowList
      items={[]}
      renderItem={() => null}
      renderOverflow={() => null}
    />
  );
}
