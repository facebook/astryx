'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputClearable() {
  const [value, setValue] = useState<DateString | undefined>(
    '2026-04-06' as DateString,
  );

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        {value ? `Selected: ${value}` : 'No date selected'}
      </XDSText>
      <XDSDateInput
        label="Event date"
        description="Pick a date for your event"
        placeholder="Select a date"
        value={value}
        onChange={setValue}
        hasClear
      />
    </XDSStack>
  );
}
