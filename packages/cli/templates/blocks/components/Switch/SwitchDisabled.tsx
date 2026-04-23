'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSCenter} from '@xds/core/Center';

export default function SwitchDisabled() {
  const [value, setValue] = useState(false);
  return (
    <XDSCenter>
      <XDSSwitch
        label="Premium feature"
        description="Upgrade to enable this option"
        value={value}
        onChange={setValue}
        isDisabled
      />
    </XDSCenter>
  );
}
