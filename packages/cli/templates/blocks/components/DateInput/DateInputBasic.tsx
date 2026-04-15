'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputBasic() {
  const [date, setDate] = useState<string | undefined>(undefined);

  // @ts-expect-error migrated example
  return <XDSDateInput label="Event date" value={date} onChange={setDate} />;
}
