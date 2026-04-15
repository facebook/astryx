'use client';

import {useState} from 'react';
import {XDSTimeInput, type XDSTimeInputProps} from '@xds/core/TimeInput';

type TimeValue = NonNullable<XDSTimeInputProps['value']>;

export default function TimeInputWithSecondsAndErrorStatus() {
  const [time, setTime] = useState<TimeValue | undefined>(
    '09:00' as TimeValue,
  );

  return (
    <XDSTimeInput
      label="Precise time"
      value={time}
      onChange={setTime}
      hasSeconds
      status={{type: 'error', message: 'Invalid time'}}
    />
  );
}
