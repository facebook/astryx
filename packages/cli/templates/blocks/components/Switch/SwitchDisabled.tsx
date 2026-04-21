'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';

export default function SwitchDisabled() {
  const [value, setValue] = useState(false);
  return (
    <XDSSwitch
      label="Premium feature"
      description="Upgrade to enable this option"
      value={value}
      onChange={setValue}
      isDisabled
    />
  );
}
