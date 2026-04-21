'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

export default function TextInputWithIcon() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState('');

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSTextInput
        label="Full name"
        value={name}
        onChange={setName}
        placeholder="Sarah Chen"
        startIcon={UserIcon}
      />
      <XDSTextInput
        type="email"
        label="Email"
        value={email}
        onChange={setEmail}
        placeholder="sarah@company.com"
        startIcon={EnvelopeIcon}
      />
      <XDSTextInput
        type="password"
        label="Password"
        value={password}
        onChange={setPassword}
        placeholder="Enter your password"
        startIcon={LockClosedIcon}
      />
      <XDSTextInput
        label="Website"
        value={website}
        onChange={setWebsite}
        placeholder="https://example.com"
        startIcon={GlobeAltIcon}
      />
    </XDSStack>
  );
}
