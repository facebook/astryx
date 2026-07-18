// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {NumberInput} from '@astryxdesign/core/NumberInput';

export default function NumberInputRangeNumberInput() {
  const [value, setValue] = useState<number | null>(3);
  return (
    <div style={{width: 300}}>
      <NumberInput
        label="Team Size"
        placeholder="1–50"
        min={1}
        max={50}
        description="Number of people on the team"
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
