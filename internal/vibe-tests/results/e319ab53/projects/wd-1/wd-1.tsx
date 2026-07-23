// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
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
    <div className="flex flex-col gap-4 max-w-lg p-6">
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <span key={s} className={i === currentIndex ? 'font-medium' : 'text-gray-400'}>
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>
      <Divider />

      {step === 'cart' && (
        <Card>
          <div className="flex flex-col gap-3">
            <Heading level={3}>Cart Summary</Heading>
            <div className="flex justify-between"><Text>Widget Pro x2</Text><Text>$49.98</Text></div>
            <div className="flex justify-between"><Text>Cable Pack</Text><Text>$12.99</Text></div>
            <Divider />
            <div className="flex justify-between font-medium"><Text>Total</Text><Text>$62.97</Text></div>
            <Button label="Continue to Shipping" variant="primary" onClick={() => setStep('shipping')} />
          </div>
        </Card>
      )}

      {step === 'shipping' && (
        <Card>
          <div className="flex flex-col gap-3">
            <Heading level={3}>Shipping Address</Heading>
            <TextInput label="Full Name" value={shipping.name} onChange={(v) => setShipping({...shipping, name: v})} />
            <TextInput label="Address" value={shipping.address} onChange={(v) => setShipping({...shipping, address: v})} />
            <div className="flex gap-2">
              <TextInput label="City" value={shipping.city} onChange={(v) => setShipping({...shipping, city: v})} />
              <TextInput label="ZIP" value={shipping.zip} onChange={(v) => setShipping({...shipping, zip: v})} />
            </div>
            <div className="flex gap-2">
              <Button label="Back" variant="ghost" onClick={() => setStep('cart')} />
              <Button label="Continue to Payment" variant="primary" onClick={() => setStep('payment')} />
            </div>
          </div>
        </Card>
      )}

      {step === 'payment' && (
        <Card>
          <div className="flex flex-col gap-3">
            <Heading level={3}>Payment</Heading>
            <TextInput label="Card Number" value={payment.card} onChange={(v) => setPayment({...payment, card: v})} />
            <div className="flex gap-2">
              <TextInput label="Expiry" value={payment.expiry} onChange={(v) => setPayment({...payment, expiry: v})} />
              <TextInput label="CVV" value={payment.cvv} onChange={(v) => setPayment({...payment, cvv: v})} />
            </div>
            <div className="flex gap-2">
              <Button label="Back" variant="ghost" onClick={() => setStep('shipping')} />
              <Button label="Place Order" variant="primary" onClick={() => setStep('confirmation')} />
            </div>
          </div>
        </Card>
      )}

      {step === 'confirmation' && (
        <Card>
          <div className="flex flex-col gap-3">
            <Heading level={3}>Order Confirmed</Heading>
            <Text>Your order has been placed. Confirmation email on the way.</Text>
            <Text type="supporting">Order #ORD-2026-4821</Text>
          </div>
        </Card>
      )}
    </div>
  );
}
