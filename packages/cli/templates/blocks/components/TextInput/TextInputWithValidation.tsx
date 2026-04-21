'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TextInputWithValidation() {
  const [email, setEmail] = useState('sarah@');
  const [username, setUsername] = useState('sarah_chen');
  const [website, setWebsite] = useState('https://sarahchen.dev');

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        All three validation states with messages
      </XDSText>
      <XDSStack direction="vertical" gap={3}>
        <XDSTextInput
          type="email"
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          status={{type: 'error', message: 'Please enter a valid email address.'}}
          isRequired
        />
        <XDSTextInput
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="Choose a username"
          status={{type: 'warning', message: 'This username is already taken — try adding a number.'}}
        />
        <XDSTextInput
          label="Website"
          value={website}
          onChange={setWebsite}
          placeholder="https://example.com"
          status={{type: 'success', message: 'URL is valid and reachable.'}}
        />
      </XDSStack>
    </XDSStack>
  );
}
