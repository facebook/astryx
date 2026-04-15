'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputWithPlaceholder() {
  const [age, setAge] = useState<number | null>(null);

  return (
    <XDSNumberInput
      label="Age"
      value={age}
      onChange={setAge}
      placeholder="Enter your age"
    />
  );
}
