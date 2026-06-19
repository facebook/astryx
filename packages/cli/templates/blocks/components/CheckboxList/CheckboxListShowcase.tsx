// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {CheckboxList, CheckboxListItem} from '@xds/core/CheckboxList';
export default function CheckboxListShowcase() {
  const [value, setValue] = useState<string[]>(['email']);
  return (
    <CheckboxList
      label="Notification preferences"
      description="Choose how you would like to be notified"
      value={value}
      onChange={setValue}
      hasDividers>
      <CheckboxListItem
        label="Email"
        value="email"
        description="Weekly digest every Monday"
      />
      <CheckboxListItem
        label="Push notification"
        value="push"
        description="Instant alerts on your device"
      />
      <CheckboxListItem
        label="SMS"
        value="sms"
        description="Standard messaging rates apply"
      />
    </CheckboxList>
  );
}
