// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';

type Step = 'cart' | 'shipping' | 'payment' | 'confirmation';

export default function CheckoutFlow() {
  const [step, setStep] = useState<Step>('cart');
  const [shipping, setShipping] = useState({name: '', address: '', city: '', zip: ''});
  const [payment, setPayment] = useState({card: '', expiry: '', cvv: ''});

  const inputStyle = {width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14};
  const btnStyle = {padding: '10px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 as const};

  return (
    <div style={{maxWidth: 480, padding: 24, fontFamily: 'system-ui'}}>
      <div style={{display: 'flex', gap: 16, marginBottom: 16, fontSize: 14}}>
        {(['cart', 'shipping', 'payment', 'confirmation'] as Step[]).map((s, i) => (
          <span key={s} style={{fontWeight: s === step ? 600 : 400, color: s === step ? '#000' : '#999'}}>
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>

      {step === 'cart' && (
        <div style={{border: '1px solid #e5e5e5', borderRadius: 8, padding: 20}}>
          <h3 style={{margin: '0 0 12px'}}>Cart Summary</h3>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
            <span>Widget Pro x2</span><span>$49.98</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}>
            <span>Cable Pack</span><span>$12.99</span>
          </div>
          <hr style={{border: 'none', borderTop: '1px solid #e5e5e5', margin: '12px 0'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 16}}>
            <span>Total</span><span>$62.97</span>
          </div>
          <button onClick={() => setStep('shipping')} style={{...btnStyle, width: '100%', backgroundColor: '#0066cc', color: '#fff'}}>
            Continue to Shipping
          </button>
        </div>
      )}

      {step === 'shipping' && (
        <div style={{border: '1px solid #e5e5e5', borderRadius: 8, padding: 20}}>
          <h3 style={{margin: '0 0 12px'}}>Shipping Address</h3>
          <div style={{marginBottom: 12}}>
            <label style={{display: 'block', fontSize: 14, marginBottom: 4}}>Full Name</label>
            <input style={inputStyle} value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
          </div>
          <div style={{marginBottom: 12}}>
            <label style={{display: 'block', fontSize: 14, marginBottom: 4}}>Address</label>
            <input style={inputStyle} value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} />
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16}}>
            <div><label style={{display: 'block', fontSize: 14, marginBottom: 4}}>City</label><input style={inputStyle} value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} /></div>
            <div><label style={{display: 'block', fontSize: 14, marginBottom: 4}}>ZIP</label><input style={inputStyle} value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})} /></div>
          </div>
          <div style={{display: 'flex', gap: 8}}>
            <button onClick={() => setStep('cart')} style={{...btnStyle, backgroundColor: '#f5f5f5', color: '#333'}}>Back</button>
            <button onClick={() => setStep('payment')} style={{...btnStyle, backgroundColor: '#0066cc', color: '#fff', flex: 1}}>Continue</button>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div style={{border: '1px solid #e5e5e5', borderRadius: 8, padding: 20}}>
          <h3 style={{margin: '0 0 12px'}}>Payment</h3>
          <div style={{marginBottom: 12}}>
            <label style={{display: 'block', fontSize: 14, marginBottom: 4}}>Card Number</label>
            <input style={inputStyle} value={payment.card} onChange={e => setPayment({...payment, card: e.target.value})} />
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16}}>
            <div><label style={{display: 'block', fontSize: 14, marginBottom: 4}}>Expiry</label><input style={inputStyle} value={payment.expiry} onChange={e => setPayment({...payment, expiry: e.target.value})} /></div>
            <div><label style={{display: 'block', fontSize: 14, marginBottom: 4}}>CVV</label><input style={inputStyle} value={payment.cvv} onChange={e => setPayment({...payment, cvv: e.target.value})} /></div>
          </div>
          <div style={{display: 'flex', gap: 8}}>
            <button onClick={() => setStep('shipping')} style={{...btnStyle, backgroundColor: '#f5f5f5', color: '#333'}}>Back</button>
            <button onClick={() => setStep('confirmation')} style={{...btnStyle, backgroundColor: '#0066cc', color: '#fff', flex: 1}}>Place Order</button>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <div style={{border: '1px solid #e5e5e5', borderRadius: 8, padding: 20, textAlign: 'center'}}>
          <h3 style={{margin: '0 0 8px'}}>Order Confirmed</h3>
          <p style={{color: '#666'}}>Your order has been placed. Confirmation email on the way.</p>
          <p style={{fontSize: 14, color: '#999', marginTop: 8}}>Order #ORD-2026-4821</p>
        </div>
      )}
    </div>
  );
}
