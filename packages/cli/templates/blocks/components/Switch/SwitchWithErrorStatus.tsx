'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';

export default function SwitchWithErrorStatus() {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <XDSSwitch
      label="Two-factor authentication"
      value={twoFactor}
      onChange={setTwoFactor}
      status={{type: 'error', message: 'Failed to save setting'}}
    />
  );
}
