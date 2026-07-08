// Copyright (c) Meta Platforms, Inc. and affiliates.

const plans = [
  {name: 'Starter', price: '$9/mo', highlighted: false},
  {name: 'Pro', price: '$29/mo', highlighted: false},
  {name: 'Enterprise', price: 'Custom', highlighted: true},
];

export default function ComparisonHeader() {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)'}}>
      {plans.map((plan, i) => (
        <div key={plan.name} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24,
          borderRight: i < plans.length - 1 ? '1px solid #e5e7eb' : 'none',
          backgroundColor: plan.highlighted ? '#f8f9fa' : 'transparent',
        }}>
          <h3 style={{margin: 0, fontSize: 18, fontWeight: 600}}>{plan.name}</h3>
          {plan.highlighted && <span style={{padding: '2px 8px', backgroundColor: '#0d6efd', color: 'white', borderRadius: 12, fontSize: 12}}>Popular</span>}
          <span style={{fontSize: 24, fontWeight: 700}}>{plan.price}</span>
        </div>
      ))}
    </div>
  );
}
