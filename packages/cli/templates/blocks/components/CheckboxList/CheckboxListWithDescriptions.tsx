'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

export default function CheckboxListWithDescriptions() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <XDSCheckboxList
      label="Notification preferences"
      description="Choose how you would like to be notified"
      value={value}
      onChange={setValue}
      hasDividers>
      <XDSCheckboxListItem
        label="Email"
        value="email"
        description="Receive notifications via email"
      />
      <XDSCheckboxListItem
        label="SMS"
        value="sms"
        description="Standard messaging rates apply"
      />
      <XDSCheckboxListItem
        label="Push notification"
        value="push"
        description="Instant alerts on your device"
      />
    </XDSCheckboxList>
  );
}
