// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

export default function SegmentedControlShowcase() {
  const [value, setValue] = useState('grid');
  return (
    <SegmentedControl value={value} onChange={setValue} label="View mode">
      <SegmentedControlItem value="grid" label="Grid" />
      <SegmentedControlItem value="list" label="List" />
      <SegmentedControlItem value="table" label="Table" />
    </SegmentedControl>
  );
}
