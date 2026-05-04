'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSVStack} from '@xds/core/Stack';

export default function NumberInputStatuses() {
  const [error, setError] = useState<number | null>(-5);
  const [warning, setWarning] = useState<number | null>(150);
  const [success, setSuccess] = useState<number | null>(25);
  return (
    <div style={{width: 300}}>
      <XDSVStack gap={4}>
        <XDSNumberInput
          label="Budget"
          value={error}
          onChange={setError}
          status={{type: 'error', message: 'Must be a positive amount'}}
        />
        <XDSNumberInput
          label="Headcount"
          value={warning}
          onChange={setWarning}
          status={{type: 'warning', message: 'Exceeds typical team size'}}
        />
        <XDSNumberInput
          label="Completion"
          units="%"
          value={success}
          onChange={setSuccess}
          status={{type: 'success', message: 'On track'}}
        />
      </XDSVStack>
    </div>
  );
}
