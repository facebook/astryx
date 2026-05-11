'use client';

import {useState} from 'react';
import {XDSTimeInput, type ISOTimeString} from '@xds/core/TimeInput';

export default function TimeInputShowcase() {
  const [time, setTime] = useState<ISOTimeString | undefined>(undefined);
  return (
    <XDSTimeInput
      label="Time"
      placeholder="Select a time"
      value={time}
      onChange={setTime}
    />
  );
}
