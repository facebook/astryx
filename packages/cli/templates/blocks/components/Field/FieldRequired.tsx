// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';

export default function FieldRequired() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  return (
    <XDSCenter>
      <XDSVStack gap={4}>
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
    </XDSCenter>
  );
}
