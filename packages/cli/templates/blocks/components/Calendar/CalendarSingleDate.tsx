'use client';

import {XDSCalendar} from '@xds/core/Calendar';
import {useState} from 'react';

export default function CalendarSingleDate() {
  const [value, setValue] = useState('2026-01-28');
  return (
    <XDSCalendar
      value={value}
      onChange={(newValue) => setValue(newValue)}
    />
  );
}
