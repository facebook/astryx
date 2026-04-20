'use client';

import {useState} from 'react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListHorizontalLayout() {
  const [value, setValue] = useState('md');

  return (
    <XDSRadioList
      label="Size"
      orientation="horizontal"
      value={value}
      onChange={setValue}>
      <XDSRadioListItem label="Small" value="sm" />
      <XDSRadioListItem label="Medium" value="md" />
      <XDSRadioListItem label="Large" value="lg" />
    </XDSRadioList>
  );
}
