'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';

export default function TimeInputAsyncActionWithOptimisticUpdate() {
  const [time, setTime] = useState('09:00');

  const saveTime = async (_value: string) => {};

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTimeInput
      label="Scheduled time"
      // @ts-expect-error migrated example
      value={time}
      // @ts-expect-error migrated example
      onChange={setTime}
      onChangeAction={async (value) => {
        // @ts-expect-error migrated example
        await saveTime(value);
      }}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: TimeInputAsyncActionWithOptimisticUpdate,
};
