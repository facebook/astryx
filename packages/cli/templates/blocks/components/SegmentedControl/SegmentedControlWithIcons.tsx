'use client';

import {useState} from 'react';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSIcon} from '@xds/core/Icon';

function Squares2X2Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
    </svg>
  );
}

function ListBulletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 4h2v2H3V4zm4 0h14v2H7V4zM3 10h2v2H3v-2zm4 0h14v2H7v-2zM3 16h2v2H3v-2zm4 0h14v2H7v-2z" />
    </svg>
  );
}

function TableCellsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h18v18H3V3zm2 4v4h6V7H5zm8 0v4h6V7h-6zM5 13v4h6v-4H5zm8 0v4h6v-4h-6z" />
    </svg>
  );
}

export default function SegmentedControlWithIcons() {
  const [view, setView] = useState('grid');

  return (
    <XDSSegmentedControl value={view} onChange={setView} label="View mode">
      <XDSSegmentedControlItem
        value="grid"
        label="Grid"
        icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />}
      />
      <XDSSegmentedControlItem
        value="list"
        label="List"
        icon={<XDSIcon icon={ListBulletIcon} color="inherit" />}
      />
      <XDSSegmentedControlItem
        value="table"
        label="Table"
        icon={<XDSIcon icon={TableCellsIcon} color="inherit" />}
      />
    </XDSSegmentedControl>
  );
}
