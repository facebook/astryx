// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Center} from '@astryxdesign/core/Center';
import {Icon} from '@astryxdesign/core/Icon';

export default function SegmentedControlItemShowcase() {
  const [view, setView] = useState('board');

  return (
    <Center>
      <SegmentedControl value={view} onChange={setView} label="View mode">
        <SegmentedControlItem
          value="board"
          label="Board"
          icon={<Icon icon="viewColumns" />}
        />
        <SegmentedControlItem
          value="list"
          label="List"
          icon={<Icon icon="menu" />}
        />
        <SegmentedControlItem
          value="timeline"
          label="Timeline"
          icon={<Icon icon="calendar" />}
        />
        <SegmentedControlItem
          value="chart"
          label="Chart"
          icon={<Icon icon="arrowsUpDown" />}
          isDisabled
        />
      </SegmentedControl>
    </Center>
  );
}
