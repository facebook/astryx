// Copyright (c) Meta Platforms, Inc. and affiliates.

import { useState } from 'react';

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState(1);
  const pricePerItem = 29.99;

  const handleChange = (value: number) => {
    setQuantity(Math.min(99, Math.max(1, value)));
  };

  const btnStyle = { width: 36, height: 36, border: '1px solid #ddd', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;

  return (
    <div style={{ padding: 20, border: '1px solid #e0e0e0', borderRadius: 8, maxWidth: 300 }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 12 }}>Quantity</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button style={btnStyle} onClick={() => handleChange(quantity - 1)} disabled={quantity <= 1}>-</button>
        <input type="number" value={quantity} onChange={(e) => handleChange(parseInt(e.target.value) || 1)} min={1} max={99} style={{ width: 60, textAlign: 'center', padding: '6px', border: '1px solid #ddd', borderRadius: 6 }} />
        <button style={btnStyle} onClick={() => handleChange(quantity + 1)} disabled={quantity >= 99}>+</button>
      </div>
      <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
        ${pricePerItem.toFixed(2)} each | Total: ${(quantity * pricePerItem).toFixed(2)}
      </p>
    </div>
  );
}
