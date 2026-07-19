// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {VStack} from '@astryxdesign/core/Stack';
import {HStack} from '@astryxdesign/core/Stack';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState(1);

  return (
    <Card>
      <VStack gap={3}>
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
      </VStack>
    </Card>
  );
}
