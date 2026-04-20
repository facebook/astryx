'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';
import {XDSCard} from '@xds/core/Card';

export default function CheckboxListInsideCard() {
  const [selected, setSelected] = useState<string[]>(['email']);
  return (
    <div style={{maxWidth: 400}}>
      <XDSCard>
        <XDSCheckboxList
          label="Notifications"
          description="Choose how to be notified"
          value={selected}
          onChange={setSelected}>
          <XDSCheckboxListItem
            value="email"
            label="Email"
            description="Weekly digest"
          />
          <XDSCheckboxListItem value="push" label="Push notifications" />
          <XDSCheckboxListItem value="sms" label="SMS" isDisabled />
        </XDSCheckboxList>
      </XDSCard>
    </div>
  );
}
