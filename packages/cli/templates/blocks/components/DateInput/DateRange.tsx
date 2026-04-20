'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateRange() {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <XDSDateInput
      label="Booking date"
      min="2026-01-15"
      max="2026-02-15"
      description="Available dates: Jan 15 – Feb 15, 2026"
      placeholder="Select a booking date"
      value={value}
      onChange={setValue}
    />
  );
}
