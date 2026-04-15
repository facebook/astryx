'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TimeInput24hourFormatWithClearButton() {
  const [time, setTime] = useState('09:00');

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTimeInput
      label="Meeting time"
      // @ts-expect-error migrated example
      value={time}
      // @ts-expect-error migrated example
      onChange={setTime}
      hourFormat="24h"
      hasClear
    />
  );
}
