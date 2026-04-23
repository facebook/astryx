'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';

export default function TextInputStates() {
  const [error, setError] = useState('sarah@');
  const [warning, setWarning] = useState('sarah_chen');
  const [success, setSuccess] = useState('https://sarahchen.dev');
  const [errorOnly, setErrorOnly] = useState('test');

  return (
    <div style={{width: 300}}>
      <XDSStack direction="vertical" gap={3}>
        <XDSTextInput
          label="Error message"
          value={error}
          onChange={setError}
          placeholder="Enter a value"
          status={{
            type: 'error',
            message: 'Please enter a valid email address.',
          }}
        />
        <XDSTextInput
          label="Warning message"
          value={warning}
          onChange={setWarning}
          placeholder="Enter a value"
          status={{
            type: 'warning',
            message: 'This username is already taken — try adding a number.',
          }}
        />
        <XDSTextInput
          label="Success message"
          value={success}
          onChange={setSuccess}
          placeholder="Enter a value"
          status={{type: 'success', message: 'URL is valid and reachable.'}}
        />
        <XDSTextInput
          label="Status without message"
          value={errorOnly}
          onChange={setErrorOnly}
          placeholder="Enter a value"
          status={{type: 'error'}}
        />
        <XDSTextInput
          label="Disabled field"
          value=""
          onChange={() => {}}
          placeholder="Enter a value"
          isDisabled
        />
        <XDSTextInput
          label="Loading field"
          value="sarahc"
          onChange={() => {}}
          isLoading
        />
      </XDSStack>
    </div>
  );
}
