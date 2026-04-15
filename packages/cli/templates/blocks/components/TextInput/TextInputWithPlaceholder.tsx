'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputWithPlaceholder() {
  const [email, setEmail] = useState('');

  return (
    <XDSTextInput label="Email" value={email} onChange={setEmail} placeholder="email@example.com" />
  );
}
