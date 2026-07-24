// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isPopular?: boolean;
}

const tiers: PricingTier[] = [
  {name: 'Starter', monthlyPrice: 12, annualPrice: 9, features: ['5 projects', '1 GB storage', 'Email support']},
  {name: 'Pro', monthlyPrice: 29, annualPrice: 24, features: ['Unlimited projects', '10 GB storage', 'Priority support', 'Custom domains'], isPopular: true},
  {name: 'Enterprise', monthlyPrice: 79, annualPrice: 65, features: ['Unlimited everything', '100 GB storage', '24/7 phone support', 'SSO', 'Audit logs']},
];

export function PricingTable() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, padding: '48px 16px', fontFamily: 'system-ui, sans-serif'}}>
      <h1 style={{fontSize: 36, fontWeight: 700, margin: 0}}>Simple, transparent pricing</h1>
      <div style={{display: 'flex', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden'}}>
        <button onClick={() => setBilling('monthly')} style={{padding: '8px 20px', border: 'none', backgroundColor: billing === 'monthly' ? '#2563eb' : 'white', color: billing === 'monthly' ? 'white' : '#333', cursor: 'pointer'}}>Monthly</button>
        <button onClick={() => setBilling('annual')} style={{padding: '8px 20px', border: 'none', backgroundColor: billing === 'annual' ? '#2563eb' : 'white', color: billing === 'annual' ? 'white' : '#333', cursor: 'pointer'}}>Annual (save 20%)</button>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, width: '100%', maxWidth: 900}}>
        {tiers.map(tier => (
          <div key={tier.name} style={{border: tier.isPopular ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <h3 style={{margin: 0, fontSize: 20, fontWeight: 600}}>{tier.name}</h3>
              {tier.isPopular && <span style={{padding: '2px 8px', borderRadius: 12, fontSize: 12, backgroundColor: '#2563eb', color: 'white'}}>Popular</span>}
            </div>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 4}}>
              <span style={{fontSize: 36, fontWeight: 700}}>${billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice}</span>
              <span style={{color: '#666'}}>/month</span>
            </div>
            <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, flex: 1}}>
              {tier.features.map(feature => (
                <li key={feature} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={{color: '#22c55e'}}>&#10003;</span> {feature}
                </li>
              ))}
            </ul>
            <button style={{padding: '12px 24px', border: 'none', borderRadius: 6, backgroundColor: tier.isPopular ? '#2563eb' : '#f3f4f6', color: tier.isPopular ? 'white' : '#333', cursor: 'pointer', fontWeight: 500, width: '100%'}}>
              {tier.isPopular ? 'Get started' : 'Choose plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PricingTable;
