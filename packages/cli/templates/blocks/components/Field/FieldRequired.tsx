'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function FieldRequired() {
  const [value, setValue] = useState('');
  return (
    <div style={{maxWidth: 320}}>
      <XDSTextInput
        label="Username"
        isRequired
        value={value}
        onChange={setValue}
        placeholder="Enter your username"
      />
    </div>
  );
}
