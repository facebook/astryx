import {useState, useEffect} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';

type State = 'loading' | 'error' | 'success';

interface DashboardData {
  revenue: string;
  users: number;
  orders: number;
}

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const shouldFail = Math.random() > 0.7;
      if (shouldFail) {
        setState('error');
      } else {
        setData({revenue: '$12,450', users: 1234, orders: 89});
        setState('success');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card padding={4} width={400}>
      <Stack gap={3}>
        <Text type="label" weight="semibold">Dashboard Overview</Text>
        {state === 'loading' && (
          <Stack gap={2}>
            <Skeleton width="100%" height={20} index={0} />
            <Skeleton width="80%" height={20} index={1} />
            <Skeleton width="60%" height={20} index={2} />
          </Stack>
        )}
        {state === 'error' && (
          <Stack gap={2}>
            <Banner variant="error">Failed to load dashboard data.</Banner>
            <Button variant="secondary" clickAction={() => setState('loading')}>Retry</Button>
          </Stack>
        )}
        {state === 'success' && data && (
          <Stack gap={2}>
            <Text>Revenue: {data.revenue}</Text>
            <Text>Active Users: {data.users}</Text>
            <Text>Orders: {data.orders}</Text>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
