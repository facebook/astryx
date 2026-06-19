// Copyright (c) Meta Platforms, Inc. and affiliates.

import {NumberInput} from '@xds/core/NumberInput';

export default function NumberInputShowcase() {
  return (
    <div style={{width: 300}}>
      <NumberInput
        label="Quantity"
        placeholder="Enter quantity"
        value={0}
        onChange={() => {}}
      />
    </div>
  );
}
