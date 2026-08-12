// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Service Health Monitor — a live-ops / SRE dashboard.
 *
 * Content-only (root `Layout`); the host supplies the app shell. Frame:
 *   header (global controls) | content (KPIs + charts + drill-down) | alerts rail (end)
 *
 * The time-window control (1h/1d/7d), environment, and region selectors are
 * real: they reshape the charts, KPI sparklines, and drill-down rows. The
 * alerts rail collapses into the content column below 1024px so the charts
 * and table keep full width.
 */

import {useMemo, useState, type CSSProperties} from 'react';
import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {Divider} from '@astryxdesign/core/Divider';
import {Badge} from '@astryxdesign/core/Badge';
import {Token} from '@astryxdesign/core/Token';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import type {StatusDotVariant} from '@astryxdesign/core/StatusDot';
import {Selector} from '@astryxdesign/core/Selector';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Switch} from '@astryxdesign/core/Switch';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {List, ListItem} from '@astryxdesign/core/List';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BellAlertIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {StopIcon} from '@heroicons/react/24/solid';

// ============= TYPES =============

type TimeWindow = '1h' | '1d' | '7d';
type Environment = 'production' | 'staging' | 'development';
type HealthStatus = 'healthy' | 'warning' | 'critical';

interface SeriesPoint {
  t: number;
  label: string;
  p50: number;
  p95: number;
  p99: number;
  useast: number;
  uswest: number;
  euwest: number;
}

interface WindowSeries {
  points: SeriesPoint[];
  ticks: number[];
  tickLabels: Record<number, string>;
}

// ============= CHART COLORS (design tokens w/ hex fallbacks) =============

const CHART_COLORS = {
  p50: 'var(--color-data-categorical-blue, #0171E3)',
  p95: 'var(--color-data-categorical-orange, #EB6E00)',
  p99: 'var(--color-data-categorical-purple, #6B1EFD)',
  useast: 'var(--color-data-categorical-blue, #0171E3)',
  uswest: 'var(--color-data-categorical-teal, #008E80)',
  euwest: 'var(--color-data-categorical-orange, #EB6E00)',
};

const STATUS_STROKE: Record<HealthStatus, string> = {
  healthy: 'var(--color-success, #0B991F)',
  warning: 'var(--color-warning, #B25000)',
  critical: 'var(--color-error, #D6002A)',
};

const STATUS_DOT: Record<HealthStatus, StatusDotVariant> = {
  healthy: 'success',
  warning: 'warning',
  critical: 'error',
};

// ============= DETERMINISTIC TIME-SERIES =============

// Environment traffic multipliers: staging/dev carry a fraction of prod load.
const ENV_FACTOR: Record<Environment, number> = {
  production: 1,
  staging: 0.16,
  development: 0.04,
};

// Lower environments run leaner, so latency trends slightly better.
const ENV_LATENCY_FACTOR: Record<Environment, number> = {
  production: 1,
  staging: 0.82,
  development: 0.7,
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Build a window deterministically — no clocks, no randomness — so previews
// and snapshots stay stable. A latency spike is baked into the middle of each
// window to correlate with the SEV2 alert in the rail.
function buildWindow(kind: TimeWindow): WindowSeries {
  const config: Record<
    TimeWindow,
    {n: number; stepMin: number; cycles: number}
  > = {
    '1h': {n: 30, stepMin: 2, cycles: 1.2},
    '1d': {n: 48, stepMin: 30, cycles: 2},
    '7d': {n: 42, stepMin: 240, cycles: 7},
  };
  const {n, stepMin, cycles} = config[kind];
  const points: SeriesPoint[] = [];

  for (let i = 0; i < n; i++) {
    const phase = (i / n) * Math.PI * 2 * cycles;
    const diurnal = Math.sin(phase);
    const diurnal2 = Math.sin(phase + 1.1);
    const diurnal3 = Math.sin(phase + 2.3);
    // A localized latency spike centered around 62% through the window.
    const spikeCenter = Math.round(n * 0.62);
    const dist = Math.abs(i - spikeCenter);
    const spike = dist <= 4 ? (5 - dist) * 34 : 0;

    const totalMin = i * stepMin;
    let label: string;
    if (kind === '7d') {
      label = DAY_LABELS[Math.floor(totalMin / (60 * 24)) % 7];
    } else {
      const hh = Math.floor(totalMin / 60) % 24;
      const mm = totalMin % 60;
      label = `${pad2(hh)}:${pad2(mm)}`;
    }

    points.push({
      t: i,
      label,
      p50: Math.round(46 + 9 * diurnal + spike * 0.15),
      p95: Math.round(158 + 38 * diurnal + spike * 0.6),
      p99: Math.round(312 + 88 * diurnal + spike * 1.6),
      useast: Math.round(9200 + 2600 * diurnal),
      uswest: Math.round(6100 + 1500 * diurnal2),
      euwest: Math.round(3900 + 1200 * diurnal3),
    });
  }

  let ticks: number[];
  if (kind === '7d') {
    ticks = [0, 6, 12, 18, 24, 30, 36];
  } else if (kind === '1d') {
    ticks = [0, 12, 24, 36, 47];
  } else {
    ticks = [0, 10, 20, 29];
  }
  const tickLabels: Record<number, string> = {};
  for (const tk of ticks) {
    tickLabels[tk] = points[Math.min(tk, points.length - 1)]?.label ?? '';
  }

  return {points, ticks, tickLabels};
}

const SERIES: Record<TimeWindow, WindowSeries> = {
  '1h': buildWindow('1h'),
  '1d': buildWindow('1d'),
  '7d': buildWindow('7d'),
};

// ============= KPI DATA (per environment) =============

interface Kpi {
  key: string;
  label: string;
  value: string;
  status: HealthStatus;
  statusLabel: string;
  delta: string;
  // Whether the delta direction is a good thing (drives arrow + color).
  deltaPositive: boolean;
}

const KPI_BY_ENV: Record<Environment, Kpi[]> = {
  production: [
    {
      key: 'health',
      label: 'Overall health',
      value: '98.6%',
      status: 'healthy',
      statusLabel: 'Healthy',
      delta: '+0.3%',
      deltaPositive: true,
    },
    {
      key: 'error',
      label: 'Error rate',
      value: '1.84%',
      status: 'warning',
      statusLabel: 'Elevated',
      delta: '+0.9%',
      deltaPositive: false,
    },
    {
      key: 'latency',
      label: 'p99 latency',
      value: '512 ms',
      status: 'warning',
      statusLabel: 'Above target',
      delta: '+84 ms',
      deltaPositive: false,
    },
    {
      key: 'availability',
      label: 'Availability',
      value: '99.98%',
      status: 'healthy',
      statusLabel: 'Operational',
      delta: '+0.01%',
      deltaPositive: true,
    },
  ],
  staging: [
    {
      key: 'health',
      label: 'Overall health',
      value: '99.4%',
      status: 'healthy',
      statusLabel: 'Healthy',
      delta: '+0.1%',
      deltaPositive: true,
    },
    {
      key: 'error',
      label: 'Error rate',
      value: '0.42%',
      status: 'healthy',
      statusLabel: 'Nominal',
      delta: '-0.2%',
      deltaPositive: true,
    },
    {
      key: 'latency',
      label: 'p99 latency',
      value: '338 ms',
      status: 'healthy',
      statusLabel: 'Within target',
      delta: '-12 ms',
      deltaPositive: true,
    },
    {
      key: 'availability',
      label: 'Availability',
      value: '99.95%',
      status: 'healthy',
      statusLabel: 'Operational',
      delta: '0.00%',
      deltaPositive: true,
    },
  ],
  development: [
    {
      key: 'health',
      label: 'Overall health',
      value: '96.1%',
      status: 'warning',
      statusLabel: 'Flaky',
      delta: '-1.8%',
      deltaPositive: false,
    },
    {
      key: 'error',
      label: 'Error rate',
      value: '3.10%',
      status: 'critical',
      statusLabel: 'High',
      delta: '+1.4%',
      deltaPositive: false,
    },
    {
      key: 'latency',
      label: 'p99 latency',
      value: '274 ms',
      status: 'healthy',
      statusLabel: 'Within target',
      delta: '-30 ms',
      deltaPositive: true,
    },
    {
      key: 'availability',
      label: 'Availability',
      value: '99.20%',
      status: 'warning',
      statusLabel: 'Degraded',
      delta: '-0.6%',
      deltaPositive: false,
    },
  ],
};

// Sparkline shapes keyed by KPI — sliced to the active window length.
const SPARKLINES: Record<string, number[]> = {
  // prettier-ignore
  health: [97, 98, 98, 99, 98, 97, 98, 99, 99, 98, 98, 99, 98, 97, 98, 99, 98, 98, 99, 99, 98, 97, 98, 99, 98, 98, 99, 98, 99, 99, 98, 97, 98, 99, 98, 98, 99, 99, 98, 98, 99, 98],
  // prettier-ignore
  error: [0.6, 0.7, 0.6, 0.8, 0.9, 0.8, 1.0, 1.1, 1.0, 1.2, 1.3, 1.2, 1.4, 1.5, 1.4, 1.3, 1.5, 1.6, 1.7, 1.6, 1.8, 1.9, 1.8, 1.7, 1.9, 2.0, 1.9, 1.8, 1.9, 2.0, 1.9, 1.8, 1.9, 1.8, 1.7, 1.8, 1.9, 1.8, 1.9, 1.84, 1.8, 1.9],
  // prettier-ignore
  latency: [300, 310, 305, 320, 340, 360, 400, 460, 520, 540, 500, 470, 440, 460, 500, 540, 560, 520, 500, 480, 500, 520, 540, 512, 500, 520, 540, 520, 500, 512, 520, 540, 520, 500, 512, 520, 500, 512, 520, 512, 500, 512],
  // prettier-ignore
  availability: [99.99, 99.98, 99.99, 99.98, 99.97, 99.98, 99.99, 99.98, 99.99, 99.98, 99.98, 99.99, 99.98, 99.97, 99.98, 99.99, 99.98, 99.98, 99.99, 99.99, 99.98, 99.97, 99.98, 99.99, 99.98, 99.98, 99.99, 99.98, 99.99, 99.98, 99.98, 99.99, 99.98, 99.97, 99.98, 99.99, 99.98, 99.98, 99.99, 99.98, 99.98, 99.99],
};

// ============= DRILL-DOWN ROWS =============

interface HostRow extends Record<string, unknown> {
  id: string;
  service: string;
  environment: Environment;
  region: string;
  instances: number;
  rpm: number;
  errorRate: number;
  p99: number;
  status: HealthStatus;
}

const HOST_ROWS: HostRow[] = [
  {
    id: '1',
    service: 'checkout-api',
    environment: 'production',
    region: 'us-east-1',
    instances: 24,
    rpm: 9240,
    errorRate: 2.1,
    p99: 512,
    status: 'warning',
  },
  {
    id: '2',
    service: 'checkout-api',
    environment: 'production',
    region: 'us-west-2',
    instances: 18,
    rpm: 6110,
    errorRate: 0.3,
    p99: 214,
    status: 'healthy',
  },
  {
    id: '3',
    service: 'checkout-api',
    environment: 'production',
    region: 'eu-west-1',
    instances: 12,
    rpm: 3980,
    errorRate: 0.4,
    p99: 236,
    status: 'healthy',
  },
  {
    id: '4',
    service: 'search-indexer',
    environment: 'production',
    region: 'us-east-1',
    instances: 16,
    rpm: 4120,
    errorRate: 5.8,
    p99: 1180,
    status: 'critical',
  },
  {
    id: '5',
    service: 'search-indexer',
    environment: 'production',
    region: 'ap-southeast-1',
    instances: 8,
    rpm: 2040,
    errorRate: 0.9,
    p99: 342,
    status: 'healthy',
  },
  {
    id: '6',
    service: 'payments',
    environment: 'production',
    region: 'us-east-1',
    instances: 20,
    rpm: 5310,
    errorRate: 0.2,
    p99: 188,
    status: 'healthy',
  },
  {
    id: '7',
    service: 'payments',
    environment: 'production',
    region: 'eu-west-1',
    instances: 10,
    rpm: 2760,
    errorRate: 0.2,
    p99: 205,
    status: 'healthy',
  },
  {
    id: '8',
    service: 'edge-cdn',
    environment: 'production',
    region: 'eu-west-1',
    instances: 30,
    rpm: 14820,
    errorRate: 1.6,
    p99: 402,
    status: 'warning',
  },
  {
    id: '9',
    service: 'auth',
    environment: 'production',
    region: 'us-west-2',
    instances: 14,
    rpm: 4530,
    errorRate: 0.1,
    p99: 96,
    status: 'healthy',
  },
  {
    id: '10',
    service: 'notifications',
    environment: 'production',
    region: 'ap-southeast-1',
    instances: 6,
    rpm: 1210,
    errorRate: 0.5,
    p99: 268,
    status: 'healthy',
  },
  {
    id: '11',
    service: 'checkout-api',
    environment: 'staging',
    region: 'us-east-1',
    instances: 3,
    rpm: 420,
    errorRate: 0.4,
    p99: 198,
    status: 'healthy',
  },
  {
    id: '12',
    service: 'search-indexer',
    environment: 'staging',
    region: 'us-east-1',
    instances: 2,
    rpm: 180,
    errorRate: 1.1,
    p99: 356,
    status: 'warning',
  },
  {
    id: '13',
    service: 'checkout-api',
    environment: 'development',
    region: 'us-west-2',
    instances: 1,
    rpm: 44,
    errorRate: 3.2,
    p99: 274,
    status: 'warning',
  },
  {
    id: '14',
    service: 'auth',
    environment: 'development',
    region: 'us-west-2',
    instances: 1,
    rpm: 38,
    errorRate: 6.4,
    p99: 512,
    status: 'critical',
  },
];

const STATUS_BADGE: Record<
  HealthStatus,
  {label: string; variant: 'success' | 'warning' | 'error'}
> = {
  healthy: {label: 'Healthy', variant: 'success'},
  warning: {label: 'Degraded', variant: 'warning'},
  critical: {label: 'Down', variant: 'error'},
};

// ============= ALERTS =============

type AlertState = 'firing' | 'acknowledged' | 'resolved';

interface Alert {
  id: string;
  severity: HealthStatus;
  title: string;
  service: string;
  at: string;
  state: AlertState;
}

const ALERT_STATE_TOKEN: Record<
  AlertState,
  {label: string; color: 'red' | 'yellow' | 'green'}
> = {
  firing: {label: 'Firing', color: 'red'},
  acknowledged: {label: 'Ack', color: 'yellow'},
  resolved: {label: 'Resolved', color: 'green'},
};

const ALERTS: Alert[] = [
  {
    id: 'AL-8842',
    severity: 'critical',
    title: 'search-indexer 5xx rate above 5%',
    service: 'search-indexer · us-east-1',
    at: '2026-06-30T21:14:00Z',
    state: 'firing',
  },
  {
    id: 'AL-8841',
    severity: 'warning',
    title: 'checkout-api p99 latency above 500ms',
    service: 'checkout-api · us-east-1',
    at: '2026-06-30T21:02:00Z',
    state: 'firing',
  },
  {
    id: 'AL-8840',
    severity: 'warning',
    title: 'edge-cdn cache hit ratio degraded',
    service: 'edge-cdn · eu-west-1',
    at: '2026-06-30T20:41:00Z',
    state: 'acknowledged',
  },
  {
    id: 'AL-8839',
    severity: 'critical',
    title: 'auth error rate spike in dev cluster',
    service: 'auth · us-west-2',
    at: '2026-06-30T20:18:00Z',
    state: 'acknowledged',
  },
  {
    id: 'AL-8838',
    severity: 'warning',
    title: 'notifications queue depth climbing',
    service: 'notifications · ap-southeast-1',
    at: '2026-06-30T19:55:00Z',
    state: 'firing',
  },
  {
    id: 'AL-8837',
    severity: 'warning',
    title: 'payments settlement job heartbeat missed',
    service: 'payments · us-east-1',
    at: '2026-06-30T18:30:00Z',
    state: 'resolved',
  },
];

const ALERT_ORDER: AlertState[] = ['firing', 'acknowledged', 'resolved'];

// ============= SHARED CHART PIECES =============

// Single colored marker, reused by legends and tooltips. Icon's `color` prop
// only takes semantic names, so an inline color is required to mirror the exact
// data-categorical stroke of each chart line.
function LegendDot({color, label}: {color: string; label: string}) {
  const dotStyle: CSSProperties = {color};
  return (
    <HStack gap={2} vAlign="center">
      <Icon icon={StopIcon} size="xsm" style={dotStyle} />
      <Text type="supporting" color="secondary">
        {label}
      </Text>
    </HStack>
  );
}

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

// Recharts passes the x-axis value (the point index `t`) as `label`; map it back
// to the human-readable time via the active series so the tooltip shows a real
// timestamp rather than a bare index.
function ChartTooltip({
  active,
  payload,
  label,
  series,
  unit,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
  series: WindowSeries;
  unit: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const timeLabel =
    typeof label === 'number' ? (series.points[label]?.label ?? '') : '';
  return (
    <Card padding={3}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {timeLabel}
        </Text>
        {payload.map(entry => (
          <LegendDot
            key={entry.name}
            color={entry.color}
            label={`${entry.name}: ${entry.value.toLocaleString()}${unit}`}
          />
        ))}
      </VStack>
    </Card>
  );
}

const AXIS_TICK = {
  fontSize: 'var(--font-size-sm, 12px)',
  fill: 'var(--color-text-secondary, #4E606F)',
};
const GRID_STROKE = 'var(--color-border, rgba(5, 54, 89, 0.1))';

function TimeAxis({series}: {series: WindowSeries}) {
  return (
    <XAxis
      dataKey="t"
      type="number"
      domain={[0, series.points.length - 1]}
      ticks={series.ticks}
      tickFormatter={(v: number) => series.tickLabels[v] ?? ''}
      tick={AXIS_TICK}
      axisLine={false}
      tickLine={false}
    />
  );
}

// ============= CHART CARDS =============

function LatencyChart({
  series,
  latencyFactor,
}: {
  series: WindowSeries;
  latencyFactor: number;
}) {
  const data = useMemo(
    () =>
      series.points.map(p => ({
        t: p.t,
        p50: Math.round(p.p50 * latencyFactor),
        p95: Math.round(p.p95 * latencyFactor),
        p99: Math.round(p.p99 * latencyFactor),
      })),
    [series, latencyFactor],
  );
  return (
    <Card>
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={4}>Response latency</Heading>
          <Text type="supporting" color="secondary">
            Percentile latency across all services (ms)
          </Text>
        </VStack>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{top: 5, right: 12, left: 0, bottom: 5}}>
            <CartesianGrid horizontal vertical={false} stroke={GRID_STROKE} />
            <TimeAxis series={series} />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={40}
              unit=" ms"
            />
            <Tooltip
              content={<ChartTooltip series={series} unit=" ms" />}
              cursor={{stroke: GRID_STROKE}}
            />
            <Line
              type="monotone"
              dataKey="p50"
              name="p50"
              stroke={CHART_COLORS.p50}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p95"
              name="p95"
              stroke={CHART_COLORS.p95}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p99"
              name="p99"
              stroke={CHART_COLORS.p99}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <HStack gap={6} vAlign="center" wrap="wrap">
          <LegendDot color={CHART_COLORS.p50} label="p50" />
          <LegendDot color={CHART_COLORS.p95} label="p95" />
          <LegendDot color={CHART_COLORS.p99} label="p99" />
        </HStack>
      </VStack>
    </Card>
  );
}

function TrafficChart({
  series,
  factor,
}: {
  series: WindowSeries;
  factor: number;
}) {
  const data = useMemo(
    () =>
      series.points.map(p => ({
        t: p.t,
        useast: Math.round(p.useast * factor),
        uswest: Math.round(p.uswest * factor),
        euwest: Math.round(p.euwest * factor),
      })),
    [series, factor],
  );
  return (
    <Card>
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={4}>Request volume by region</Heading>
          <Text type="supporting" color="secondary">
            Requests per minute (rpm)
          </Text>
        </VStack>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={data}
            margin={{top: 5, right: 12, left: 0, bottom: 5}}>
            <CartesianGrid horizontal vertical={false} stroke={GRID_STROKE} />
            <TimeAxis series={series} />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={<ChartTooltip series={series} unit=" rpm" />}
              cursor={{stroke: GRID_STROKE}}
            />
            <Line
              type="monotone"
              dataKey="useast"
              name="us-east-1"
              stroke={CHART_COLORS.useast}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="uswest"
              name="us-west-2"
              stroke={CHART_COLORS.uswest}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="euwest"
              name="eu-west-1"
              stroke={CHART_COLORS.euwest}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <HStack gap={6} vAlign="center" wrap="wrap">
          <LegendDot color={CHART_COLORS.useast} label="us-east-1" />
          <LegendDot color={CHART_COLORS.uswest} label="us-west-2" />
          <LegendDot color={CHART_COLORS.euwest} label="eu-west-1" />
        </HStack>
      </VStack>
    </Card>
  );
}

// ============= KPI TILE =============

function Sparkline({data, color}: {data: number[]; color: string}) {
  const chartData = data.map((v, i) => ({i, v}));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart
        data={chartData}
        margin={{top: 4, right: 0, left: 0, bottom: 0}}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function KpiTile({kpi, spark}: {kpi: Kpi; spark: number[]}) {
  return (
    <Card>
      <VStack gap={3}>
        <HStack hAlign="between" vAlign="center">
          <Text type="label" color="secondary">
            {kpi.label}
          </Text>
          <StatusDot
            variant={STATUS_DOT[kpi.status]}
            label={kpi.statusLabel}
            tooltip={kpi.statusLabel}
            isPulsing={kpi.status === 'critical'}
          />
        </HStack>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>{kpi.value}</Heading>
          <HStack gap={1} vAlign="center">
            <Icon
              icon={kpi.deltaPositive ? ArrowUpIcon : ArrowDownIcon}
              size="xsm"
              color={kpi.deltaPositive ? 'success' : 'error'}
            />
            <Text type="supporting" color="secondary">
              {kpi.delta}
            </Text>
          </HStack>
        </HStack>
        <Sparkline data={spark} color={STATUS_STROKE[kpi.status]} />
      </VStack>
    </Card>
  );
}

// ============= DRILL-DOWN TABLE =============

const columns: TableColumn<HostRow>[] = [
  {
    key: 'service',
    header: 'Service',
    width: proportional(2),
    renderCell: (item: HostRow) => (
      <HStack gap={2} vAlign="center">
        <StatusDot
          variant={STATUS_DOT[item.status]}
          label={STATUS_BADGE[item.status].label}
        />
        <Text type="body" weight="semibold">
          {item.service}
        </Text>
      </HStack>
    ),
  },
  {
    key: 'region',
    header: 'Region',
    width: pixel(140),
    renderCell: (item: HostRow) => (
      <Text type="body" color="secondary">
        {item.region}
      </Text>
    ),
  },
  {
    key: 'instances',
    header: 'Hosts',
    width: pixel(80),
    renderCell: (item: HostRow) => <Text type="body">{item.instances}</Text>,
  },
  {
    key: 'rpm',
    header: 'Req/min',
    width: pixel(110),
    renderCell: (item: HostRow) => (
      <Text type="body">{item.rpm.toLocaleString()}</Text>
    ),
  },
  {
    key: 'errorRate',
    header: 'Error rate',
    width: pixel(120),
    renderCell: (item: HostRow) => {
      const status: HealthStatus =
        item.errorRate >= 5
          ? 'critical'
          : item.errorRate >= 1.5
            ? 'warning'
            : 'healthy';
      return (
        <Token
          size="sm"
          color={
            status === 'critical'
              ? 'red'
              : status === 'warning'
                ? 'yellow'
                : 'green'
          }
          label={`${item.errorRate.toFixed(1)}%`}
        />
      );
    },
  },
  {
    key: 'p99',
    header: 'p99',
    width: pixel(100),
    renderCell: (item: HostRow) => <Text type="body">{item.p99} ms</Text>,
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(120),
    renderCell: (item: HostRow) => (
      <Badge
        label={STATUS_BADGE[item.status].label}
        variant={STATUS_BADGE[item.status].variant}
      />
    ),
  },
];

// ============= ALERTS FEED =============

function AlertsFeed() {
  const groups = ALERT_ORDER.map(state => ({
    state,
    items: ALERTS.filter(a => a.state === state),
  })).filter(g => g.items.length > 0);

  const firing = ALERTS.filter(a => a.state === 'firing').length;

  return (
    <VStack gap={0}>
      <HStack gap={2} vAlign="center" padding={4}>
        <Icon
          icon={BellAlertIcon}
          size="sm"
          color={firing > 0 ? 'error' : 'secondary'}
        />
        <StackItem size="fill">
          <Heading level={3}>Active alerts</Heading>
        </StackItem>
        <Badge
          label={`${firing} firing`}
          variant={firing > 0 ? 'error' : 'neutral'}
        />
      </HStack>
      <Divider />
      {groups.length === 0 ? (
        <EmptyState
          title="All clear"
          description="No active alerts across the selected environment."
          icon={<Icon icon={CheckCircleIcon} size="lg" color="success" />}
          isCompact
        />
      ) : (
        groups.map(group => (
          <List key={group.state} density="compact" hasDividers>
            {group.items.map(alert => (
              <ListItem
                key={alert.id}
                label={alert.title}
                description={alert.service}
                startContent={
                  <StatusDot
                    variant={STATUS_DOT[alert.severity]}
                    label={alert.severity}
                    isPulsing={
                      alert.state === 'firing' && alert.severity === 'critical'
                    }
                  />
                }
                endContent={
                  <VStack gap={1} hAlign="end">
                    <Token
                      size="sm"
                      color={ALERT_STATE_TOKEN[alert.state].color}
                      label={ALERT_STATE_TOKEN[alert.state].label}
                    />
                    <Timestamp
                      value={alert.at}
                      format="relative"
                      color="secondary"
                    />
                  </VStack>
                }
              />
            ))}
          </List>
        ))
      )}
    </VStack>
  );
}

// ============= CONTROL OPTIONS =============

const ENV_OPTIONS = [
  {value: 'production', label: 'Production'},
  {value: 'staging', label: 'Staging'},
  {value: 'development', label: 'Development'},
];

const REGION_OPTIONS = [
  {value: 'all', label: 'All regions'},
  {value: 'us-east-1', label: 'us-east-1'},
  {value: 'us-west-2', label: 'us-west-2'},
  {value: 'eu-west-1', label: 'eu-west-1'},
  {value: 'ap-southeast-1', label: 'ap-southeast-1'},
];

// A vertical Divider is `height: 100%`, so in a center-aligned row it collapses
// to zero. Give it an explicit height to read as a toolbar separator rather than
// stretching it to the tallest item in the header.
const controlDividerStyle: CSSProperties = {height: '24px'};

// ============= MAIN =============

export default function ServiceHealthMonitorPage() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('1d');
  const [environment, setEnvironment] = useState<Environment>('production');
  const [region, setRegion] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const isNarrow = useMediaQuery('(max-width: 1024px)');

  const series = SERIES[timeWindow];
  const factor = ENV_FACTOR[environment];
  const latencyFactor = ENV_LATENCY_FACTOR[environment];
  const kpis = KPI_BY_ENV[environment];

  const sparkLen =
    timeWindow === '1h'
      ? 12
      : timeWindow === '1d'
        ? 24
        : SPARKLINES.health.length;

  const rows = useMemo(
    () =>
      HOST_ROWS.filter(
        r =>
          r.environment === environment &&
          (region === 'all' || r.region === region),
      ),
    [environment, region],
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader padding={6} hasDivider>
          <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
            <VStack gap={1} vAlign="center">
              <Heading level={1}>Service Health Monitor</Heading>
              <HStack gap={2} vAlign="center">
                <StatusDot
                  variant={autoRefresh ? 'success' : 'neutral'}
                  label={autoRefresh ? 'Live' : 'Paused'}
                  isPulsing={autoRefresh}
                  tooltip={
                    autoRefresh
                      ? 'Auto-refreshing every 30s'
                      : 'Auto-refresh paused'
                  }
                />
                <Text type="supporting" color="secondary">
                  Updated{' '}
                  <Timestamp
                    value="2026-06-30T21:15:00Z"
                    format="relative"
                    type="inherit"
                    color="inherit"
                  />
                </Text>
              </HStack>
            </VStack>
            <HStack gap={3} vAlign="center">
              <SegmentedControl
                label="Time window"
                value={timeWindow}
                onChange={value => setTimeWindow(value as TimeWindow)}
                size="lg">
                <SegmentedControlItem label="1h" value="1h" />
                <SegmentedControlItem label="1d" value="1d" />
                <SegmentedControlItem label="7d" value="7d" />
              </SegmentedControl>
              <Selector
                label="Environment"
                isLabelHidden
                size="lg"
                options={ENV_OPTIONS}
                value={environment}
                onChange={value => setEnvironment(value as Environment)}
              />
              <Selector
                label="Region"
                isLabelHidden
                size="lg"
                options={REGION_OPTIONS}
                value={region}
                onChange={setRegion}
              />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <VStack gap={10}>
            {/* Traffic-light KPI tiles */}
            <Grid columns={{minWidth: 240, repeat: 'fit'}} gap={4}>
              {kpis.map(kpi => (
                <KpiTile
                  key={kpi.key}
                  kpi={kpi}
                  spark={SPARKLINES[kpi.key].slice(0, sparkLen)}
                />
              ))}
            </Grid>

            {/* Time-series charts */}
            <Grid columns={{minWidth: 320, repeat: 'fit'}} gap={4}>
              <LatencyChart series={series} latencyFactor={latencyFactor} />
              <TrafficChart series={series} factor={factor} />
            </Grid>

            {/* On narrow screens the rail collapses in here. */}
            {isNarrow && (
              <Card padding={0}>
                <AlertsFeed />
              </Card>
            )}

            {/* Drill-down table with inline status coloring */}
            <VStack gap={6}>
              <HStack hAlign="between" vAlign="center" wrap="wrap">
                <Heading level={2}>Service breakdown</Heading>
                <Text type="supporting" color="secondary">
                  {rows.length} {rows.length === 1 ? 'service' : 'services'} ·{' '}
                  {ENV_OPTIONS.find(e => e.value === environment)?.label} ·{' '}
                  {REGION_OPTIONS.find(r => r.value === region)?.label}
                </Text>
              </HStack>
              {rows.length === 0 ? (
                <EmptyState
                  title="No services in this view"
                  description="No services report in the selected environment and region. Try widening the region filter."
                  icon={<Icon icon={BellAlertIcon} size="lg" />}
                />
              ) : (
                <Card>
                  <Table<HostRow>
                    data={rows}
                    columns={columns}
                    idKey="id"
                    density="balanced"
                    dividers="rows"
                    hasHover
                  />
                </Card>
              )}
            </VStack>
          </VStack>
        </LayoutContent>
      }
      end={
        isNarrow ? undefined : (
          <LayoutPanel width={360} padding={0} hasDivider label="Active alerts">
            <AlertsFeed />
          </LayoutPanel>
        )
      }
    />
  );
}
