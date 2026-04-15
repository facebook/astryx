'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';

function CloudArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function SwitchWithLabelIconAndTooltip() {
  const [autoSave, setAutoSave] = useState(false);

  return (
    <XDSSwitch
      label="Auto-save"
      labelIcon={CloudArrowUpIcon}
      labelTooltip="Automatically save changes"
      value={autoSave}
      onChange={setAutoSave}
    />
  );
}
