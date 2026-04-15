'use client';

import {XDSCalendar} from '@xds/core/Calendar';
import {useState} from 'react';

export default function CalendarRangeSelection() {
  const [value, setValue] = useState({start: '2026-01-28', end: '2026-02-05'});
  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSCalendar
      mode="range"
      // @ts-expect-error migrated example
      value={value}
      onChange={(range) => setValue(range)}
    />
  );
}

export const showcase = {
  aspectRatio: 3 / 4,
  render: CalendarRangeSelection,
};
