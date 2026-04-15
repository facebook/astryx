'use client';

import {useState} from 'react';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function ToggleButtonSingleselectGroup() {
  const [view, setView] = useState<string | null>('grid');

  return (
    <XDSToggleButtonGroup value={view} onChange={setView} label="View mode">
      <XDSToggleButton value="list" label="List" icon={<ListIcon />} />
      <XDSToggleButton value="grid" label="Grid" icon={<GridIcon />} />
    </XDSToggleButtonGroup>
  );
}
