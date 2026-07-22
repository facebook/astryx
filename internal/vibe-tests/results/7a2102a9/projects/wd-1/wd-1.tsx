import {useState} from 'react';
type Step = 'cart' | 'shipping' | 'payment' | 'confirmation';

export default function CheckoutFlow() {
  const [step, setStep] = useState<Step>('cart');
  const card = {border: '1px solid #ddd', borderRadius: 8, padding: 24, marginTop: 16};
  const btn = {padding: '10px 20px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' as const};

  return (
    <div style={{maxWidth: 560, margin: '0 auto', fontFamily: 'system-ui'}}>
      <h2>Checkout</h2>
      {step === 'cart' && <div style={card}><h3>Cart</h3><p>Total: $74.97</p><button style={btn} onClick={() => setStep('shipping')}>Continue</button></div>}
      {step === 'shipping' && <div style={card}><h3>Shipping</h3><input placeholder="Name" style={{width:'100%',padding:8,marginBottom:8,borderRadius:4,border:'1px solid #ccc'}}/><button style={btn} onClick={() => setStep('payment')}>Continue</button></div>}
      {step === 'payment' && <div style={card}><h3>Payment</h3><input placeholder="Card" style={{width:'100%',padding:8,marginBottom:8,borderRadius:4,border:'1px solid #ccc'}}/><button style={btn} onClick={() => setStep('confirmation')}>Pay</button></div>}
      {step === 'confirmation' && <div style={card}><h3>Confirmed!</h3><p>Order placed.</p></div>}
    </div>
  );
}
