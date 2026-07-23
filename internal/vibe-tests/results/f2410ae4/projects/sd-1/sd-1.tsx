// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useEffect} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Banner} from '@astryxdesign/core/Banner';

type State = 'loading' | 'error' | 'data';

interface MetricData {
  label: string;
  value: string;
  change: string;
}

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [metrics, setMetrics] = useState<MetricData[]>([]);

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
      setMetrics([
        {label: 'Revenue', value: '$12,450', change: '+12%'},
        {label: 'Users', value: '1,234', change: '+5%'},
        {label: 'Orders', value: '89', change: '-2%'},
      ]);
      setState('data');
    }, 1500);
  };

  return (
    <Card width={400}>
      <VStack gap={3}>
        <Heading level={3}>Weekly Metrics</Heading>

        {state === 'loading' && (
          <VStack gap={2}>
            <Skeleton width="100%" height={60} index={0} />
            <Skeleton width="100%" height={60} index={1} />
            <Skeleton width="100%" height={60} index={2} />
          </VStack>
        )}

        {state === 'error' && (
          <VStack gap={3}>
            <Banner variant="error">
              Failed to load metrics. The server returned an error.
            </Banner>
            <Button label="Retry" variant="secondary" onClick={retry} />
          </VStack>
        )}

        {state === 'data' && (
          <VStack gap={2}>
            {metrics.map(metric => (
              <HStack key={metric.label} gap={2}>
                <VStack gap={0}>
                  <Text type="supporting">{metric.label}</Text>
                  <Text type="body">{metric.value}</Text>
                </VStack>
                <Text type="supporting">{metric.change}</Text>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    </Card>
  );
}
