'use client';

import {useState} from 'react';
import {XDSCalendar} from '@xds/core/Calendar';
import type {ISODateString} from '@xds/core/Calendar';

export default function CalendarShowcase() {
  const [value, setValue] = useState<ISODateString | undefined>('2026-04-15');

  return <XDSCalendar mode="single" value={value} onChange={setValue} />;
}
