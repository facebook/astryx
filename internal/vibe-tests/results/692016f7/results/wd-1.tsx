// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Button } from './components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { useState } from 'react';

type Step = 'cart' | 'shipping' | 'payment' | 'confirmation';

export default function CheckoutFlow() {
  const [step, setStep] = useState<Step>('cart');
  const steps: Step[] = ['cart', 'shipping', 'payment', 'confirmation'];
  const currentIndex = steps.indexOf(step);

  const renderStep = () => {
    switch (step) {
      case 'cart':
        return (
          <div className="space-y-3">
            <p className="font-medium">Cart Summary</p>
            <p className="text-sm text-muted-foreground">2 items in your cart</p>
            <p className="font-semibold">Total: $59.98</p>
          </div>
        );
      case 'shipping':
        return (
          <div className="space-y-4">
            <div><Label>Full Name</Label><Input placeholder="John Doe" /></div>
            <div><Label>Address</Label><Input placeholder="123 Main St" /></div>
            <div><Label>City</Label><Input placeholder="San Francisco" /></div>
            <div><Label>ZIP Code</Label><Input placeholder="94102" /></div>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-4">
            <div><Label>Card Number</Label><Input placeholder="4242 4242 4242 4242" /></div>
            <div><Label>Expiry</Label><Input placeholder="MM/YY" /></div>
            <div><Label>CVC</Label><Input placeholder="123" /></div>
          </div>
        );
      case 'confirmation':
        return (
          <div className="space-y-2">
            <p className="font-medium">Order Confirmed!</p>
            <p className="text-sm text-muted-foreground">Order #12345</p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Checkout - Step {currentIndex + 1} of 4</CardTitle>
      </CardHeader>
      <CardContent>{renderStep()}</CardContent>
      <CardFooter className="flex justify-between">
        {currentIndex > 0 && (
          <Button variant="outline" onClick={() => setStep(steps[currentIndex - 1])}>Back</Button>
        )}
        {currentIndex < steps.length - 1 && (
          <Button onClick={() => setStep(steps[currentIndex + 1])}>
            {step === 'payment' ? 'Place Order' : 'Continue'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
