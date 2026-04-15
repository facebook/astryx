'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TimeInputBasic() {
  const [time, setTime] = useState('09:00');

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTimeInput
      label="Start time"
      // @ts-expect-error migrated example
      value={time}
      // @ts-expect-error migrated example
      onChange={setTime}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: TimeInputBasic,
};
