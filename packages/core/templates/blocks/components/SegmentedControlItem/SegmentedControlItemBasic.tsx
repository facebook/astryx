// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

export default function SegmentedControlItemBasic() {
  const [view, setView] = useState('board');

  return (
    <SegmentedControl value={view} onChange={setView} label="View mode">
      <SegmentedControlItem value="board" label="Board" />
      <SegmentedControlItem value="list" label="List" />
      <SegmentedControlItem value="timeline" label="Timeline" />
    </SegmentedControl>
  );
}
