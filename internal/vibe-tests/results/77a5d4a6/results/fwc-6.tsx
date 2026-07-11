// Copyright (c) Meta Platforms, Inc. and affiliates.

import { useState } from 'react';

export default function ShippingMethodSelector() {
  const [selected, setSelected] = useState('standard');

  const options = [
    { value: 'standard', label: 'Standard', description: 'Free - 5-7 business days' },
    { value: 'express', label: 'Express', description: '$9.99 - 2-3 business days' },
    { value: 'overnight', label: 'Overnight', description: '$24.99 - Next day delivery' },
  ];

  return (
    <div style={{ padding: 24, border: '1px solid #e0e0e0', borderRadius: 8, maxWidth: 400 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Shipping Method</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((option) => (
          <label
            key={option.value}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 12,
              border: `2px solid ${selected === option.value ? '#0066cc' : '#e0e0e0'}`,
              borderRadius: 8, cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="shipping"
              value={option.value}
              checked={selected === option.value}
              onChange={(e) => setSelected(e.target.value)}
            />
            <div>
              <div style={{ fontWeight: 500 }}>{option.label}</div>
              <div style={{ fontSize: 14, color: '#666' }}>{option.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
