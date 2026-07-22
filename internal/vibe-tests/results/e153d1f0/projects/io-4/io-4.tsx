import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent} from '@/components/ui/card';
import {Minus, Plus} from 'lucide-react';
import {useState} from 'react';

export default function QuantitySelector() {
  const [qty, setQty] = useState(1);

  const update = async (val: number) => {
    const clamped = Math.min(99, Math.max(1, val));
    setQty(clamped);
    await fetch('/api/cart/update', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({quantity: clamped})});
  };

  return (
    <Card className="w-48">
      <CardContent className="pt-4 space-y-2">
        <p className="font-medium text-sm">Quantity</p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => update(qty - 1)} disabled={qty <= 1}><Minus className="h-4 w-4" /></Button>
          <Input type="number" value={qty} min={1} max={99} onChange={e => update(Number(e.target.value))} className="w-16 text-center" />
          <Button variant="outline" size="icon" onClick={() => update(qty + 1)} disabled={qty >= 99}><Plus className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
