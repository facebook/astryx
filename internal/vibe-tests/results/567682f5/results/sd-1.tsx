// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Loader2, AlertCircle} from 'lucide-react';

type Status = 'loading' | 'error' | 'success';

interface DashboardData {
  revenue: number;
  users: number;
  growth: number;
}

export default function DashboardWidget() {
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<DashboardData | null>(null);

  function fetchData() {
    setStatus('loading');
    setData(null);
    setTimeout(() => {
      if (Math.random() > 0.3) {
        setData({revenue: 48250, users: 1240, growth: 12.5});
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 1500);
  }

  useEffect(() => { fetchData(); }, []);

  if (status === 'loading') {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-6 space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Something went wrong while fetching dashboard data.</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={fetchData}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Dashboard Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-xl font-bold">${data!.revenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Users</p>
            <p className="text-xl font-bold">{data!.users.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Growth</p>
            <p className="text-xl font-bold">+{data!.growth}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
