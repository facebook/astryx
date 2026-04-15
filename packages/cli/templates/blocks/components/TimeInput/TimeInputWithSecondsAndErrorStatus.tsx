'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TimeInputWithSecondsAndErrorStatus() {
  const [time, setTime] = useState('09:00');

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTimeInput
      label="Precise time"
      // @ts-expect-error migrated example
      value={time}
      // @ts-expect-error migrated example
      onChange={setTime}
      hasSeconds
      status={{type: 'error', message: 'Invalid time'}}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: TimeInputWithSecondsAndErrorStatus,
};
