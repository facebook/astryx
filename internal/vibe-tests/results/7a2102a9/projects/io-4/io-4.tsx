import {useState} from 'react';

export default function QuantitySelector() {
  const [qty, setQty] = useState(1);

  const update = async (val: number) => {
    const clamped = Math.min(99, Math.max(1, val));
    setQty(clamped);
    await fetch('/api/cart/update', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({quantity: clamped})});
  };

  return (
    <div style={{width: 180, border: '1px solid #ddd', borderRadius: 8, padding: 16, fontFamily: 'system-ui'}}>
      <p style={{fontWeight: 500, fontSize: 14, margin: '0 0 8px'}}>Quantity</p>
      <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
        <button onClick={() => update(qty - 1)} disabled={qty <= 1} style={{width: 32, height: 32, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>-</button>
        <input type="number" value={qty} min={1} max={99} onChange={e => update(Number(e.target.value))} style={{width: 48, textAlign: 'center', padding: 4, border: '1px solid #ccc', borderRadius: 4}} />
        <button onClick={() => update(qty + 1)} disabled={qty >= 99} style={{width: 32, height: 32, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>+</button>
      </div>
    </div>
  );
}
