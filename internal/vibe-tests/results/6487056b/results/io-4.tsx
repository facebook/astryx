// Copyright (c) Meta Platforms, Inc. and affiliates.

import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { useState } from 'react';

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState<number>(1);

  const pricePerItem = 29.99;
  const total = quantity * pricePerItem;

  return (
    <Card padding={3}>
      <Stack gap={2}>
        <Text type="label" weight="semibold">Quantity</Text>
        <NumberInput
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={99}
          step={1}
        />
        <Text color="secondary">
          ${pricePerItem.toFixed(2)} each | Total: ${total.toFixed(2)}
        </Text>
      </Stack>
    </Card>
  );
}
