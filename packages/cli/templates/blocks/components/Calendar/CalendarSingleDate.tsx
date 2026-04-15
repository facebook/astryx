'use client';

import {XDSCalendar, type ISODateString} from '@xds/core/Calendar';
import {useState} from 'react';

export default function CalendarSingleDate() {
  const [value, setValue] = useState<ISODateString>('2026-01-28' as const);
  return (
    <XDSCalendar
      value={value}
      onChange={(newValue) => setValue(newValue)}
    />
  );
}
