'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TimeInputMinMaxConstraints() {
  const [time, setTime] = useState('09:00');

  return (
    <XDSTimeInput
      label="Business hours"
      value={time}
      onChange={setTime}
      min="09:00"
      max="17:00"
    />
  );
}
