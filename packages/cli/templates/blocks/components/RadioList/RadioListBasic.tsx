'use client';

import {useState} from 'react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListBasic() {
  const [selected, setSelected] = useState('email');

  return (
    <XDSRadioList
      label="Notification preference"
      value={selected}
      onChange={setSelected}>
      <XDSRadioListItem label="Email" value="email" />
      <XDSRadioListItem label="SMS" value="sms" />
      <XDSRadioListItem label="Push" value="push" />
    </XDSRadioList>
  );
}
