'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';

export default function SwitchShowcase() {
  const [enabled, setEnabled] = useState(true);
  return (
    <XDSSwitch
      label="Enable notifications"
      value={enabled}
      onChange={setEnabled}
    />
  );
}
