'use client';

import {useState} from 'react';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';

export default function FormLayoutVerticalLayout() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <XDSFormLayout>
      <XDSTextInput label="Name" value={name} onChange={setName} />
      <XDSTextInput label="Email" value={email} onChange={setEmail} />
    </XDSFormLayout>
  );
}
