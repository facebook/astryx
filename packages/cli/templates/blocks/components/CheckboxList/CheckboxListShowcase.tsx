// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';
export default function CheckboxListShowcase() {
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
        description="Weekly digest every Monday"
      />
      <XDSCheckboxListItem
        label="Push notification"
        value="push"
        description="Instant alerts on your device"
      />
      <XDSCheckboxListItem
        label="SMS"
        value="sms"
        description="Standard messaging rates apply"
      />
    </XDSCheckboxList>
  );
}
