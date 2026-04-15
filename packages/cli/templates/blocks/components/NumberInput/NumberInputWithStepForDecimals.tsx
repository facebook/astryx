'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputWithStepForDecimals() {
  const [price, setPrice] = useState<number | null>(0);

  return (
    <XDSNumberInput
      label="Price"
      value={price}
      onChange={setPrice}
      min={0}
      step={0.01}
    />
  );
}
