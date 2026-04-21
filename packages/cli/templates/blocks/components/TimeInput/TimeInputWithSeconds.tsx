'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';


export default function TimeInputWithSeconds() {
  const [value, setValue] = useState('14:30:45');
  return (
    <XDSTimeInput
      label="Precise time"
      hasSeconds
      value={value as never}
      onChange={setValue as never}
    />
  );
}
