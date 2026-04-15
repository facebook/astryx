'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputWithValidationStatus() {
  const [age, setAge] = useState<number | null>(150);

  return (
    <XDSNumberInput
      label="Age"
      value={age}
      onChange={setAge}
      status={{type: 'error', message: 'Age must be between 18 and 120'}}
    />
  );
}
