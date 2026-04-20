'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function BasicTextInput() {
  const [value, setValue] = useState('');
  return (
    <XDSTextInput
      label="Email"
      description="We'll never share your email with anyone."
      value={value}
      onChange={setValue}
      placeholder="Enter your email"
    />
  );
}
