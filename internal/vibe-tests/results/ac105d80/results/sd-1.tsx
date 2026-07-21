import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';

type State = 'loading' | 'error' | 'success';

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [data, setData] = useState<{revenue: string; users: number; growth: string} | null>(null);

  const fetchData = () => { setState('loading'); setData(null); setTimeout(() => { if (Math.random() > 0.6) setState('error'); else { setData({revenue: '$12,450', users: 1284, growth: '+12.5%'}); setState('success'); } }, 2000); };
  useEffect(() => { fetchData(); }, []);

  return (
    <Card className="max-w-sm">
      <CardHeader><CardTitle>Dashboard</CardTitle></CardHeader>
      <CardContent>
        {state === 'loading' && <div className="space-y-2"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-4/5" /><Skeleton className="h-5 w-3/5" /><p className="text-sm text-muted-foreground mt-2">Loading...</p></div>}
        {state === 'error' && <div className="space-y-2 text-destructive"><p className="font-medium">Failed to load data</p><p className="text-sm">Could not fetch metrics.</p><Button size="sm" variant="outline" onClick={fetchData}>Retry</Button></div>}
        {state === 'success' && data && <div className="space-y-3">{[['Revenue', data.revenue], ['Active Users', data.users.toLocaleString()], ['Growth', data.growth]].map(([l, v]) => <div key={l as string} className="flex justify-between"><span className="text-sm text-muted-foreground">{l}</span><span className="font-semibold">{v}</span></div>)}</div>}
      </CardContent>
    </Card>
  );
}
