'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

export default function CheckboxInputGroup() {
  const [value, setValue] = useState<string[]>(['email']);

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
        description="Receive a weekly digest of activity"
      />
      <XDSCheckboxListItem
        label="SMS"
        value="sms"
        description="Standard messaging rates may apply"
      />
      <XDSCheckboxListItem
        label="Push notification"
        value="push"
        description="Instant alerts on your mobile device"
      />
      <XDSCheckboxListItem
        label="Slack"
        value="slack"
        description="Messages sent to your workspace channel"
        isDisabled
      />
    </XDSCheckboxList>
  );
}
