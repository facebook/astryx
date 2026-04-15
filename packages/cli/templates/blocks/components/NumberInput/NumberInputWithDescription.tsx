'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputWithDescription() {
  const [qty, setQty] = useState<number | null>(1);

  return (
    <XDSNumberInput
      label="Quantity"
      description="Enter the number of items"
      value={qty}
      onChange={setQty}
    />
  );
}
