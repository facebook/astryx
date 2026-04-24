'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

export default function CheckboxListItemShowcase() {
  const [value, setValue] = useState<string[]>(['updates', 'security']);

  return (
    <XDSCheckboxList
      label="Email preferences"
      value={value}
      onChange={setValue}
      hasDividers>
      <XDSCheckboxListItem
        label="Product updates"
        value="updates"
        description="New features and improvements"
      />
      <XDSCheckboxListItem
        label="Security alerts"
        value="security"
        description="Important account security notifications"
      />
      <XDSCheckboxListItem
        label="Marketing"
        value="marketing"
        description="Tips, offers, and promotions"
      />
      <XDSCheckboxListItem
        label="Beta program"
        value="beta"
        description="Currently closed to new members"
        isDisabled
      />
    </XDSCheckboxList>
  );
}
