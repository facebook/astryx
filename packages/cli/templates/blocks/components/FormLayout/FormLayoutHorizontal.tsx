'use client';

import {useState} from 'react';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';

export default function FormLayoutHorizontal() {
  const [first, setFirst] = useState('Jordan');
  const [last, setLast] = useState('Rivera');

  return (
    <XDSFormLayout direction="horizontal">
      <XDSTextInput label="First Name" value={first} onChange={setFirst} />
      <XDSTextInput label="Last Name" value={last} onChange={setLast} />
    </XDSFormLayout>
  );
}
