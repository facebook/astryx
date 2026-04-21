'use client';

import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';

export default function SegmentedControlShowcase() {
  return (
    <XDSSegmentedControl value="grid" onChange={() => {}} label="View mode">
      <XDSSegmentedControlItem value="grid" label="Grid" />
      <XDSSegmentedControlItem value="list" label="List" />
      <XDSSegmentedControlItem value="table" label="Table" />
    </XDSSegmentedControl>
  );
}
