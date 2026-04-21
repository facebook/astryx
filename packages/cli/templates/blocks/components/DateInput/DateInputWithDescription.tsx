'use client';

import {useState} from 'react';

type DateString = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputWithDescription() {
  const [value, setValue] = useState<DateString | undefined>(undefined);

  return (
    <XDSDateInput
      label="Birthday"
      description="Enter your date of birth"
      placeholder="Select your birthday"
      value={value}
      onChange={setValue}
    />
  );
}
