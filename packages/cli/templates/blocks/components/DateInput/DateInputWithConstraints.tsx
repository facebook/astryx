'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import type {ISODateString} from '@xds/core/Calendar';

export default function DateInputWithConstraints() {
  const [date, setDate] = useState<ISODateString | undefined>(undefined);

  return (
    <XDSDateInput
      label="Departure date"
      value={date}
      onChange={setDate}
      min={'2026-01-01' as const}
      max={'2026-12-31' as const}
      placeholder="Pick a date"
    />
  );
}
