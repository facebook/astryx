'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';

export default function SelectorWithStatusAndFieldProps() {
  const [value, setValue] = useState('');

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSSelector
      label="Fruit"
      isRequired
      status={{type: 'error', message: 'Required'}}
      options={['Apple', 'Banana']}
      value={value}
      onChange={setValue}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: SelectorWithStatusAndFieldProps,
};
