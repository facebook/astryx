'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';
import {XDSStack} from '@xds/core/Layout';

export default function TimeInputConstrained() {
  const [evening, setEvening] = useState(undefined);

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSTimeInput
        label="Dinner reservation"
        min={'17:00' as never}
        max={'22:00' as never}
        description="Evening seating: 5 PM – 10 PM"
        placeholder="Select reservation time"
        value={evening as never}
        onChange={setEvening as never}
        hasClear
      />
    </XDSStack>
  );
}
