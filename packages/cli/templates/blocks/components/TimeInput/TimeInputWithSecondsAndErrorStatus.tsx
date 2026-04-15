'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TimeInputWithSecondsAndErrorStatus() {
  const [time, setTime] = useState('09:00');

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
