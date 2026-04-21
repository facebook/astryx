'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputDateRange() {
  const [value, setValue] = useState<DateString | undefined>(undefined);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        {value ? `Booked: ${value}` : 'Pick a date in the available range'}
      </XDSText>
      <XDSDateInput
        label="Booking date"
        min="2026-01-15"
        max="2026-02-15"
        description="Available dates: Jan 15 – Feb 15, 2026"
        placeholder="Select a booking date"
        value={value}
        onChange={setValue}
      />
    </XDSStack>
  );
}
