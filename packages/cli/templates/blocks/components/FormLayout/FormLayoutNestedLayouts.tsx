'use client';

import {useState} from 'react';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';

export default function FormLayoutNestedLayouts() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');

  return (
    <XDSFormLayout direction="vertical">
      <XDSFormLayout direction="horizontal">
        <XDSTextInput label="First Name" value={first} onChange={setFirst} />
        <XDSTextInput label="Last Name" value={last} onChange={setLast} />
      </XDSFormLayout>
      <XDSTextInput label="Email" value={email} onChange={setEmail} />
    </XDSFormLayout>
  );
}
