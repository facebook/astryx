'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';

export default function SelectorSections() {
  const [value, setValue] = useState('');

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSSelector
      label="Fruit"
      options={[
        {value: 'apple', label: 'Apple'},
        {
          type: 'section',
          title: 'Citrus',
          // @ts-expect-error migrated example
          items: [{value: 'orange', label: 'Orange'}],
        },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: SelectorSections,
};
