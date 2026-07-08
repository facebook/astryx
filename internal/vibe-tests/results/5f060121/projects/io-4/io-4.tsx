// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';

export default function QuantitySelector({
  price = 29.99,
  itemName = 'Widget',
}: {price?: number; itemName?: string}) {
  const [quantity, setQuantity] = useState<number>(1);

  return (
    <div className="flex flex-col gap-3 max-w-xs">
      <Text type="label">{itemName}</Text>
      <div className="flex items-center gap-2">
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
      </div>
      <Text color="secondary">Subtotal: ${(price * quantity).toFixed(2)}</Text>
    </div>
  );
}
