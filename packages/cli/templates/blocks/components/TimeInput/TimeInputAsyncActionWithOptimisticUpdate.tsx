'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TimeInputAsyncActionWithOptimisticUpdate() {
  const [time, setTime] = useState('09:00');

  return (
    <XDSTimeInput
      label="Scheduled time"
      value={time}
      onChange={setTime}
      onChangeAction={async (value) => {
        await saveTime(value);
      }}
    />
  );
}
