'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import type {ISODateString} from '@xds/core/Calendar';

export default function DateInputWithDescriptionAndRequired() {
  const [date, setDate] = useState<ISODateString | undefined>(undefined);

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
