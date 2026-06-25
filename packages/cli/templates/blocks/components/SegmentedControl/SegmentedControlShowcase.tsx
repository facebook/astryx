// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

export default function SegmentedControlShowcase() {
  return (
    <SegmentedControl value="grid" onChange={() => {}} label="View mode">
      <SegmentedControlItem value="grid" label="Grid" />
      <SegmentedControlItem value="list" label="List" />
      <SegmentedControlItem value="table" label="Table" />
    </SegmentedControl>
  );
}
