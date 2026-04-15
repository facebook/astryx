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

export default function SegmentedControlIconOnlyCompact() {
  const [view, setView] = useState('grid');

  return (
    <XDSSegmentedControl
      value={view}
      onChange={setView}
      label="View mode"
      size="sm">
      <XDSSegmentedControlItem
        value="grid"
        label="Grid"
        isLabelHidden
        icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />}
      />
      <XDSSegmentedControlItem
        value="list"
        label="List"
        isLabelHidden
        icon={<XDSIcon icon={ListBulletIcon} color="inherit" />}
      />
    </XDSSegmentedControl>
  );
}
