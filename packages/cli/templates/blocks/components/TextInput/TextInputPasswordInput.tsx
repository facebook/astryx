'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputPasswordInput() {
  const [value, setValue] = useState('');
  return (
    <XDSTextInput
      type="password"
      label="Password"
      value={value}
      onChange={setValue}
      placeholder="Enter your password"
    />
  );
}
