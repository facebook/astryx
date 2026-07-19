// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState(1);

  return (
    <Card>
      <div className="flex flex-col gap-3 p-4">
        <Text weight="semibold">Shopping Cart Item</Text>
        <NumberInput
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={99}
          step={1}
        />
        <Text color="secondary" type="supporting">Min: 1, Max: 99</Text>
      </div>
    </Card>
  );
}
