'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputWithDescriptionAndRequired() {
  const [date, setDate] = useState<string | undefined>(undefined);

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSDateInput
      label="Due date"
      description="When should this task be completed?"
      isRequired
      // @ts-expect-error migrated example
      value={date}
      onChange={setDate}
    />
  );
}
