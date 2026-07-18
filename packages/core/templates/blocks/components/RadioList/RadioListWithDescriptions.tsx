// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';

export default function RadioListWithDescriptions() {
  const [value, setValue] = useState('');

  return (
    <RadioList
      label="Notification preference"
      description="Choose how you would like to be notified"
      value={value}
      onChange={setValue}>
      <RadioListItem
        label="Email"
        value="email"
        description="Receive notifications via email"
      />
      <RadioListItem
        label="SMS"
        value="sms"
        description="Standard messaging rates apply"
      />
      <RadioListItem
        label="Push notification"
        value="push"
        description="Instant alerts on your device"
      />
    </RadioList>
  );
}
