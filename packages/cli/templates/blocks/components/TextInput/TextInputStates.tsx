'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TextInputStates() {
  const [name, setName] = useState('Sarah Chen');
  const [password, setPassword] = useState('hunter42');
  const [email, setEmail] = useState('sarah@example.com');

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Default
        </XDSText>
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
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Disabled
        </XDSText>
        <XDSStack direction="vertical" gap={3}>
          <XDSTextInput
            label="Full name"
            value="Sarah Chen"
            onChange={() => {}}
            isDisabled
          />
          <XDSTextInput
            type="password"
            label="Password"
            value="hunter42"
            onChange={() => {}}
            isDisabled
          />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Loading
        </XDSText>
        <XDSTextInput
          label="Username"
          value="sarahc"
          onChange={() => {}}
          isLoading
          description="Checking availability…"
        />
      </XDSStack>
    </XDSStack>
  );
}
