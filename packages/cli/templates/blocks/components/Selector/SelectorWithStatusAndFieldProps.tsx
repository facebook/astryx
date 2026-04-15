'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';

export default function SelectorWithStatusAndFieldProps() {
  const [value, setValue] = useState('');

  return (
    <XDSSelector
      label="Fruit"
      isRequired
      status={{type: 'error', message: 'Required'}}
      options={['Apple', 'Banana']}
      value={value}
      onChange={(v) => setValue(v)}
    />
  );
}
