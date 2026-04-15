'use client';

import {useState} from 'react';
import {XDSTimeInput, type XDSTimeInputProps} from '@xds/core/TimeInput';

type TimeValue = NonNullable<XDSTimeInputProps['value']>;

export default function TimeInputBasic() {
  const [time, setTime] = useState<TimeValue | undefined>(
    '09:00' as TimeValue,
  );

  return (
    <XDSTimeInput label="Start time" value={time} onChange={setTime} />
  );
}
