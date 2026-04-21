'use client';

import {useState} from 'react';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="5" cy="6" r="1" fill="currentColor" />
    <circle cx="5" cy="12" r="1" fill="currentColor" />
    <circle cx="5" cy="18" r="1" fill="currentColor" />
  </svg>
);

export default function SegmentedControlIconOnly() {
  const [value, setValue] = useState('grid');
  return (
    <XDSSegmentedControl
      value={value}
      onChange={setValue}
      label="View mode"
      size="sm">
      <XDSSegmentedControlItem
        value="grid"
        label="Grid"
        isLabelHidden
        icon={<GridIcon />}
      />
      <XDSSegmentedControlItem
        value="list"
        label="List"
        isLabelHidden
        icon={<ListIcon />}
      />
    </XDSSegmentedControl>
  );
}
