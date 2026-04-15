'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';

export default function SwitchWithDescription() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <XDSSwitch
      label="Dark mode"
      description="Switch to a darker color scheme"
      value={darkMode}
      onChange={setDarkMode}
    />
  );
}
