import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {useState} from 'react';

type Step = 'cart' | 'shipping' | 'payment' | 'confirmation';

export default function CheckoutFlow() {
  const [step, setStep] = useState<Step>('cart');

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Checkout</h2>
      {step === 'cart' && (
        <Card><CardHeader><CardTitle>Cart</CardTitle></CardHeader><CardContent className="space-y-2">
          <p>Widget Pro x2 - $49.98</p><p className="font-bold">Total: $74.97</p>
          <Button onClick={() => setStep('shipping')}>Continue</Button>
        </CardContent></Card>
      )}
      {step === 'shipping' && (
        <Card><CardHeader><CardTitle>Shipping</CardTitle></CardHeader><CardContent className="space-y-3">
          <div><Label>Name</Label><Input /></div>
          <div><Label>Address</Label><Input /></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => setStep('cart')}>Back</Button><Button onClick={() => setStep('payment')}>Continue</Button></div>
        </CardContent></Card>
      )}
      {step === 'payment' && (
        <Card><CardHeader><CardTitle>Payment</CardTitle></CardHeader><CardContent className="space-y-3">
          <div><Label>Card</Label><Input /></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => setStep('shipping')}>Back</Button><Button onClick={() => setStep('confirmation')}>Pay</Button></div>
        </CardContent></Card>
      )}
      {step === 'confirmation' && (
        <Card><CardHeader><CardTitle>Confirmed!</CardTitle></CardHeader><CardContent><p>Order placed.</p></CardContent></Card>
      )}
    </div>
  );
}
