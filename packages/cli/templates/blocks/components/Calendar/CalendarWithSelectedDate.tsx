'use client';

import {useState} from 'react';
import {XDSCalendar, type ISODateString} from '@xds/core/Calendar';

export default function CalendarWithSelectedDate() {
  const [value, setValue] = useState<ISODateString>('2026-01-15');
  return (
    <XDSCalendar
      mode="single"
      value={value}
      onChange={val => setValue(val)}
      focusDate="2026-01-01"
    />
  );
}
