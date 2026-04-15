'use client';

import {useState} from 'react';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';

export default function SegmentedControlBasic() {
  const [view, setView] = useState('grid');

  return (
    <XDSSegmentedControl value={view} onChange={setView} label="View mode">
      <XDSSegmentedControlItem value="grid" label="Grid" />
      <XDSSegmentedControlItem value="list" label="List" />
      <XDSSegmentedControlItem value="table" label="Table" />
    </XDSSegmentedControl>
  );
}
