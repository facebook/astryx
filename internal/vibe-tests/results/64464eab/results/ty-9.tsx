import {Badge} from '@/components/ui/badge';

const plans = [
  {name: 'Starter', price: '$9/mo'},
  {name: 'Pro', price: '$29/mo'},
  {name: 'Enterprise', price: 'Custom', highlighted: true},
];

export default function ComparisonTableHeader() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {plans.map(plan => (
        <div key={plan.name} className="p-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{plan.name}</span>
            {plan.highlighted && <Badge variant="secondary">Most Popular</Badge>}
          </div>
          <p className="text-2xl font-bold">{plan.price}</p>
        </div>
      ))}
    </div>
  );
}
