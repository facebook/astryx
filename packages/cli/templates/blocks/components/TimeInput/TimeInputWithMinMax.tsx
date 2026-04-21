'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';


export default function TimeInputWithMinMax() {
  const [value, setValue] = useState(undefined);
  return (
    <XDSTimeInput
      label="Appointment time"
      min={'09:00' as never}
      max={'17:00' as never}
      description="Business hours: 9 AM – 5 PM"
      placeholder="Select appointment time"
      value={value as never}
      onChange={setValue as never}
    />
  );
}
