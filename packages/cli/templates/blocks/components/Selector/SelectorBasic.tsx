'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';

export default function SelectorBasic() {
  const [value, setValue] = useState('');

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSSelector
      label="Fruit"
      options={['Apple', 'Banana', 'Orange']}
      value={value}
      onChange={setValue}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: SelectorBasic,
};
