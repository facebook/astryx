// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

const pad = (n: number) => String(n).padStart(2, '0');
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const startDay = 8;
const endDay = 21;
const min = `${year}-${pad(month + 1)}-${pad(startDay)}` as DateString;
const max = `${year}-${pad(month + 1)}-${pad(endDay)}` as DateString;
const monthName = new Date(year, month, 1).toLocaleString('en-US', {
  month: 'short',
});
const description = `Available dates: ${monthName} ${startDay} – ${endDay}, ${year}`;

export default function DateInputDateRange() {
  const [value, setValue] = useState<DateString | undefined>(undefined);

  return (
    <XDSStack direction="vertical" gap={4} width="100%" style={{maxWidth: 400}}>
      <XDSText type="supporting" color="secondary">
        {value ? `Booked: ${value}` : 'Pick a date in the available range'}
      </XDSText>
      <XDSDateInput
        label="Booking date"
        min={min}
        max={max}
        description={description}
        placeholder="Select a booking date"
        value={value}
        onChange={setValue}
      />
    </XDSStack>
  );
}
