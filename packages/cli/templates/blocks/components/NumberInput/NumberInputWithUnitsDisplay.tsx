'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputWithUnitsDisplay() {
  const [discount, setDiscount] = useState<number | null>(10);

  return (
    <XDSNumberInput
      label="Discount"
      value={discount}
      onChange={setDiscount}
      units="%"
    />
  );
}
