'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputRangeNumberInput() {
  const [value, setValue] = useState<number | null>(null);
  return (
    <div style={{maxWidth: 300}}>
      <XDSNumberInput
        label="Rating"
        placeholder="1-5"
        min={1}
        max={5}
        description="Rate from 1 to 5"
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
