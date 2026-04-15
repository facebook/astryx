'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputTwoMonthCalendar() {
  const [date, setDate] = useState<string | undefined>(undefined);

  return (
    <XDSDateInput
      label="Check-in date"
      value={date}
      onChange={setDate}
      numberOfMonths={2}
    />
  );
}
