'use client';

import {XDSCalendar, type DateRange} from '@xds/core/Calendar';
import {useState} from 'react';

export default function CalendarRangeSelection() {
  const [value, setValue] = useState<DateRange>({
    start: '2026-01-28' as const,
    end: '2026-02-05' as const,
  });
  return (
    <XDSCalendar
      mode="range"
      value={value}
      onChange={(range) => setValue(range)}
    />
  );
}
