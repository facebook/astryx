'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputStatuses() {
  const [error, setError] = useState<number | null>(-5);
  const [warning, setWarning] = useState<number | null>(150);
  const [success, setSuccess] = useState<number | null>(25);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 300,
      }}>
      <XDSNumberInput
        label="Error"
        value={error}
        onChange={setError}
        status={{type: 'error', message: 'Must be positive'}}
      />
      <XDSNumberInput
        label="Warning"
        value={warning}
        onChange={setWarning}
        status={{type: 'warning', message: 'Value seems high'}}
      />
      <XDSNumberInput
        label="Success"
        value={success}
        onChange={setSuccess}
        status={{type: 'success', message: 'Looks good'}}
      />
    </div>
  );
}
