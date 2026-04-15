'use client';

import {useState} from 'react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListWithStatus() {
  const [choice, setChoice] = useState('');

  return (
    <XDSRadioList
      label="Required choice"
      value={choice}
      onChange={setChoice}
      isRequired
      status={{type: 'error', message: 'Please select an option'}}>
      <XDSRadioListItem label="Option A" value="a" />
      <XDSRadioListItem label="Option B" value="b" />
    </XDSRadioList>
  );
}
