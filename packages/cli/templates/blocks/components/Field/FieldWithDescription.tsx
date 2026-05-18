// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';

export default function FieldWithDescription() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <XDSCenter>
      <XDSVStack gap={4}>
        <XDSTextInput
          label="Email"
          description="We'll send a confirmation link to this address"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />
        <XDSTextInput
          label="Password"
          description="At least 8 characters with one uppercase letter"
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
        />
      </XDSVStack>
    </XDSCenter>
  );
}
