'use client';

import {useState} from 'react';
import {XDSCalendar, type ISODateString} from '@xds/core/Calendar';

export default function CalendarTwoMonths() {
  const [value, setValue] = useState<ISODateString | undefined>(undefined);
  return (
    <XDSCalendar
      mode="single"
      numberOfMonths={2}
      value={value}
      onChange={val => setValue(val)}
      focusDate="2026-01-01"
    />
  );
}
