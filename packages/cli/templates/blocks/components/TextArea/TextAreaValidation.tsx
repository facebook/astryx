'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSStack} from '@xds/core/Layout';

export default function TextAreaValidation() {
  const [errorValue, setErrorValue] = useState('Fix the');
  const [warningValue, setWarningValue] = useState('Summarize the Q2 results');
  const [successValue, setSuccessValue] = useState(
    'Redesign the onboarding flow to reduce drop-off by 15% in Q3. Focus on simplifying the account creation step and adding a progress indicator.',
  );

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSTextArea
        label="Error message"
        value={errorValue}
        onChange={setErrorValue}
        status={{
          type: 'error',
          message: 'Description must be at least 20 characters.',
        }}
      />
      <XDSTextArea
        label="Warning message"
        value={warningValue}
        onChange={setWarningValue}
        status={{
          type: 'warning',
          message: 'Consider adding more detail for clarity.',
        }}
      />
      <XDSTextArea
        label="Success message"
        value={successValue}
        onChange={setSuccessValue}
        status={{
          type: 'success',
          message: 'Looks good — clear and actionable.',
        }}
      />
    </XDSStack>
  );
}
