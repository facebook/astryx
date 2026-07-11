// Copyright (c) Meta Platforms, Inc. and affiliates.

import { useState } from 'react';

const plans = [
  { name: 'Starter', monthly: 12, annual: 10, features: ['5 projects', '10GB storage', 'Email support'] },
  { name: 'Pro', monthly: 24, annual: 20, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'] },
  { name: 'Enterprise', monthly: 48, annual: 40, features: ['Everything in Pro', '1TB storage', 'Dedicated support', 'Custom integrations', 'SLA'] },
];

export default function PricingTable() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div style={{ textAlign: 'center', padding: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Simple pricing</h2>
      <div style={{ display: 'inline-flex', gap: 0, border: '1px solid #ddd', borderRadius: 8, marginBottom: 24 }}>
        <button onClick={() => setBilling('monthly')} style={{ padding: '8px 20px', border: 'none', borderRadius: '8px 0 0 8px', background: billing === 'monthly' ? '#0066cc' : 'white', color: billing === 'monthly' ? 'white' : '#333', cursor: 'pointer' }}>Monthly</button>
        <button onClick={() => setBilling('annual')} style={{ padding: '8px 20px', border: 'none', borderRadius: '0 8px 8px 0', background: billing === 'annual' ? '#0066cc' : 'white', color: billing === 'annual' ? 'white' : '#333', cursor: 'pointer' }}>Annual</button>
      </div>
      {billing === 'annual' && <div style={{ color: 'green', fontSize: 14, marginBottom: 16 }}>Save 20%</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
        {plans.map((plan) => (
          <div key={plan.name} style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 24, textAlign: 'left' }}>
            <h3 style={{ fontWeight: 600 }}>{plan.name}</h3>
            <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0' }}>${billing === 'monthly' ? plan.monthly : plan.annual}<span style={{ fontSize: 14, fontWeight: 400, color: '#666' }}>/mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0' }}>
              {plan.features.map((f) => <li key={f} style={{ padding: '4px 0', fontSize: 14, color: '#555' }}>{f}</li>)}
            </ul>
            <button style={{ width: '100%', padding: '10px', border: plan.name === 'Pro' ? 'none' : '1px solid #ddd', borderRadius: 6, background: plan.name === 'Pro' ? '#0066cc' : 'white', color: plan.name === 'Pro' ? 'white' : '#333', cursor: 'pointer', fontWeight: 500 }}>Get started</button>
          </div>
        ))}
      </div>
    </div>
  );
}
