'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';

export default function TextInputStates() {
  const [text, setText] = useState('Sarah Chen');
  const [password, setPassword] = useState('hunter42');
  const [email, setEmail] = useState('sarah@example.com');

  return (
    <div style={{width: 300}}>
      <XDSStack direction="vertical" gap={3}>
        <XDSTextInput
          label="Default field"
          value={text}
          onChange={setText}
          placeholder="Enter a value"
        />
        <XDSTextInput
          type="password"
          label="Password field"
          value={password}
          onChange={setPassword}
          placeholder="Enter a value"
        />
        <XDSTextInput
          type="email"
          label="Email field"
          value={email}
          onChange={setEmail}
          placeholder="Enter a value"
        />
        <XDSTextInput
          label="Disabled field"
          value=""
          onChange={() => {}}
          placeholder="Enter a value"
          isDisabled
        />
        <XDSTextInput
          label="Loading field"
          value="sarahc"
          onChange={() => {}}
          isLoading
        />
      </XDSStack>
    </div>
  );
}
