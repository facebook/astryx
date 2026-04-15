'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

export default function CheckboxListWithDescriptions() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <XDSCheckboxList
      label="Preferences"
      value={selected}
      onChange={setSelected}
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
    </XDSCheckboxList>
  );
}
