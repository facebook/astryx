'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

type DateString = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputPrefilledDate() {
  const [value, setValue] = useState<DateString | undefined>('2026-01-25' as DateString);

  return <XDSDateInput label="Event date" value={value} onChange={setValue} />;
}
