'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';


export default function TimeInputTwentyFourHour() {
  const [value, setValue] = useState('14:30');
  return (
    <XDSTimeInput
      label="Time (24h)"
      hourFormat="24h"
      value={value as never}
      onChange={setValue as never}
    />
  );
}
