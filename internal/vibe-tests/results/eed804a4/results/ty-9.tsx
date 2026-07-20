const plans = [
  {name: 'Starter', price: '$9/mo'},
  {name: 'Pro', price: '$29/mo'},
  {name: 'Enterprise', price: 'Custom', highlighted: true},
];

export default function ComparisonTableHeader() {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16}}>
      {plans.map(plan => (
        <div key={plan.name} style={{padding: 16}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{fontWeight: 600}}>{plan.name}</span>
            {plan.highlighted && <span style={{background: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: 12, fontSize: 11}}>Most Popular</span>}
          </div>
          <p style={{fontSize: 24, fontWeight: 700, margin: '4px 0 0'}}>{plan.price}</p>
        </div>
      ))}
    </div>
  );
}
