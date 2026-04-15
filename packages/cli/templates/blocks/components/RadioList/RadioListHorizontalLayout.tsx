'use client';

import {useState} from 'react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListHorizontalLayout() {
  const [size, setSize] = useState('md');

  return (
    <XDSRadioList
      label="Size"
      value={size}
      onChange={setSize}
      orientation="horizontal">
      <XDSRadioListItem label="Small" value="sm" />
      <XDSRadioListItem label="Medium" value="md" />
      <XDSRadioListItem label="Large" value="lg" />
    </XDSRadioList>
  );
}
