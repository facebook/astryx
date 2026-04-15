'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputIntegerOnly() {
  const [count, setCount] = useState<number | null>(0);

  return (
    <XDSNumberInput
      label="Count"
      value={count}
      onChange={setCount}
      isIntegerOnly
    />
  );
}
