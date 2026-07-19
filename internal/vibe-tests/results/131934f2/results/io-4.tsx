// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity(q => Math.min(q + 1, 99));
  const decrement = () => setQuantity(q => Math.max(q - 1, 1));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopping Cart Item</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor="qty">Quantity</Label>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={decrement} disabled={quantity <= 1}>-</Button>
          <Input
            id="qty"
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={e => setQuantity(Math.max(1, Math.min(99, Number(e.target.value))))}
            className="w-20 text-center"
          />
          <Button variant="outline" size="sm" onClick={increment} disabled={quantity >= 99}>+</Button>
        </div>
        <p className="text-sm text-muted-foreground">Min: 1, Max: 99</p>
      </CardContent>
    </Card>
  );
}
