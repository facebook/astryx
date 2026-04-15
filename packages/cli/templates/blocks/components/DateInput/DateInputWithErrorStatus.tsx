'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputWithErrorStatus() {
  const [date, setDate] = useState<string | undefined>(undefined);

  return (
    <XDSDateInput
      label="Event date"
      value={date}
      onChange={setDate}
      status={{
        type: 'error',
        message: 'This date is not available',
      }}
    />
  );
}
