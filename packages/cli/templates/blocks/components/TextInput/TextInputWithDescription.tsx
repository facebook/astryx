'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputWithDescription() {
  const [email, setEmail] = useState('');

  return (
    <XDSTextInput
      label="Email"
      description="We'll never share your email"
      value={email}
      onChange={setEmail}
    />
  );
}
