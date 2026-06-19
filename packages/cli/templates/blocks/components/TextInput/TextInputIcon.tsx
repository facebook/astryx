// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TextInput} from '@xds/core/TextInput';
import {Stack} from '@xds/core/Layout';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function TextInputIcon() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{width: 300}}>
      <Stack direction="vertical" gap={3}>
        <TextInput
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Sarah Chen"
          startIcon={UserIcon}
        />
        <TextInput
          type="email"
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="sarah@company.com"
          startIcon={EnvelopeIcon}
        />
        <TextInput
          type="password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          startIcon={LockClosedIcon}
        />
      </Stack>
    </div>
  );
}
