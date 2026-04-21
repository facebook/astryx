'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputWithValidation() {
  const [value, setValue] = useState<DateString | undefined>(
    '2026-01-25' as DateString,
  );

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Validation status shown below the input
      </XDSText>
      <XDSDateInput
        label="Event date"
        placeholder="Select a date"
        value={value}
        onChange={setValue}
        status={{
          type: 'error',
          message: 'This date is already booked',
        }}
      />
    </XDSStack>
  );
}
