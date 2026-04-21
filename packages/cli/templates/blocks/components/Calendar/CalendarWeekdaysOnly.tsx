'use client';

import {useState} from 'react';
import {XDSCalendar, type ISODateString} from '@xds/core/Calendar';

export default function CalendarWeekdaysOnly() {
  const [value, setValue] = useState<ISODateString | undefined>(undefined);

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  return (
    <XDSCalendar
      mode="single"
      dateConstraints={[isWeekday]}
      value={value}
      onChange={val => setValue(val)}
      focusDate="2026-01-01"
    />
  );
}
