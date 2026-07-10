// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

const plans = [
  {name: 'Starter', monthly: 9, annual: 7, features: ['5 projects', '10GB storage', 'Email support']},
  {name: 'Pro', monthly: 29, annual: 23, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access']},
  {name: 'Enterprise', monthly: 99, annual: 79, features: ['Everything in Pro', '1TB storage', 'Dedicated account manager', 'SSO']},
];

export default function PricingTable() {
  const [isAnnual, setIsAnnual] = useState(false);

  const cardStyle = {width: 280, padding: 24, border: '1px solid #e0e0e0', borderRadius: 12, backgroundColor: '#fff'};
  const btnStyle = (active: boolean) => ({padding: '8px 16px', backgroundColor: active ? '#0066cc' : 'transparent', color: active ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer'});

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: 32}}>
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        <button style={btnStyle(!isAnnual)} onClick={() => setIsAnnual(false)}>Monthly</button>
        <button style={btnStyle(isAnnual)} onClick={() => setIsAnnual(true)}>Annual</button>
        {isAnnual && <span style={{backgroundColor: '#e8f5e9', padding: '2px 8px', borderRadius: 4, fontSize: 12}}>Save 20%</span>}
      </div>
      <div style={{display: 'flex', gap: 16}}>
        {plans.map((plan) => (
          <div key={plan.name} style={cardStyle}>
            <h3>{plan.name}</h3>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 4}}>
              <span style={{fontSize: 32, fontWeight: 'bold'}}>${isAnnual ? plan.annual : plan.monthly}</span>
              <span style={{color: '#666'}}>/month</span>
            </div>
            <hr style={{margin: '16px 0', border: 'none', borderTop: '1px solid #eee'}} />
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {plan.features.map((f) => <li key={f} style={{padding: '4px 0', fontSize: 14}}>{f}</li>)}
            </ul>
            <button style={{...btnStyle(true), width: '100%', marginTop: 16}}>Choose {plan.name}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
