// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {CheckboxList, CheckboxListItem} from '@xds/core/CheckboxList';

export default function CheckboxListItemShowcase() {
  const [value, setValue] = useState<string[]>(['updates', 'security']);

  return (
    <CheckboxList
      label="Email preferences"
      value={value}
      onChange={setValue}
      hasDividers>
      <CheckboxListItem
        label="Product updates"
        value="updates"
        description="New features and improvements"
      />
      <CheckboxListItem
        label="Security alerts"
        value="security"
        description="Important account security notifications"
      />
      <CheckboxListItem
        label="Marketing"
        value="marketing"
        description="Tips, offers, and promotions"
      />
      <CheckboxListItem
        label="Beta program"
        value="beta"
        description="Currently closed to new members"
        isDisabled
      />
    </CheckboxList>
  );
}
