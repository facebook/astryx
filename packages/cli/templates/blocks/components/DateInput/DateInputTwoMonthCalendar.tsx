'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputTwoMonthCalendar() {
  const [date, setDate] = useState<string | undefined>(undefined);

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSDateInput
      label="Check-in date"
      // @ts-expect-error migrated example
      value={date}
      onChange={setDate}
      numberOfMonths={2}
    />
  );
}
