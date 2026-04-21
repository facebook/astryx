'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

type DateString = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputClearable() {
  const [value, setValue] = useState<DateString | undefined>('2026-04-06' as DateString);

  return (
    <XDSDateInput
      label="Event date"
      placeholder="Select a date"
      value={value}
      onChange={setValue}
      hasClear
    />
  );
}
