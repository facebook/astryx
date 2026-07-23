// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

type Step = 'cart' | 'shipping' | 'payment' | 'confirmation';

export default function CheckoutFlow() {
  const [step, setStep] = useState<Step>('cart');
  const [shipping, setShipping] = useState({name: '', address: '', city: '', zip: ''});
  const [payment, setPayment] = useState({card: '', expiry: '', cvv: ''});

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <div className="flex gap-4 text-sm">
        {(['cart', 'shipping', 'payment', 'confirmation'] as Step[]).map((s, i) => (
          <span key={s} className={s === step ? 'font-semibold' : 'text-muted-foreground'}>
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>

      {step === 'cart' && (
        <Card>
          <CardHeader><CardTitle>Cart Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span>Widget Pro x2</span><span>$49.98</span></div>
            <div className="flex justify-between"><span>Cable Pack</span><span>$12.99</span></div>
            <hr />
            <div className="flex justify-between font-semibold"><span>Total</span><span>$62.97</span></div>
            <Button className="w-full" onClick={() => setStep('shipping')}>Continue to Shipping</Button>
          </CardContent>
        </Card>
      )}

      {step === 'shipping' && (
        <Card>
          <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Full Name</Label><Input value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} /></div>
            <div><Label>Address</Label><Input value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>City</Label><Input value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} /></div>
              <div><Label>ZIP</Label><Input value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})} /></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('cart')}>Back</Button>
              <Button onClick={() => setStep('payment')}>Continue to Payment</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'payment' && (
        <Card>
          <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Card Number</Label><Input value={payment.card} onChange={e => setPayment({...payment, card: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Expiry</Label><Input value={payment.expiry} onChange={e => setPayment({...payment, expiry: e.target.value})} /></div>
              <div><Label>CVV</Label><Input value={payment.cvv} onChange={e => setPayment({...payment, cvv: e.target.value})} /></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('shipping')}>Back</Button>
              <Button onClick={() => setStep('confirmation')}>Place Order</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirmation' && (
        <Card>
          <CardHeader><CardTitle>Order Confirmed</CardTitle></CardHeader>
          <CardContent>
            <p>Your order has been placed. Confirmation email on the way.</p>
            <p className="text-sm text-muted-foreground mt-2">Order #ORD-2026-4821</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
