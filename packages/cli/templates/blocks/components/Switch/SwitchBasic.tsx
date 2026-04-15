'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';

export default function SwitchBasic() {
  const [enabled, setEnabled] = useState(false);

  return (
    <XDSSwitch
      label="Enable notifications"
      value={enabled}
      onChange={setEnabled}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: SwitchBasic,
};
