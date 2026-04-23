'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSStack} from '@xds/core/Layout';

export default function CheckboxInputShowcase() {
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSCheckboxInput
        label="Checked"
        value={notifications}
        onChange={setNotifications}
      />
      <XDSCheckboxInput
        label="Unchecked"
        value={marketing}
        onChange={setMarketing}
      />
    </XDSStack>
  );
}
