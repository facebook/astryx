// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {VStack} from '@astryxdesign/core/Stack';

export default function NumberInputStatuses() {
  const [error, setError] = useState<number | null>(-5);
  const [warning, setWarning] = useState<number | null>(150);
  const [success, setSuccess] = useState<number | null>(25);
  return (
    <div style={{width: 300}}>
      <VStack gap={4}>
        <NumberInput
          label="Budget"
          value={error}
          onChange={setError}
          status={{type: 'error', message: 'Must be a positive amount'}}
        />
        <NumberInput
          label="Headcount"
          value={warning}
          onChange={setWarning}
          status={{type: 'warning', message: 'Exceeds typical team size'}}
        />
        <NumberInput
          label="Completion"
          units="%"
          value={success}
          onChange={setSuccess}
          status={{type: 'success', message: 'On track'}}
        />
      </VStack>
    </div>
  );
}
