'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';

const metrics = [
  {label: 'Revenue', value: '$48,290'},
  {label: 'Active Users', value: '12,841'},
  {label: 'Conversion', value: '3.2%'},
  {label: 'Avg Response', value: '245ms'},
];

export default function GridDashboardLayout() {
  return (
    <XDSGrid columns={4} gap={4}>
      <XDSGridSpan columns={2} rows={2}>
        <XDSCard>
          <XDSText type="label" display="block">
            Weekly Traffic
          </XDSText>
          <XDSText type="supporting" display="block">
            Page views and unique visitors over the last 7 days
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
      {metrics.map(m => (
        <XDSCard key={m.label}>
          <XDSText type="supporting" display="block">
            {m.label}
          </XDSText>
          <XDSText type="label" display="block">
            {m.value}
          </XDSText>
        </XDSCard>
      ))}
      <XDSGridSpan columns="full">
        <XDSCard>
          <XDSText type="label" display="block">
            Recent Activity
          </XDSText>
          <XDSText type="supporting" display="block">
            Latest events across all projects
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
    </XDSGrid>
  );
}
