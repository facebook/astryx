// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

const plans = [
  {name: 'Starter', monthly: 9, annual: 7, features: ['5 projects', '10GB storage', 'Email support']},
  {name: 'Pro', monthly: 29, annual: 24, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access']},
  {name: 'Enterprise', monthly: 99, annual: 79, features: ['Everything in Pro', 'Custom integrations', 'Dedicated manager', 'SLA']},
];

export default function PricingTable() {
  const [billing, setBilling] = useState('monthly');

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: 32}}>
      <h1 style={{fontSize: 32, fontWeight: 700}}>Pricing</h1>
      <p style={{color: '#6b7280'}}>Choose the plan that works for you</p>
      <div style={{display: 'flex', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden'}}>
        <button onClick={() => setBilling('monthly')} style={{padding: '8px 16px', border: 'none', background: billing === 'monthly' ? '#2563eb' : 'white', color: billing === 'monthly' ? 'white' : '#374151', cursor: 'pointer'}}>Monthly</button>
        <button onClick={() => setBilling('annual')} style={{padding: '8px 16px', border: 'none', background: billing === 'annual' ? '#2563eb' : 'white', color: billing === 'annual' ? 'white' : '#374151', cursor: 'pointer'}}>Annual</button>
      </div>
      {billing === 'annual' && <span style={{background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: 12, fontSize: 12}}>Save up to 20%</span>}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, width: '100%', maxWidth: 900}}>
        {plans.map(plan => (
          <div key={plan.name} style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 24}}>
            <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 8}}>{plan.name}</h3>
            <div style={{marginBottom: 16}}><span style={{fontSize: 28, fontWeight: 700}}>${billing === 'monthly' ? plan.monthly : plan.annual}</span><span style={{color: '#6b7280'}}>/month</span></div>
            <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '12px 0'}} />
            <ul style={{listStyle: 'none', padding: 0, margin: '0 0 16px'}}>
              {plan.features.map(f => <li key={f} style={{padding: '4px 0'}}>{f}</li>)}
            </ul>
            <button style={{width: '100%', padding: '10px 16px', border: plan.name === 'Pro' ? 'none' : '1px solid #d1d5db', borderRadius: 6, background: plan.name === 'Pro' ? '#2563eb' : 'white', color: plan.name === 'Pro' ? 'white' : '#374151', cursor: 'pointer'}}>Choose {plan.name}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
