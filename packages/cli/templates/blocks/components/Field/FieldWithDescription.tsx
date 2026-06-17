// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TextInput} from '@xds/core/TextInput';
import {VStack} from '@xds/core/Layout';
import {Center} from '@xds/core/Center';

export default function FieldWithDescription() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Center>
      <VStack gap={4}>
        <TextInput
          label="Email"
          description="We'll send a confirmation link to this address"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />
        <TextInput
          label="Password"
          description="At least 8 characters with one uppercase letter"
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
        />
      </VStack>
    </Center>
  );
}
