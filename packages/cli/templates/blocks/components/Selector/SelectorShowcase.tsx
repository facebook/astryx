// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Selector} from '@xds/core/Selector';

export default function SelectorShowcase() {
  return (
    <Selector
      style={{width: 300}}
      label="Fruit"
      options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']}
      placeholder="Select a fruit..."
      onChange={() => {}}
    />
  );
}
