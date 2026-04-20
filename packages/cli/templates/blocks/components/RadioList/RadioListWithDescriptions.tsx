'use client';

import {useState} from 'react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListWithDescriptions() {
  const [value, setValue] = useState('');

  return (
    <XDSRadioList
      label="Notification preference"
      description="Choose how you would like to be notified"
      value={value}
      onChange={setValue}>
      <XDSRadioListItem
        label="Email"
        value="email"
        description="Receive notifications via email"
      />
      <XDSRadioListItem
        label="SMS"
        value="sms"
        description="Standard messaging rates apply"
      />
      <XDSRadioListItem
        label="Push notification"
        value="push"
        description="Instant alerts on your device"
      />
    </XDSRadioList>
  );
}
