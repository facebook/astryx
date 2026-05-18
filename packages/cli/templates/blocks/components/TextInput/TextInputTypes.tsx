// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';

export default function TextInputTypes() {
  const [password, setPassword] = useState('hunter42');
  const [email, setEmail] = useState('sarah@example.com');
  const [tooltip, setTooltip] = useState('');
  const [required, setRequired] = useState('');
  const [optional, setOptional] = useState('');
  const [described, setDescribed] = useState('');

  return (
    <div style={{width: 300}}>
      <XDSStack direction="vertical" gap={3}>
        <XDSTextInput
          label="Default field"
          value={described}
          onChange={setDescribed}
          placeholder="Enter your email"
          description="Descriptions can be used to provide additional information about a field."
        />
        <XDSTextInput
          type="password"
          label="Password field"
          value={password}
          onChange={setPassword}
          placeholder="Enter a value"
        />
        <XDSTextInput
          type="email"
          label="Email field"
          value={email}
          onChange={setEmail}
          placeholder="Enter a value"
        />
        <XDSTextInput
          label="Field tooltip"
          value={tooltip}
          onChange={setTooltip}
          placeholder="Enter your API key"
          labelTooltip="Your unique API key for authentication. Keep this secret!"
        />
        <XDSTextInput
          label="Required field"
          value={required}
          onChange={setRequired}
          placeholder="Enter your username"
          isRequired
        />
        <XDSTextInput
          label="Optional field"
          value={optional}
          onChange={setOptional}
          placeholder="Enter your nickname"
          isOptional
        />
      </XDSStack>
    </div>
  );
}
