'use client';

import {XDSCalendar} from '@xds/core/Calendar';
import {useState} from 'react';

export default function CalendarRangeSelection() {
  const [value, setValue] = useState({start: '2026-01-28', end: '2026-02-05'});
  return (
    <XDSCalendar
      mode="range"
      value={value}
      onChange={(range) => setValue(range)}
    />
  );
}
