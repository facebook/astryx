// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSSelector} from '@xds/core/Selector';

export default function SelectorShowcase() {
  return (
    <XDSSelector
      style={{width: 300}}
      label="Fruit"
      options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']}
      placeholder="Select a fruit..."
      onChange={() => {}}
    />
  );
}
