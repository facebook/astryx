// Copyright (c) Meta Platforms, Inc. and affiliates.

import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { useState } from 'react';

export default function ShippingMethodSelector() {
  const [selected, setSelected] = useState('standard');

  const options = [
    { value: 'standard', label: 'Standard', description: 'Free - 5-7 business days' },
    { value: 'express', label: 'Express', description: '$9.99 - 2-3 business days' },
    { value: 'overnight', label: 'Overnight', description: '$24.99 - Next day delivery' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selected} onValueChange={setSelected}>
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 p-3 rounded-md border">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
