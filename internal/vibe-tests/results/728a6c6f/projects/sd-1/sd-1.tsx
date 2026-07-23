// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription} from '@/components/ui/alert';

type State = 'loading' | 'error' | 'data';

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [metrics, setMetrics] = useState<Array<{label: string; value: string; change: string}>>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() > 0.3) {
        setMetrics([
          {label: 'Revenue', value: '$12,450', change: '+12%'},
          {label: 'Users', value: '1,234', change: '+5%'},
          {label: 'Orders', value: '89', change: '-2%'},
        ]);
        setState('data');
      } else {
        setState('error');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const retry = () => {
    setState('loading');
    setTimeout(() => {
      setMetrics([{label: 'Revenue', value: '$12,450', change: '+12%'}, {label: 'Users', value: '1,234', change: '+5%'}, {label: 'Orders', value: '89', change: '-2%'}]);
      setState('data');
    }, 1500);
  };

  return (
    <Card className="w-96">
      <CardHeader><CardTitle>Weekly Metrics</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {state === 'loading' && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}
        {state === 'error' && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertDescription>Failed to load metrics. The server returned an error.</AlertDescription>
            </Alert>
            <Button variant="outline" onClick={retry}>Retry</Button>
          </div>
        )}
        {state === 'data' && (
          <div className="space-y-2">
            {metrics.map(m => (
              <div key={m.label} className="flex justify-between items-center p-3 rounded-md bg-muted">
                <div><p className="text-xs text-muted-foreground">{m.label}</p><p className="font-semibold">{m.value}</p></div>
                <span className="text-sm text-muted-foreground">{m.change}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
