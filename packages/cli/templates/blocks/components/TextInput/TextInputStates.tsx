'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';

export default function TextInputStates() {
  const [name, setName] = useState('Sarah Chen');
  const [password, setPassword] = useState('hunter42');
  const [email, setEmail] = useState('sarah@example.com');

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSTextInput
        label="Full name"
        value={name}
        onChange={setName}
        placeholder="Enter your name"
      />
      <XDSTextInput
        type="password"
        label="Password"
        value={password}
        onChange={setPassword}
        placeholder="Enter your password"
      />
      <XDSTextInput
        type="email"
        label="Email address"
        value={email}
        onChange={setEmail}
        placeholder="you@company.com"
      />
      <XDSTextInput
        label="Full name (disabled)"
        value="Sarah Chen"
        onChange={() => {}}
        isDisabled
      />
      <XDSTextInput
        label="Username (loading)"
        value="sarahc"
        onChange={() => {}}
        isLoading
      />
    </XDSStack>
  );
}
