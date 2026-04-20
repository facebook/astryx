'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputWithValidation() {
  const [value, setValue] = useState<string | undefined>('2026-01-25');

  return (
    <XDSDateInput
      label="Event date"
      value={value}
      onChange={setValue}
      status={{
        type: 'error',
        message: 'This date is not available',
      }}
    />
  );
}
