// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Grid, GridSpan} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Text} from '@astryxdesign/core/Text';

const metrics = [
  {label: 'Revenue', value: '$48,290'},
  {label: 'Active Users', value: '12,841'},
  {label: 'Conversion', value: '3.2%'},
  {label: 'Avg Response', value: '245ms'},
];

export default function GridDashboardLayout() {
  return (
    <Grid columns={4} gap={4} width="100%" style={{maxWidth: 500}}>
      <GridSpan columns={2} rows={2}>
        <Card>
          <Text type="label" display="block">
            Weekly Traffic
          </Text>
          <Text type="supporting" display="block">
            Page views and unique visitors over the last 7 days
          </Text>
        </Card>
      </GridSpan>
      {metrics.map(m => (
        <Card key={m.label}>
          <Text type="supporting" display="block">
            {m.label}
          </Text>
          <Text type="label" display="block">
            {m.value}
          </Text>
        </Card>
      ))}
      <GridSpan columns="full">
        <Card>
          <Text type="label" display="block">
            Recent Activity
          </Text>
          <Text type="supporting" display="block">
            Latest events across all projects
          </Text>
        </Card>
      </GridSpan>
    </Grid>
  );
}
