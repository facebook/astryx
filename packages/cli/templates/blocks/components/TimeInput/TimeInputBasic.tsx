'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TimeInputBasic() {
  const [time, setTime] = useState('09:00');

  return (
    <XDSTimeInput
      label="Start time"
      value={time}
      onChange={setTime}
    />
  );
}
