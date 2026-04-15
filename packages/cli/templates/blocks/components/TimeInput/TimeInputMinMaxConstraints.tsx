'use client';

import {useState} from 'react';
import {XDSTimeInput, type XDSTimeInputProps} from '@xds/core/TimeInput';

type TimeValue = NonNullable<XDSTimeInputProps['value']>;

export default function TimeInputMinMaxConstraints() {
  const [time, setTime] = useState<TimeValue | undefined>(
    '09:00' as TimeValue,
  );

  return (
    <XDSTimeInput
      label="Business hours"
      value={time}
      onChange={setTime}
      min={'09:00' as TimeValue}
      max={'17:00' as TimeValue}
    />
  );
}
