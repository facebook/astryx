// Copyright (c) Meta Platforms, Inc. and affiliates.

import { useState } from 'react';

type Step = 'cart' | 'shipping' | 'payment' | 'confirmation';

export default function CheckoutFlow() {
  const [step, setStep] = useState<Step>('cart');
  const steps: Step[] = ['cart', 'shipping', 'payment', 'confirmation'];
  const currentIndex = steps.indexOf(step);

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 };

  const renderStep = () => {
    switch (step) {
      case 'cart':
        return (<div><p style={{ fontWeight: 500 }}>Cart Summary</p><p>2 items</p><p style={{ fontWeight: 600 }}>Total: $59.98</p></div>);
      case 'shipping':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input style={inputStyle} placeholder="Full Name" />
            <input style={inputStyle} placeholder="Address" />
            <input style={inputStyle} placeholder="City" />
            <input style={inputStyle} placeholder="ZIP Code" />
          </div>
        );
      case 'payment':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input style={inputStyle} placeholder="Card Number" />
            <input style={inputStyle} placeholder="MM/YY" />
            <input style={inputStyle} placeholder="CVC" />
          </div>
        );
      case 'confirmation':
        return (<div><p style={{ fontWeight: 600 }}>Order Confirmed!</p><p style={{ color: '#666' }}>Order #12345</p></div>);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24, border: '1px solid #e0e0e0', borderRadius: 12 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Checkout - Step {currentIndex + 1} of 4</h2>
      <div style={{ marginBottom: 16 }}>{renderStep()}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {currentIndex > 0 && <button onClick={() => setStep(steps[currentIndex - 1])} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Back</button>}
        {currentIndex < steps.length - 1 && <button onClick={() => setStep(steps[currentIndex + 1])} style={{ padding: '8px 16px', background: '#0066cc', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{step === 'payment' ? 'Place Order' : 'Continue'}</button>}
      </div>
    </div>
  );
}
