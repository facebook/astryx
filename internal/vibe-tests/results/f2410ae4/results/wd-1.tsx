// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Divider} from '@astryxdesign/core/Divider';

type Step = 'cart' | 'shipping' | 'payment' | 'confirmation';

export default function CheckoutFlow() {
  const [step, setStep] = useState<Step>('cart');
  const [shipping, setShipping] = useState({name: '', address: '', city: '', zip: ''});
  const [payment, setPayment] = useState({card: '', expiry: '', cvv: ''});

  const steps: Step[] = ['cart', 'shipping', 'payment', 'confirmation'];
  const currentIndex = steps.indexOf(step);

  return (
    <VStack gap={4}>
      <HStack gap={2}>
        {steps.map((s, i) => (
          <Text key={s} type={i === currentIndex ? 'body' : 'supporting'}>
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </Text>
        ))}
      </HStack>
      <Divider />

      {step === 'cart' && (
        <Card>
          <VStack gap={3}>
            <Heading level={3}>Cart Summary</Heading>
            <HStack gap={2}>
              <Text>Widget Pro x2</Text>
              <Text>$49.98</Text>
            </HStack>
            <HStack gap={2}>
              <Text>Cable Pack</Text>
              <Text>$12.99</Text>
            </HStack>
            <Divider />
            <HStack gap={2}>
              <Text type="body">Total</Text>
              <Text type="body">$62.97</Text>
            </HStack>
            <Button label="Continue to Shipping" variant="primary" onClick={() => setStep('shipping')} />
          </VStack>
        </Card>
      )}

      {step === 'shipping' && (
        <Card>
          <VStack gap={3}>
            <Heading level={3}>Shipping Address</Heading>
            <TextInput label="Full Name" value={shipping.name} onChange={(v) => setShipping({...shipping, name: v})} />
            <TextInput label="Address" value={shipping.address} onChange={(v) => setShipping({...shipping, address: v})} />
            <HStack gap={2}>
              <TextInput label="City" value={shipping.city} onChange={(v) => setShipping({...shipping, city: v})} />
              <TextInput label="ZIP Code" value={shipping.zip} onChange={(v) => setShipping({...shipping, zip: v})} />
            </HStack>
            <HStack gap={2}>
              <Button label="Back" variant="ghost" onClick={() => setStep('cart')} />
              <Button label="Continue to Payment" variant="primary" onClick={() => setStep('payment')} />
            </HStack>
          </VStack>
        </Card>
      )}

      {step === 'payment' && (
        <Card>
          <VStack gap={3}>
            <Heading level={3}>Payment</Heading>
            <TextInput label="Card Number" value={payment.card} onChange={(v) => setPayment({...payment, card: v})} />
            <HStack gap={2}>
              <TextInput label="Expiry" value={payment.expiry} onChange={(v) => setPayment({...payment, expiry: v})} />
              <TextInput label="CVV" value={payment.cvv} onChange={(v) => setPayment({...payment, cvv: v})} />
            </HStack>
            <HStack gap={2}>
              <Button label="Back" variant="ghost" onClick={() => setStep('shipping')} />
              <Button label="Place Order" variant="primary" onClick={() => setStep('confirmation')} />
            </HStack>
          </VStack>
        </Card>
      )}

      {step === 'confirmation' && (
        <Card>
          <VStack gap={3}>
            <Heading level={3}>Order Confirmed</Heading>
            <Text>Your order has been placed. You will receive a confirmation email shortly.</Text>
            <Text type="supporting">Order #ORD-2026-4821</Text>
          </VStack>
        </Card>
      )}
    </VStack>
  );
}
