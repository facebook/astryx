// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isPopular?: boolean;
}

const plans: Plan[] = [
  {name: 'Starter', monthlyPrice: 9, annualPrice: 7, features: ['5 projects', '10GB storage', 'Email support']},
  {name: 'Pro', monthlyPrice: 29, annualPrice: 24, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'], isPopular: true},
  {name: 'Enterprise', monthlyPrice: 99, annualPrice: 79, features: ['Unlimited everything', '1TB storage', 'Dedicated support', 'SSO', 'Audit logs']},
];

export default function PricingTable() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div style={{textAlign: 'center', padding: 48}}>
      <h1 style={{fontSize: 32, fontWeight: 'bold', marginBottom: 8}}>Simple, transparent pricing</h1>
      <p style={{color: '#666', marginBottom: 24}}>Choose the plan that fits your needs</p>
      <div style={{display: 'inline-flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd', marginBottom: 32}}>
        <button onClick={() => setBilling('monthly')} style={{padding: '8px 20px', backgroundColor: billing === 'monthly' ? '#0066cc' : '#fff', color: billing === 'monthly' ? '#fff' : '#333', border: 'none', cursor: 'pointer'}}>Monthly</button>
        <button onClick={() => setBilling('annual')} style={{padding: '8px 20px', backgroundColor: billing === 'annual' ? '#0066cc' : '#fff', color: billing === 'annual' ? '#fff' : '#333', border: 'none', cursor: 'pointer'}}>Annual (save 20%)</button>
      </div>
      <div style={{display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap'}}>
        {plans.map(plan => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          return (
            <div key={plan.name} style={{border: plan.isPopular ? '2px solid #0066cc' : '1px solid #ddd', borderRadius: 12, padding: 24, width: 280, textAlign: 'left'}}>
              {plan.isPopular && <span style={{backgroundColor: '#e6f0ff', color: '#0066cc', fontSize: 12, padding: '2px 8px', borderRadius: 4, fontWeight: 600}}>Most Popular</span>}
              <h3 style={{fontSize: 20, fontWeight: 'bold', margin: '8px 0'}}>{plan.name}</h3>
              <div><span style={{fontSize: 36, fontWeight: 'bold'}}>${price}</span><span style={{color: '#666'}}>/mo</span></div>
              <hr style={{margin: '16px 0'}} />
              <ul style={{listStyle: 'none', padding: 0, margin: '0 0 16px'}}>
                {plan.features.map(f => <li key={f} style={{padding: '4px 0', fontSize: 14}}>&#10003; {f}</li>)}
              </ul>
              <button style={{width: '100%', padding: '10px 0', backgroundColor: plan.isPopular ? '#0066cc' : '#fff', color: plan.isPopular ? '#fff' : '#333', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>
                {plan.isPopular ? 'Get Started' : 'Choose Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
