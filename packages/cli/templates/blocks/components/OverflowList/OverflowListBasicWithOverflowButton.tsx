'use client';

import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSButton} from '@xds/core/Button';

export default function OverflowListBasicWithOverflowButton() {
  return (
    <XDSOverflowList
      gap={2}
      overflowRenderer={(items) => (
        <XDSButton label={`+${items.length} more`} variant="ghost" />
      )}>
      <XDSButton label="Action 1" />
      <XDSButton label="Action 2" />
      <XDSButton label="Action 3" />
      <XDSButton label="Action 4" />
    </XDSOverflowList>
  );
}
