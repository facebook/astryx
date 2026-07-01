// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (KPI metrics, daily series, endpoint rows)
 * @output KPI summary dashboard: header with time-range control, a 4-up Stat
 *   row with sentiment-aware deltas and sparklines, two chart widgets in
 *   Cards, and a compact top-endpoints table
 * @position Page template; emitted by `astryx template kpi-dashboard`
 *
 * Responsive contract:
 * - KPI row: Grid columns={{minWidth: 240, max: 4}} — 4-up on wide viewports,
 *   reflowing to 2-up and 1-up as the viewport narrows.
 * - Chart widgets: Grid columns={{minWidth: 320, repeat: 'fit'}} — side by
 *   side when space allows, stacked on narrow viewports.
 * - Table: proportional columns absorb remaining width; pixel columns keep
 *   numeric cells stable. Header actions stay pinned right via StackItem fill.
 */

import {useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {Stat} from '@astryxdesign/core/Stat';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {
  ChartV2 as Chart,
  ChartGrid,
  ChartAxis,
  line,
  bar,
} from '@astryxdesign/lab';
import {ArrowPathIcon} from '@heroicons/react/24/outline';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Reserve the sparkline's box so all four KPI cards keep equal height.
  sparkline: {height: 40, width: '100%'},
  // Numeric table cells use tabular numerals so digit columns stay aligned.
  numericCell: {fontVariantNumeric: 'tabular-nums'},
  // Keep the chart from collapsing when the card flexes below min width.
  chartBody: {minWidth: 0, paddingTop: 'var(--spacing-2)'},
};

// Chart series colors via Astryx design tokens (CSS custom properties)
const chartColors = {
  requests: 'var(--color-data-categorical-blue, #0171E3)',
  errors: 'var(--color-data-categorical-orange, #EB6E00)',
  signups: 'var(--color-data-categorical-green, #0B991F)',
  spark: 'var(--color-data-categorical-purple, #6B1EFD)',
};

// ============= DATA =============

// KPI row — one entry per Stat card. `sentiment` inverts the delta color
// mapping for metrics where a drop is good (error rate) or a rise is bad
// (P95 latency). Sparklines are 14 deterministic daily samples.
const kpis = [
  {
    label: 'Total requests',
    value: '2.4M',
    delta: {value: '+12.4%', direction: 'up'},
    description: 'vs. previous 30 days',
    spark: [
      148, 152, 149, 158, 163, 160, 171, 168, 176, 182, 179, 188, 194, 201,
    ],
  },
  {
    label: 'Error rate',
    value: '0.42%',
    delta: {value: '-0.08%', direction: 'down', sentiment: 'positive'},
    description: 'vs. previous 30 days',
    spark: [62, 58, 61, 55, 57, 52, 54, 49, 51, 47, 48, 45, 44, 42],
  },
  {
    label: 'P95 latency',
    value: '284 ms',
    delta: {value: '+18 ms', direction: 'up', sentiment: 'negative'},
    description: 'vs. previous 30 days',
    spark: [
      255, 251, 260, 258, 266, 262, 270, 268, 275, 271, 278, 280, 282, 284,
    ],
  },
  {
    label: 'Active users',
    value: '18,204',
    delta: {value: '0.0%', direction: 'flat'},
    description: 'vs. previous 30 days',
    spark: [
      180, 183, 181, 184, 182, 185, 183, 182, 184, 181, 183, 182, 184, 182,
    ],
  },
] as const;

// Requests vs. errors, one point per day over two weeks (thousands).
const trafficData = [
  {day: 'Jun 10', requests: 148, errors: 9},
  {day: 'Jun 11', requests: 152, errors: 8},
  {day: 'Jun 12', requests: 149, errors: 10},
  {day: 'Jun 13', requests: 158, errors: 8},
  {day: 'Jun 14', requests: 163, errors: 7},
  {day: 'Jun 15', requests: 160, errors: 9},
  {day: 'Jun 16', requests: 171, errors: 8},
  {day: 'Jun 17', requests: 168, errors: 7},
  {day: 'Jun 18', requests: 176, errors: 6},
  {day: 'Jun 19', requests: 182, errors: 8},
  {day: 'Jun 20', requests: 179, errors: 7},
  {day: 'Jun 21', requests: 188, errors: 6},
  {day: 'Jun 22', requests: 194, errors: 7},
  {day: 'Jun 23', requests: 201, errors: 6},
];

// New signups per acquisition channel for the selected period.
const signupsData = [
  {channel: 'Organic', signups: 428},
  {channel: 'Referral', signups: 342},
  {channel: 'Paid', signups: 289},
  {channel: 'Social', signups: 214},
  {channel: 'Email', signups: 186},
  {channel: 'Partner', signups: 122},
  {channel: 'Other', signups: 64},
];

// Top endpoints table — compact ranking of the busiest API routes.
interface EndpointRow extends Record<string, unknown> {
  id: string;
  endpoint: string;
  requests: string;
  errorRate: string;
  p95: string;
  status: 'healthy' | 'degraded' | 'failing';
}

const endpointRows: EndpointRow[] = [
  {
    id: '1',
    endpoint: 'GET /api/v2/search',
    requests: '412,908',
    errorRate: '0.21%',
    p95: '188 ms',
    status: 'healthy',
  },
  {
    id: '2',
    endpoint: 'GET /api/v2/users/:id',
    requests: '365,441',
    errorRate: '0.18%',
    p95: '96 ms',
    status: 'healthy',
  },
  {
    id: '3',
    endpoint: 'POST /api/v2/events',
    requests: '298,730',
    errorRate: '0.34%',
    p95: '241 ms',
    status: 'healthy',
  },
  {
    id: '4',
    endpoint: 'GET /api/v2/feed',
    requests: '244,067',
    errorRate: '1.92%',
    p95: '612 ms',
    status: 'degraded',
  },
  {
    id: '5',
    endpoint: 'POST /api/v2/checkout',
    requests: '181,512',
    errorRate: '0.09%',
    p95: '324 ms',
    status: 'healthy',
  },
  {
    id: '6',
    endpoint: 'GET /api/v2/recommendations',
    requests: '154,289',
    errorRate: '4.87%',
    p95: '1,204 ms',
    status: 'failing',
  },
  {
    id: '7',
    endpoint: 'PUT /api/v2/settings',
    requests: '98,116',
    errorRate: '0.12%',
    p95: '142 ms',
    status: 'healthy',
  },
  {
    id: '8',
    endpoint: 'GET /api/v2/exports',
    requests: '61,435',
    errorRate: '2.41%',
    p95: '890 ms',
    status: 'degraded',
  },
];

const statusVariant: Record<EndpointRow['status'], 'green' | 'orange' | 'red'> =
  {
    healthy: 'green',
    degraded: 'orange',
    failing: 'red',
  };

const statusLabel: Record<EndpointRow['status'], string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  failing: 'Failing',
};

const endpointColumns: TableColumn<EndpointRow>[] = [
  {
    key: 'endpoint',
    header: 'Endpoint',
    width: proportional(2),
    renderCell: (item: EndpointRow) => <Text type="body">{item.endpoint}</Text>,
  },
  {
    key: 'requests',
    header: 'Requests',
    width: pixel(120),
    renderCell: (item: EndpointRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.requests}</Text>
      </span>
    ),
  },
  {
    key: 'errorRate',
    header: 'Error rate',
    width: pixel(100),
    renderCell: (item: EndpointRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.errorRate}</Text>
      </span>
    ),
  },
  {
    key: 'p95',
    header: 'P95',
    width: pixel(100),
    renderCell: (item: EndpointRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.p95}</Text>
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(110),
    renderCell: (item: EndpointRow) => (
      <Badge
        label={statusLabel[item.status]}
        variant={statusVariant[item.status]}
      />
    ),
  },
];

// ============= WIDGET COMPONENTS =============

/** Minimal trend line for a Stat's media slot — no axes, grid, or tooltip. */
function KpiSparkline({data}: {data: readonly number[]}) {
  const chartData = data.map((value, index) => ({index, value}));
  return (
    <div style={styles.sparkline}>
      <Chart
        data={chartData}
        xKey="index"
        series={[line('value', {color: chartColors.spark})]}
        height={40}
        margin={{top: 4, right: 0, bottom: 4, left: 0}}
      />
    </div>
  );
}

/** Card wrapper for a chart widget: title, supporting caption, chart body. */
function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <VStack gap={1}>
        <Heading level={3}>{title}</Heading>
        <Text type="supporting" color="secondary">
          {caption}
        </Text>
        <div style={styles.chartBody}>{children}</div>
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function KpiDashboardTemplate() {
  const [range, setRange] = useState('30d');

  return (
    <Layout
      height="auto"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Heading level={1}>Operations overview</Heading>
            </StackItem>
            <SegmentedControl
              value={range}
              onChange={setRange}
              label="Time range"
              size="md">
              <SegmentedControlItem value="24h" label="24h" />
              <SegmentedControlItem value="7d" label="7d" />
              <SegmentedControlItem value="30d" label="30d" />
              <SegmentedControlItem value="90d" label="90d" />
            </SegmentedControl>
            <IconButton
              label="Refresh"
              icon={<Icon icon={ArrowPathIcon} size="sm" />}
              variant="ghost"
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            {/* KPI row — 4-up Stat cards with deltas and sparklines */}
            <Grid columns={{minWidth: 240, max: 4}} gap={4}>
              {kpis.map(kpi => (
                <Card key={kpi.label}>
                  <Stat
                    label={kpi.label}
                    value={kpi.value}
                    delta={kpi.delta}
                    description={kpi.description}
                    media={<KpiSparkline data={kpi.spark} />}
                  />
                </Card>
              ))}
            </Grid>

            {/* Chart widgets */}
            <Grid columns={{minWidth: 320, repeat: 'fit'}} gap={4}>
              <ChartCard
                title="Traffic"
                caption="Requests vs. errors per day (thousands)">
                <Chart
                  data={trafficData}
                  xKey="day"
                  series={[
                    line('requests', {
                      color: chartColors.requests,
                      label: 'Requests',
                    }),
                    line('errors', {
                      color: chartColors.errors,
                      label: 'Errors',
                    }),
                  ]}
                  legend={{position: 'bottom', alignment: 'center'}}
                  tooltip={true}
                  grid={<ChartGrid horizontal />}
                  axes={
                    <>
                      <ChartAxis position="bottom" />
                      <ChartAxis
                        position="left"
                        tickFormat={(v: unknown) => `${v}k`}
                      />
                    </>
                  }
                  height={260}
                  margin={{left: 40, right: 10, top: 10, bottom: 30}}
                />
              </ChartCard>
              <ChartCard
                title="Signups by channel"
                caption="New signups per acquisition channel">
                <Chart
                  data={signupsData}
                  xKey="channel"
                  series={[
                    bar('signups', {
                      color: chartColors.signups,
                      radius: 4,
                      label: 'Signups',
                    }),
                  ]}
                  legend={{position: 'bottom', alignment: 'center'}}
                  tooltip={true}
                  grid={<ChartGrid horizontal />}
                  axes={
                    <>
                      <ChartAxis position="bottom" />
                      <ChartAxis position="left" />
                    </>
                  }
                  height={260}
                  margin={{left: 40, right: 10, top: 10, bottom: 30}}
                />
              </ChartCard>
            </Grid>

            {/* Top endpoints */}
            <Card>
              <VStack gap={4}>
                <HStack hAlign="between" vAlign="center">
                  <Heading level={3}>Top endpoints</Heading>
                  <Text type="supporting" color="secondary">
                    Busiest routes for the selected period
                  </Text>
                </HStack>
                <Table<EndpointRow>
                  data={endpointRows}
                  columns={endpointColumns}
                  idKey="id"
                  density="compact"
                  dividers="rows"
                  hasHover
                />
              </VStack>
            </Card>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
