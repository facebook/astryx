'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputClearable() {
  const [value, setValue] = useState<string | undefined>('2026-04-06');

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
