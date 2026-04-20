'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TwentyFourHour() {
  const [value, setValue] = useState('14:30');
  return (
    <XDSTimeInput
      label="Time (24h)"
      hourFormat="24h"
      value={value}
      onChange={setValue}
    />
  );
}
