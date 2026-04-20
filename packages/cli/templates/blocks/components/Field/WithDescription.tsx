'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function FieldWithDescription() {
  const [value, setValue] = useState('');
  return (
    <div style={{maxWidth: 320}}>
      <XDSTextInput
        label="Email"
        description="We'll never share your email."
        value={value}
        onChange={setValue}
        placeholder="you@example.com"
      />
    </div>
  );
}
