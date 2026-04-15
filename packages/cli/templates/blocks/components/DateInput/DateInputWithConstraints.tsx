'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputWithConstraints() {
  const [date, setDate] = useState<string | undefined>(undefined);

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSDateInput
      label="Departure date"
      // @ts-expect-error migrated example
      value={date}
      onChange={setDate}
      min="2026-01-01"
      max="2026-12-31"
      placeholder="Pick a date"
    />
  );
}
