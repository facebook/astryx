'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function FieldRequired() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  return (
    <XDSVStack gap={4}>
      <XDSText type="supporting" color="secondary">
        Required fields show a visual indicator next to the label
      </XDSText>
      <XDSTextInput
        label="Username"
        isRequired
        value={username}
        onChange={setUsername}
        placeholder="Enter your username"
      />
      <XDSTextInput
        label="Backup email"
        isOptional
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
      />
    </XDSVStack>
  );
}
