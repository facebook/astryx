import {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';

type State = 'loading' | 'error' | 'success';

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [data, setData] = useState<{revenue: string; users: number; orders: number} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() > 0.7) { setState('error'); }
      else { setData({revenue: '$12,450', users: 1234, orders: 89}); setState('success'); }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="w-96">
      <CardHeader><CardTitle>Dashboard Overview</CardTitle></CardHeader>
      <CardContent>
        {state === 'loading' && <div className="space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-4/5" /><Skeleton className="h-5 w-3/5" /></div>}
        {state === 'error' && <div className="space-y-2"><p className="text-sm text-red-500">Failed to load.</p><Button variant="outline" size="sm" onClick={() => setState('loading')}>Retry</Button></div>}
        {state === 'success' && data && <div className="space-y-2"><p>Revenue: {data.revenue}</p><p>Users: {data.users}</p><p>Orders: {data.orders}</p></div>}
      </CardContent>
    </Card>
  );
}
