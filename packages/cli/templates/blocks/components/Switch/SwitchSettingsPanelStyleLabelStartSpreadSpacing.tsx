'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';

export default function SwitchSettingsPanelStyleLabelStartSpreadSpacing() {
  const [enabled, setEnabled] = useState(false);

  return (
    <XDSSwitch
      label="Enable notifications"
      value={enabled}
      onChange={setEnabled}
      labelPosition="start"
      labelSpacing="spread"
    />
  );
}
