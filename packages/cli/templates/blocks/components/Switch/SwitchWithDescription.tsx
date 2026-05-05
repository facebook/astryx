'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSCenter} from '@xds/core/Center';

export default function SwitchWithDescription() {
  const [value, setValue] = useState(false);
  return (
    <XDSSwitch
      label="Dark mode"
      description="Switch to a darker color scheme."
      value={value}
      onChange={setValue}
    />
  );
}
