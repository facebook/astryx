'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputWithUnits() {
  const [value, setValue] = useState<number | null>(50);
  return (
    <div style={{maxWidth: 300}}>
      <XDSNumberInput
        label="Discount"
        placeholder="Enter discount"
        min={0}
        max={100}
        units="%"
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
