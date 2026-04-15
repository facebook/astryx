'use client';

import {XDSCalendar} from '@xds/core/Calendar';

export default function CalendarTwoMonths() {
  return (
    <XDSCalendar
      numberOfMonths={2}
      min="2026-01-01"
      max="2026-12-31"
      weekStartsOn={1}
    />
  );
}
