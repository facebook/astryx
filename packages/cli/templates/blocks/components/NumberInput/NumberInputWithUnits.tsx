// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {NumberInput} from '@xds/core/NumberInput';

export default function NumberInputWithUnits() {
  const [value, setValue] = useState<number | null>(50);
  return (
    <div style={{width: 300}}>
      <NumberInput
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
