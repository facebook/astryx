'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import type {ISODateString} from '@xds/core/Calendar';

export default function DateInputBasic() {
  const [date, setDate] = useState<ISODateString | undefined>(undefined);

  return <XDSDateInput label="Event date" value={date} onChange={setDate} />;
}
