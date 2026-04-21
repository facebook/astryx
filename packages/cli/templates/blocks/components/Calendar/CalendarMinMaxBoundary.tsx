'use client';

import {useState} from 'react';
import {XDSCalendar, type ISODateString} from '@xds/core/Calendar';

export default function CalendarMinMaxBoundary() {
  const [value, setValue] = useState<ISODateString | undefined>(undefined);
  return (
    <XDSCalendar
      mode="single"
      min={'2026-01-10' as ISODateString}
      max={'2026-03-20' as ISODateString}
      value={value}
      onChange={val => setValue(val)}
      focusDate={'2026-01-01' as ISODateString}
    />
  );
}
