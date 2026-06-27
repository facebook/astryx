// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {NumberInput} from '@astryxdesign/core/NumberInput';

export default function NumberInputShowcase() {
  const [value, setValue] = useState<number | null>(0);
  return (
    <div style={{width: 300}}>
      <NumberInput
        label="Quantity"
        placeholder="Enter quantity"
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
