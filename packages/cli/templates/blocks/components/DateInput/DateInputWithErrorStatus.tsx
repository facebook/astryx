'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputWithErrorStatus() {
  const [date, setDate] = useState<string | undefined>(undefined);

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSDateInput
      label="Event date"
      // @ts-expect-error migrated example
      value={date}
      onChange={setDate}
      status={{
        type: 'error',
        message: 'This date is not available',
      }}
    />
  );
}
