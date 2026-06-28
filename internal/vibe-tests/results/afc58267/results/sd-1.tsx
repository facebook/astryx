// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useEffect} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {Button} from '@astryxdesign/core/Button';
import {Banner} from '@astryxdesign/core/Banner';

type Status = 'loading' | 'error' | 'success';

export default function DashboardWidget() {
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<{revenue: number; users: number; growth: number} | null>(null);

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
      <Card>
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Spinner size="lg" />
          <Text color="secondary">Loading dashboard data...</Text>
        </div>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card>
        <div className="p-6 space-y-4">
          <Banner variant="error" title="Failed to load data">Something went wrong while fetching dashboard data.</Banner>
          <Button label="Retry" variant="secondary" onClick={fetchData} />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <Heading level={3}>Dashboard Overview</Heading>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <Text color="secondary" size="sm">Revenue</Text>
            <Text size="xl" weight="bold">${data!.revenue.toLocaleString()}</Text>
          </div>
          <div>
            <Text color="secondary" size="sm">Active Users</Text>
            <Text size="xl" weight="bold">{data!.users.toLocaleString()}</Text>
          </div>
          <div>
            <Text color="secondary" size="sm">Growth</Text>
            <Text size="xl" weight="bold">+{data!.growth}%</Text>
          </div>
        </div>
      </div>
    </Card>
  );
}
