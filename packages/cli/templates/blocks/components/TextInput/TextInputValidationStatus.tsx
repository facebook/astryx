'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputValidationStatus() {
  const [email, setEmail] = useState('');

  return (
    <XDSTextInput
      label="Email"
      value={email}
      onChange={setEmail}
      status={{type: 'error', message: 'Invalid email address'}}
    />
  );
}
