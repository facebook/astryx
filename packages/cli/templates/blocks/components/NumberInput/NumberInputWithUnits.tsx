'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSCenter} from '@xds/core/Center';

export default function NumberInputWithUnits() {
  const [value, setValue] = useState<number | null>(50);
  return (
    <XDSCenter width={300}>
      <XDSNumberInput
        label="Discount"
        placeholder="Enter discount"
        min={0}
        max={100}
        units="%"
        value={value}
        onChange={setValue}
      />
    </XDSCenter>
  );
}
