// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Minus, Plus} from 'lucide-react';

export default function QuantitySelector({
  price = 29.99,
  itemName = 'Widget',
}: {price?: number; itemName?: string}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-3 max-w-xs">
      <span className="text-sm font-medium">{itemName}</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease">
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={e => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
          className="w-16 text-center"
          min={1}
          max={99}
          aria-label="Quantity"
        />
        <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(99, quantity + 1))} aria-label="Increase">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-sm text-muted-foreground">Subtotal: ${(price * quantity).toFixed(2)}</span>
    </div>
  );
}
