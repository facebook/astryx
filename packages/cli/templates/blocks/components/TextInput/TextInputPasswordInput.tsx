'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputPasswordInput() {
  const [password, setPassword] = useState('');

  return (
    <XDSTextInput type="password" label="Password" value={password} onChange={setPassword} />
  );
}
