// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import { Label } from './components/ui/label';
import { useState } from 'react';

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState(1);
  const pricePerItem = 29.99;

  const handleChange = (value: number) => {
    setQuantity(Math.min(99, Math.max(1, value)));
  };

  return (
    <Card className="max-w-xs">
      <CardContent className="p-4 space-y-3">
        <Label>Quantity</Label>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleChange(quantity - 1)} disabled={quantity <= 1}>
            -
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => handleChange(parseInt(e.target.value) || 1)}
            min={1}
            max={99}
            className="w-16 text-center"
          />
          <Button size="sm" variant="outline" onClick={() => handleChange(quantity + 1)} disabled={quantity >= 99}>
            +
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          ${pricePerItem.toFixed(2)} each | Total: ${(quantity * pricePerItem).toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}
