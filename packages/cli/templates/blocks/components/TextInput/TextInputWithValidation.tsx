'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';

export default function TextInputWithValidation() {
  const [email, setEmail] = useState('sarah@');
  const [username, setUsername] = useState('sarah_chen');
  const [website, setWebsite] = useState('https://sarahchen.dev');

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSTextInput
        type="email"
        label="Email (error)"
        value={email}
        onChange={setEmail}
        placeholder="you@company.com"
        status={{type: 'error', message: 'Please enter a valid email address.'}}
      />
      <XDSTextInput
        label="Username (warning)"
        value={username}
        onChange={setUsername}
        placeholder="Choose a username"
        status={{type: 'warning', message: 'This username is already taken — try adding a number.'}}
      />
      <XDSTextInput
        label="Website (success)"
        value={website}
        onChange={setWebsite}
        placeholder="https://example.com"
        status={{type: 'success', message: 'URL is valid and reachable.'}}
      />
    </XDSStack>
  );
}
