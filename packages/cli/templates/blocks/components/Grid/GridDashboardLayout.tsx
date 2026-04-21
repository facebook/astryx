'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';

const metrics = [
  {label: 'Metric 1', description: 'Quick stat'},
  {label: 'Metric 2', description: 'Quick stat'},
  {label: 'Metric 3', description: 'Quick stat'},
  {label: 'Metric 4', description: 'Quick stat'},
];

export default function GridDashboardLayout() {
  return (
    <XDSGrid columns={4} gap={4}>
      <XDSGridSpan columns={2} rows={2}>
        <XDSCard>
          <XDSText type="label" display="block">
            Main Chart
          </XDSText>
          <XDSText type="supporting" display="block">
            Large visualization widget
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
      {metrics.map(m => (
        <XDSCard key={m.label}>
          <XDSText type="label" display="block">
            {m.label}
          </XDSText>
          <XDSText type="supporting" display="block">
            {m.description}
          </XDSText>
        </XDSCard>
      ))}
      <XDSGridSpan columns="full">
        <XDSCard>
          <XDSText type="label" display="block">
            Full-width Section
          </XDSText>
          <XDSText type="supporting" display="block">
            This section spans the entire width of the grid
          </XDSText>
        </XDSCard>
      </XDSGridSpan>
    </XDSGrid>
  );
}
