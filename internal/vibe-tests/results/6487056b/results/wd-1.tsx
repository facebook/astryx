// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@astryxdesign/core/Dialog';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { FormLayout } from '@astryxdesign/core/FormLayout';
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
          <Stack gap={3}>
            <Text type="label" weight="semibold">Cart Summary</Text>
            <Text>2 items in your cart</Text>
            <Text weight="semibold">Total: $59.98</Text>
          </Stack>
        );
      case 'shipping':
        return (
          <FormLayout>
            <TextInput label="Full Name" placeholder="John Doe" />
            <TextInput label="Address" placeholder="123 Main St" />
            <TextInput label="City" placeholder="San Francisco" />
            <TextInput label="ZIP Code" placeholder="94102" />
          </FormLayout>
        );
      case 'payment':
        return (
          <FormLayout>
            <TextInput label="Card Number" placeholder="4242 4242 4242 4242" />
            <TextInput label="Expiry" placeholder="MM/YY" />
            <TextInput label="CVC" placeholder="123" />
          </FormLayout>
        );
      case 'confirmation':
        return (
          <Stack gap={2}>
            <Text type="label" weight="semibold">Order Confirmed!</Text>
            <Text>Your order has been placed successfully.</Text>
            <Text color="secondary">Order #12345</Text>
          </Stack>
        );
    }
  };

  return (
    <Dialog isOpen onClose={() => {}}>
      <DialogHeader title={`Checkout - Step ${currentIndex + 1} of 4`} />
      <DialogBody>{renderStep()}</DialogBody>
      <DialogFooter>
        {currentIndex > 0 && (
          <Button variant="secondary" onClick={() => setStep(steps[currentIndex - 1])}>
            Back
          </Button>
        )}
        {currentIndex < steps.length - 1 && (
          <Button variant="primary" onClick={() => setStep(steps[currentIndex + 1])}>
            {step === 'payment' ? 'Place Order' : 'Continue'}
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}
