// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useEffect} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Button} from '@astryxdesign/core/Button';
import {Banner} from '@astryxdesign/core/Banner';

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

  useEffect(() => {
    fetchData();
  }, []);

  if (status === 'loading') {
    return (
      <Card>
        <VStack gap="md" align="center" style={{padding: 'var(--xds-spacing-xl)'}}>
          <Spinner size="lg" />
          <Text color="secondary">Loading dashboard data...</Text>
        </VStack>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card>
        <VStack gap="md" style={{padding: 'var(--xds-spacing-lg)'}}>
          <Banner variant="error" title="Failed to load data">
            Something went wrong while fetching dashboard data.
          </Banner>
          <Button label="Retry" variant="secondary" onClick={fetchData} />
        </VStack>
      </Card>
    );
  }

  return (
    <Card>
      <VStack gap="md" style={{padding: 'var(--xds-spacing-lg)'}}>
        <Heading level={3}>Dashboard Overview</Heading>
        <HStack gap="lg" wrap="wrap">
          <VStack gap="xs">
            <Text color="secondary" size="sm">Revenue</Text>
            <Text size="xl" weight="bold">${data!.revenue.toLocaleString()}</Text>
          </VStack>
          <VStack gap="xs">
            <Text color="secondary" size="sm">Active Users</Text>
            <Text size="xl" weight="bold">{data!.users.toLocaleString()}</Text>
          </VStack>
          <VStack gap="xs">
            <Text color="secondary" size="sm">Growth</Text>
            <Text size="xl" weight="bold">+{data!.growth}%</Text>
          </VStack>
        </HStack>
      </VStack>
    </Card>
  );
}
