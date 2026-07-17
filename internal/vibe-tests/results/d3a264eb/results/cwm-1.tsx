// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

const plans = [
  {name: 'Starter', monthly: 12, annual: 10, features: ['5 projects', '10GB storage', 'Email support']},
  {name: 'Pro', monthly: 29, annual: 24, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'], popular: true},
  {name: 'Enterprise', monthly: 79, annual: 66, features: ['Unlimited everything', '1TB storage', 'Dedicated support', 'Custom integrations', 'SLA']},
];

export default function PricingTable() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div style={{maxWidth: 1000, margin: '0 auto', padding: 32}}>
      <div style={{textAlign: 'center', marginBottom: 32}}>
        <h2 style={{fontSize: 28, fontWeight: 700, marginBottom: 16}}>Choose your plan</h2>
        <div style={{display: 'inline-flex', gap: 0, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden'}}>
          <button onClick={() => setBilling('monthly')} style={{padding: '8px 20px', background: billing === 'monthly' ? '#4f46e5' : '#fff', color: billing === 'monthly' ? '#fff' : '#333', border: 'none', cursor: 'pointer'}}>Monthly</button>
          <button onClick={() => setBilling('annual')} style={{padding: '8px 20px', background: billing === 'annual' ? '#4f46e5' : '#fff', color: billing === 'annual' ? '#fff' : '#333', border: 'none', cursor: 'pointer'}}>Annual</button>
        </div>
        {billing === 'annual' && <p style={{fontSize: 14, color: '#4f46e5', marginTop: 8}}>Save up to 20% with annual billing</p>}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24}}>
        {plans.map((plan) => (
          <div key={plan.name} style={{border: plan.popular ? '2px solid #4f46e5' : '1px solid #e2e8f0', borderRadius: 12, padding: 24}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16}}>
              <h3 style={{fontSize: 20, fontWeight: 600}}>{plan.name}</h3>
              {plan.popular && <span style={{background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12}}>Popular</span>}
            </div>
            <div style={{marginBottom: 16}}>
              <span style={{fontSize: 36, fontWeight: 700}}>${billing === 'monthly' ? plan.monthly : plan.annual}</span>
              <span style={{color: '#64748b'}}>/month</span>
            </div>
            <hr style={{margin: '16px 0', border: 'none', borderTop: '1px solid #e2e8f0'}} />
            <ul style={{listStyle: 'none', padding: 0, margin: '0 0 24px 0'}}>
              {plan.features.map((f) => <li key={f} style={{padding: '4px 0', fontSize: 14}}>{f}</li>)}
            </ul>
            <button style={{width: '100%', padding: '10px 0', borderRadius: 8, border: plan.popular ? 'none' : '1px solid #ddd', background: plan.popular ? '#4f46e5' : '#fff', color: plan.popular ? '#fff' : '#333', cursor: 'pointer', fontWeight: 500}}>
              {plan.popular ? 'Get started' : 'Choose plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
