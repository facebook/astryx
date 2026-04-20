'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputWithValidation() {
  const [value, setValue] = useState('');

  const getStatus = () => {
    if (value.length === 0) return undefined;
    if (!value.includes('@')) {
      return {
        type: 'error' as const,
        message: 'Please enter a valid email address',
      };
    }
    return {type: 'success' as const, message: 'Email looks good!'};
  };

  return (
    <XDSTextInput
      label="Email"
      value={value}
      onChange={setValue}
      placeholder="Enter your email"
      status={getStatus()}
    />
  );
}
