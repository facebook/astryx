'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

export default function CheckboxListWithStatus() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <XDSCheckboxList
      label="Required selections"
      value={selected}
      onChange={setSelected}
      status={{type: 'error', message: 'Please select at least one option'}}>
      <XDSCheckboxListItem label="Option A" value="a" />
      <XDSCheckboxListItem label="Option B" value="b" />
    </XDSCheckboxList>
  );
}
