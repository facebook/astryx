'use client';

import {useState} from 'react';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSCenter} from '@xds/core/Center';
import {XDSIcon} from '@xds/core/Icon';

export default function SegmentedControlItemShowcase() {
  const [view, setView] = useState('board');

  return (
    <XDSCenter>
      <XDSSegmentedControl value={view} onChange={setView} label="View mode">
        <XDSSegmentedControlItem
          value="board"
          label="Board"
          icon={<XDSIcon icon="viewColumns" />}
        />
        <XDSSegmentedControlItem
          value="list"
          label="List"
          icon={<XDSIcon icon="menu" />}
        />
        <XDSSegmentedControlItem
          value="timeline"
          label="Timeline"
          icon={<XDSIcon icon="calendar" />}
        />
        <XDSSegmentedControlItem
          value="chart"
          label="Chart"
          icon={<XDSIcon icon="arrowsUpDown" />}
          isDisabled
        />
      </XDSSegmentedControl>
    </XDSCenter>
  );
}
