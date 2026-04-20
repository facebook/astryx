'use client';

import {useState} from 'react';
import {XDSCalendar, type DateRange} from '@xds/core/Calendar';

export default function CalendarRangeWithValue() {
  const [value, setValue] = useState<DateRange>({
    start: '2026-01-10',
    end: '2026-01-20',
  });
  return (
    <XDSCalendar
      mode="range"
      value={value}
      onChange={range => setValue(range)}
      focusDate="2026-01-01"
    />
  );
}
