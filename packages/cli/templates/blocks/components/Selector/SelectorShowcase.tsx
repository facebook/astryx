'use client';

import {XDSSelector} from '@xds/core/Selector';

export default function SelectorShowcase() {
  return (
    <XDSSelector
      label="Fruit"
      options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']}
      placeholder="Select a fruit..."
      onChange={() => {}}
    />
  );
}
