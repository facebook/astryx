'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TimeInputMinMaxConstraints() {
  const [time, setTime] = useState('09:00');

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTimeInput
      label="Business hours"
      // @ts-expect-error migrated example
      value={time}
      // @ts-expect-error migrated example
      onChange={setTime}
      // @ts-expect-error migrated example
      min="09:00"
      // @ts-expect-error migrated example
      max="17:00"
    />
  );
}
