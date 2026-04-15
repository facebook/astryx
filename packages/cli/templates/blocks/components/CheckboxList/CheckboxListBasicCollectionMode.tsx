'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

export default function CheckboxListBasicCollectionMode() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <XDSCheckboxList label="Notifications" value={selected} onChange={setSelected}>
      <XDSCheckboxListItem label="Email" value="email" />
      <XDSCheckboxListItem label="SMS" value="sms" />
      <XDSCheckboxListItem label="Push" value="push" />
    </XDSCheckboxList>
  );
}
