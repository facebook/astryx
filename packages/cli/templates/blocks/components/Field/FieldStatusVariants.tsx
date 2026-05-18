// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';

export default function FieldStatusVariants() {
  const [email, setEmail] = useState('bad-email');
  const [username, setUsername] = useState('admin');
  const [apiKey, setApiKey] = useState('sk-live-abc123');

  return (
    <XDSCenter>
      <XDSVStack gap={4}>
        <XDSTextInput
          label="Email"
          description="Enter your work email"
          value={email}
          onChange={setEmail}
          status={{
            type: 'error',
            message: 'Please enter a valid email address',
          }}
        />
        <XDSTextInput
          label="Username"
          description="Choose a unique username"
          value={username}
          onChange={setUsername}
          status={{
            type: 'warning',
            message: 'This username is reserved for administrators',
          }}
        />
        <XDSTextInput
          label="API Key"
          description="Paste your API key"
          value={apiKey}
          onChange={setApiKey}
          status={{type: 'success', message: 'API key is valid and active'}}
        />
      </XDSVStack>
    </XDSCenter>
  );
}
