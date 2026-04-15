'use client';

import {useState} from 'react';
import {XDSTimeInput, type XDSTimeInputProps} from '@xds/core/TimeInput';

type TimeValue = NonNullable<XDSTimeInputProps['value']>;

export default function TimeInputAsyncActionWithOptimisticUpdate() {
  const [time, setTime] = useState<TimeValue | undefined>(
    '09:00' as TimeValue,
  );

  const saveTime = async (_value: string) => {};

  return (
    <XDSTimeInput
      label="Scheduled time"
      value={time}
      onChange={setTime}
      onChangeAction={async (value) => {
        if (value != null) {
          await saveTime(value);
        }
      }}
    />
  );
}
