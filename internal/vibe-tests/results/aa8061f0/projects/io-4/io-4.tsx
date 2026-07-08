// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Button} from '@astryxdesign/core/Button';
import {HStack} from '@astryxdesign/core/HStack';
import {VStack} from '@astryxdesign/core/VStack';
import {Text} from '@astryxdesign/core/Text';

export default function QuantitySelector({
  price = 29.99,
  itemName = 'Widget',
}: {price?: number; itemName?: string}) {
  const [quantity, setQuantity] = useState<number>(1);

  return (
    <VStack gap={3} maxWidth={300}>
      <Text type="label">{itemName}</Text>
      <HStack gap={2} vAlign="center">
        <Button label="Decrease" isIconOnly variant="secondary" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} />
        <NumberInput
          label="Quantity"
          isLabelHidden
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={99}
          size="sm"
        />
        <Button label="Increase" isIconOnly variant="secondary" size="sm" onClick={() => setQuantity(Math.min(99, quantity + 1))} />
      </HStack>
      <Text color="secondary">Subtotal: ${(price * quantity).toFixed(2)}</Text>
    </VStack>
  );
}
