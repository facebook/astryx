'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function WithMinMax() {
  const [value, setValue] = useState(undefined);
  return (
    <XDSTimeInput
      label="Appointment time"
      min="09:00"
      max="17:00"
      description="Business hours: 9 AM – 5 PM"
      placeholder="Select appointment time"
      value={value}
      onChange={setValue}
    />
  );
}
