'use client';

import {useState} from 'react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListWithValidation() {
  const [value, setValue] = useState('');

  return (
    <XDSRadioList
      label="Notification preference"
      isRequired
      status={
        value === ''
          ? {type: 'error', message: 'Please select a notification method'}
          : undefined
      }
      value={value}
      onChange={setValue}>
      <XDSRadioListItem label="Email" value="email" />
      <XDSRadioListItem label="SMS" value="sms" />
      <XDSRadioListItem label="Push notification" value="push" />
    </XDSRadioList>
  );
}
