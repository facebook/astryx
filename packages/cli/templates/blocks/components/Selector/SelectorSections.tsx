'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';

export default function SelectorSections() {
  const [value, setValue] = useState('');

  return (
    <XDSSelector
      label="Fruit"
      options={[
        {value: 'apple', label: 'Apple'},
        {
          type: 'section' as const,
          title: 'Citrus',
          options: [{value: 'orange', label: 'Orange'}],
        },
      ]}
      value={value}
      onChange={(v) => setValue(v)}
    />
  );
}
