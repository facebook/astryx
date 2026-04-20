'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';

export default function SwitchWithDescription() {
  const [value, setValue] = useState(false);
  return (
    <XDSSwitch
      label="Dark mode"
      description="Switch to a darker color scheme for reduced eye strain."
      value={value}
      onChange={setValue}
    />
  );
}
