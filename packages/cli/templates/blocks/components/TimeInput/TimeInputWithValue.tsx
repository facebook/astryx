'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';


export default function TimeInputWithValue() {
  const [value, setValue] = useState('14:30');
  return (
    <XDSTimeInput
      label="Meeting time"
      value={value as never}
      onChange={setValue as never}
    />
  );
}
