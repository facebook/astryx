'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';


export default function TimeInputWithError() {
  const [value, setValue] = useState('22:00');
  return (
    <XDSTimeInput
      label="Event time"
      value={value as never}
      onChange={setValue as never}
      status={{
        type: 'error',
        message: 'Time must be during business hours',
      }}
    />
  );
}
