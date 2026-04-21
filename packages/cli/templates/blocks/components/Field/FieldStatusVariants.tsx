'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function FieldStatusVariants() {
  const [email, setEmail] = useState('bad-email');
  const [username, setUsername] = useState('admin');
  const [apiKey, setApiKey] = useState('valid-user');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 400,
      }}>
      <XDSTextInput
        label="Email"
        description="Enter your work email"
        value={email}
        onChange={setEmail}
        status={{type: 'error', message: 'Please enter a valid email address'}}
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
    </div>
  );
}
