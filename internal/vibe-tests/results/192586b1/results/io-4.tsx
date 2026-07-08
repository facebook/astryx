// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function QuantitySelector({
  price = 29.99,
  itemName = 'Widget',
}: {price?: number; itemName?: string}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 250}}>
      <span style={{fontSize: 14, fontWeight: 500}}>{itemName}</span>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{width: 32, height: 32, border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 16}} aria-label="Decrease">-</button>
        <input
          type="number"
          value={quantity}
          onChange={e => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
          min={1}
          max={99}
          aria-label="Quantity"
          style={{width: 60, textAlign: 'center', padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4}}
        />
        <button onClick={() => setQuantity(Math.min(99, quantity + 1))} style={{width: 32, height: 32, border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 16}} aria-label="Increase">+</button>
      </div>
      <span style={{fontSize: 14, color: '#666'}}>Subtotal: ${(price * quantity).toFixed(2)}</span>
    </div>
  );
}
