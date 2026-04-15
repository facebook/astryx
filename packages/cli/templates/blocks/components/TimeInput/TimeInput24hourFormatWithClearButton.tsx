'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TimeInput24hourFormatWithClearButton() {
  const [time, setTime] = useState('09:00');

  return (
    <XDSTimeInput
      label="Meeting time"
      value={time}
      onChange={setTime}
      hourFormat="24h"
      hasClear
    />
  );
}
