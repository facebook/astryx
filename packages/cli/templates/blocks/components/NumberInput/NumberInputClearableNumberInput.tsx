'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputClearableNumberInput() {
  const [value, setValue] = useState<number | null>(75);
  return (
    <div style={{maxWidth: 300}}>
      <XDSNumberInput
        label="Progress"
        units="%"
        min={0}
        max={100}
        value={value}
        onChange={setValue}
        hasClear
      />
    </div>
  );
}
