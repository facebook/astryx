import React, {useState, useEffect} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Skeleton} from '@astryxdesign/core/Skeleton';

type State = 'loading' | 'error' | 'success';

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [data, setData] = useState<{revenue: string; users: number; growth: string} | null>(null);

  const fetchData = () => {
    setState('loading'); setData(null);
    setTimeout(() => {
      if (Math.random() > 0.6) setState('error');
      else { setData({revenue: '$12,450', users: 1284, growth: '+12.5%'}); setState('success'); }
    }, 2000);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="max-w-sm p-6">
      <Card>
        <div className="flex flex-col gap-3">
          <Heading level={3}>Dashboard</Heading>
          {state === 'loading' && (
            <div className="flex flex-col gap-2">
              <Skeleton width="100%" height={20} index={0} />
              <Skeleton width="80%" height={20} index={1} />
              <Skeleton width="60%" height={20} index={2} />
              <Spinner label="Loading dashboard data" />
            </div>
          )}
          {state === 'error' && <Banner status="error" title="Failed to load data" description="Could not fetch metrics." endContent={<Button label="Retry" size="sm" onClick={fetchData} />} />}
          {state === 'success' && data && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center"><Text type="label">Revenue</Text><Text weight="bold">{data.revenue}</Text></div>
              <div className="flex justify-between items-center"><Text type="label">Active Users</Text><Text weight="bold">{data.users.toLocaleString()}</Text></div>
              <div className="flex justify-between items-center"><Text type="label">Growth</Text><Text weight="bold" color="accent">{data.growth}</Text></div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
