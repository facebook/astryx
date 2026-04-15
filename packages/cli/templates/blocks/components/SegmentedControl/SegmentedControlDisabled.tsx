'use client';

import {useState} from 'react';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';

export default function SegmentedControlDisabled() {
  const [view, setView] = useState('grid');

  return (
    <XDSSegmentedControl
      value={view}
      onChange={setView}
      label="View mode"
      isDisabled>
      <XDSSegmentedControlItem value="grid" label="Grid" />
      <XDSSegmentedControlItem value="list" label="List" />
    </XDSSegmentedControl>
  );
}
