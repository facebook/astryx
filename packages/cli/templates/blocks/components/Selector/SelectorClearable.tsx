'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';

export default function SelectorClearable() {
  const [value, setValue] = useState<string | null>('Banana');
  return (
    <div style={{width: 250}}>
      <XDSSelector
        label="Fruit"
        options={['Apple', 'Banana', 'Cherry', 'Date']}
        value={value}
        onChange={setValue}
        placeholder="Select a fruit..."
        hasClear
      />
    </div>
  );
}
