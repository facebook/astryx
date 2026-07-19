// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState(1);

  const decrement = () => setQuantity(q => Math.max(q - 1, 1));
  const increment = () => setQuantity(q => Math.min(q + 1, 99));

  return (
    <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, maxWidth: 300}}>
      <p style={{fontWeight: 600, marginBottom: 12}}>Shopping Cart Item</p>
      <label style={{display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14}}>Quantity</label>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <button onClick={decrement} disabled={quantity <= 1} style={{width: 32, height: 32, border: '1px solid #d1d5db', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 16}}>-</button>
        <input type="number" min={1} max={99} value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(99, Number(e.target.value))))} style={{width: 60, textAlign: 'center', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4}} />
        <button onClick={increment} disabled={quantity >= 99} style={{width: 32, height: 32, border: '1px solid #d1d5db', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 16}}>+</button>
      </div>
      <p style={{fontSize: 12, color: '#6b7280', marginTop: 8}}>Min: 1, Max: 99</p>
    </div>
  );
}
