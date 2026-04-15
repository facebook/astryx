'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputWithDescriptionAndRequired() {
  const [date, setDate] = useState<string | undefined>(undefined);

  return (
    <XDSDateInput
      label="Due date"
      description="When should this task be completed?"
      isRequired
      value={date}
      onChange={setDate}
    />
  );
}
