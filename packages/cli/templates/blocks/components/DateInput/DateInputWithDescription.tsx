'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';

export default function DateInputWithDescription() {
  const [value, setValue] = useState<string | undefined>(undefined);

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
