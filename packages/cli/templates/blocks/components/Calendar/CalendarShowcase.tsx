'use client';

import {useState} from 'react';
import {XDSCalendar} from '@xds/core/Calendar';

export default function CalendarShowcase() {
  const [value, setValue] = useState('2026-04-15');

  return <XDSCalendar mode="single" value={value} onChange={setValue} />;
}
