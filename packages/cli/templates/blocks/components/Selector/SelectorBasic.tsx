'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';

export default function SelectorBasic() {
  const [value, setValue] = useState('');

  return (
    <XDSSelector
      label="Fruit"
      options={['Apple', 'Banana', 'Orange']}
      value={value}
      onChange={(v) => setValue(v)}
    />
  );
}
