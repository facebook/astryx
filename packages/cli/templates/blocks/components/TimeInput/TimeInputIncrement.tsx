// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';
import {XDSStack} from '@xds/core/Layout';

export default function TimeInputIncrement() {
  const [slot, setSlot] = useState('09:00');

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSTimeInput
        label="Appointment slot"
        increment={15}
        description="Use arrow keys to change by 15 minutes"
        value={slot as never}
        onChange={setSlot as never}
        hasClear
      />
    </XDSStack>
  );
}
