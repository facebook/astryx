// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Stack} from '@astryxdesign/core/Layout';

export default function TextInputStates() {
  const [error, setError] = useState('sarah@');
  const [warning, setWarning] = useState('sarah_chen');
  const [success, setSuccess] = useState('https://sarahchen.dev');
  const [errorOnly, setErrorOnly] = useState('test');

  return (
    <div style={{width: 300}}>
      <Stack direction="vertical" gap={3}>
        <TextInput
          label="Error message"
          value={error}
          onChange={setError}
          placeholder="Enter a value"
          status={{
            type: 'error',
            message: 'Please enter a valid email address.',
          }}
        />
        <TextInput
          label="Warning message"
          value={warning}
          onChange={setWarning}
          placeholder="Enter a value"
          status={{
            type: 'warning',
            message: 'This username is already taken — try adding a number.',
          }}
        />
        <TextInput
          label="Success message"
          value={success}
          onChange={setSuccess}
          placeholder="Enter a value"
          status={{type: 'success', message: 'URL is valid and reachable.'}}
        />
        <TextInput
          label="Status without message"
          value={errorOnly}
          onChange={setErrorOnly}
          placeholder="Enter a value"
          status={{type: 'error'}}
        />
        <TextInput
          label="Disabled field"
          value=""
          onChange={() => {}}
          placeholder="Enter a value"
          isDisabled
        />
        <TextInput
          label="Loading field"
          value="sarahc"
          onChange={() => {}}
          isLoading
        />
      </Stack>
    </div>
  );
}
