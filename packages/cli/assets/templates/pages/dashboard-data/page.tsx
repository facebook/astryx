// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Data Dashboard — a generic user-analytics dashboard.
 *
 * Content-only (root `Layout`); the host supplies the app shell. Modeled after
 * dense metric-monitoring dashboards: a filter bar, tabbed sections, and grids
 * of small metric cards — each with a sparkline and multi-period deltas
 * (d/d, w/w, m/m, y/y) with red/green direction coloring.
 *
 *   filter bar | tabs: Overview | Demographics | Engagement | Geography
 *
 * Every metric is generic and self-contained (no real users, no proprietary
 * data). All figures are deterministic (fixed fixtures, no clocks/random) so
 * previews stay stable.
 */

import {useMemo, useState, type CSSProperties} from 'react';
import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Divider} from '@astryxdesign/core/Divider';
import {Badge} from '@astryxdesign/core/Badge';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  CursorArrowRaysIcon,
  ClockIcon,
  ArrowPathRoundedSquareIcon,
} from '@heroicons/react/24/outline';
import {StopIcon} from '@heroicons/react/24/solid';

// ============= TYPES =============

type Segment = 'all' | 'new' | 'returning';
type DateRange = '7d' | '30d' | '90d';

interface Deltas {
  dd: number;
  ww: number;
  mm: number;
  yy: number;
}

interface Metric {
  key: string;
  label: string;
  value: string;
  // Whether a rising value is good (engagement) or bad (bounce rate).
  higherIsBetter: boolean;
  deltas: Deltas;
  spark: number[];
}

// ============= COLORS (design tokens w/ hex fallbacks) =============

const COLORS = {
  blue: 'var(--color-data-categorical-blue, #0171E3)',
  green: 'var(--color-data-categorical-green, #0B991F)',
  orange: 'var(--color-data-categorical-orange, #EB6E00)',
  purple: 'var(--color-data-categorical-purple, #6B1EFD)',
  teal: 'var(--color-data-categorical-teal, #008E80)',
  pink: 'var(--color-data-categorical-pink, #C7268B)',
  neutral: 'var(--color-data-neutral, #8494A3)',
};
const GRID_STROKE = 'var(--color-border, rgba(5, 54, 89, 0.1))';
const AXIS_TICK = {
  fontSize: 'var(--font-size-sm, 12px)',
  fill: 'var(--color-text-secondary, #4E606F)',
};

// ============= DETERMINISTIC SPARKLINES =============

// Build a smooth, stable sparkline series from a seed so previews never shift.
function spark(seed: number, trend: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 24; i++) {
    const base = 50 + trend * i;
    const wobble = Math.sin(i * 0.9 + seed) * 8 + Math.sin(i * 0.37 + seed) * 4;
    out.push(Math.round(base + wobble));
  }
  return out;
}

// ============= OVERVIEW METRICS =============

const OVERVIEW_METRICS: Metric[] = [
  {
    key: 'active-users',
    label: 'Active users',
    value: '1.28M',
    higherIsBetter: true,
    deltas: {dd: 0.4, ww: 2.1, mm: 6.4, yy: 18.2},
    spark: spark(1, 1.1),
  },
  {
    key: 'new-users',
    label: 'New users',
    value: '184.2K',
    higherIsBetter: true,
    deltas: {dd: 1.2, ww: 3.8, mm: 9.1, yy: 24.6},
    spark: spark(2, 1.4),
  },
  {
    key: 'sessions',
    label: 'Sessions',
    value: '4.62M',
    higherIsBetter: true,
    deltas: {dd: 0.2, ww: 1.4, mm: 5.2, yy: 15.9},
    spark: spark(3, 0.9),
  },
  {
    key: 'avg-session',
    label: 'Avg. session',
    value: '6m 42s',
    higherIsBetter: true,
    deltas: {dd: -0.3, ww: 0.8, mm: 2.1, yy: -4.3},
    spark: spark(4, 0.3),
  },
  {
    key: 'pages-session',
    label: 'Pages / session',
    value: '5.3',
    higherIsBetter: true,
    deltas: {dd: 0.1, ww: -0.6, mm: 1.2, yy: 3.7},
    spark: spark(5, 0.4),
  },
  {
    key: 'bounce',
    label: 'Bounce rate',
    value: '38.6%',
    higherIsBetter: false,
    deltas: {dd: -0.2, ww: -1.1, mm: -2.4, yy: -6.8},
    spark: spark(6, -0.5),
  },
  {
    key: 'dau-mau',
    label: 'DAU / MAU',
    value: '52.1%',
    higherIsBetter: true,
    deltas: {dd: 0.3, ww: 1.0, mm: 3.2, yy: 8.4},
    spark: spark(7, 0.7),
  },
  {
    key: 'conversion',
    label: 'Conversion rate',
    value: '3.84%',
    higherIsBetter: true,
    deltas: {dd: -0.1, ww: 0.9, mm: 2.6, yy: 11.2},
    spark: spark(8, 0.6),
  },
];

// Active-users trend: 30 days of desktop/mobile/tablet split.
const ACTIVE_TREND = (() => {
  const out: {
    t: number;
    label: string;
    desktop: number;
    mobile: number;
    tablet: number;
  }[] = [];
  for (let i = 0; i < 30; i++) {
    const phase = (i / 30) * Math.PI * 2;
    out.push({
      t: i,
      label: `Day ${i + 1}`,
      desktop: Math.round(520 + 90 * Math.sin(phase) + i * 3),
      mobile: Math.round(680 + 120 * Math.sin(phase + 1.4) + i * 5),
      tablet: Math.round(140 + 30 * Math.sin(phase + 2.6)),
    });
  }
  return out;
})();

const ACTIVE_TICKS = [0, 9, 19, 29];

// ============= DEMOGRAPHICS =============

interface Segment2 {
  label: string;
  value: number;
  color: string;
}

const AGE_DATA: Segment2[] = [
  {label: '18–24', value: 26, color: COLORS.blue},
  {label: '25–34', value: 34, color: COLORS.teal},
  {label: '35–44', value: 21, color: COLORS.green},
  {label: '45–54', value: 12, color: COLORS.orange},
  {label: '55+', value: 7, color: COLORS.neutral},
];

const GENDER_DATA: Segment2[] = [
  {label: 'Female', value: 48, color: COLORS.purple},
  {label: 'Male', value: 46, color: COLORS.blue},
  {label: 'Other / undisclosed', value: 6, color: COLORS.neutral},
];

const DEVICE_DATA: Segment2[] = [
  {label: 'Mobile', value: 58, color: COLORS.blue},
  {label: 'Desktop', value: 34, color: COLORS.teal},
  {label: 'Tablet', value: 8, color: COLORS.orange},
];

interface AcqRow extends Record<string, unknown> {
  id: string;
  channel: string;
  users: number;
  share: number;
  delta: number;
}

const ACQUISITION: AcqRow[] = [
  {id: 'a1', channel: 'Organic search', users: 486200, share: 38, delta: 4.2},
  {id: 'a2', channel: 'Direct', users: 295400, share: 23, delta: 1.1},
  {id: 'a3', channel: 'Social', users: 217800, share: 17, delta: 8.6},
  {id: 'a4', channel: 'Referral', users: 141900, share: 11, delta: -2.3},
  {id: 'a5', channel: 'Email', users: 89200, share: 7, delta: 3.4},
  {id: 'a6', channel: 'Paid ads', users: 51300, share: 4, delta: -1.8},
];

const ACQ_MAX = Math.max(...ACQUISITION.map(a => a.users));

// ============= ENGAGEMENT =============

interface FeatureRow extends Record<string, unknown> {
  id: string;
  feature: string;
  adoption: number;
  users: number;
  delta: number;
}

const FEATURES: FeatureRow[] = [
  {id: 'f1', feature: 'Search', adoption: 82, users: 1049600, delta: 2.1},
  {id: 'f2', feature: 'Notifications', adoption: 74, users: 947200, delta: 1.4},
  {id: 'f3', feature: 'Saved items', adoption: 61, users: 780800, delta: 5.6},
  {id: 'f4', feature: 'Sharing', adoption: 48, users: 614400, delta: 3.2},
  {id: 'f5', feature: 'Comments', adoption: 39, users: 499200, delta: -1.1},
  {id: 'f6', feature: 'Dark mode', adoption: 57, users: 729600, delta: 7.8},
  {id: 'f7', feature: 'Collaboration', adoption: 24, users: 307200, delta: 9.3},
  {id: 'f8', feature: 'Integrations', adoption: 18, users: 230400, delta: 4.5},
];

// Retention curve: % of a cohort still active by day since signup.
const RETENTION_CURVE = [
  {t: 0, label: 'Day 0', pct: 100},
  {t: 1, label: 'Day 1', pct: 64},
  {t: 2, label: 'Day 3', pct: 48},
  {t: 3, label: 'Day 7', pct: 39},
  {t: 4, label: 'Day 14', pct: 32},
  {t: 5, label: 'Day 30', pct: 27},
  {t: 6, label: 'Day 60', pct: 23},
  {t: 7, label: 'Day 90', pct: 21},
];

interface PageRow extends Record<string, unknown> {
  id: string;
  page: string;
  views: number;
  avgTime: string;
  exitRate: number;
}

const TOP_PAGES: PageRow[] = [
  {id: 'p1', page: '/home', views: 842000, avgTime: '2m 14s', exitRate: 22},
  {id: 'p2', page: '/explore', views: 615000, avgTime: '3m 48s', exitRate: 18},
  {id: 'p3', page: '/library', views: 483000, avgTime: '4m 12s', exitRate: 27},
  {id: 'p4', page: '/settings', views: 312000, avgTime: '1m 36s', exitRate: 41},
  {id: 'p5', page: '/profile', views: 287000, avgTime: '2m 02s', exitRate: 33},
  {id: 'p6', page: '/pricing', views: 194000, avgTime: '1m 58s', exitRate: 38},
];

const PAGE_MAX = Math.max(...TOP_PAGES.map(p => p.views));

// ============= GEOGRAPHY =============

interface GeoRow extends Record<string, unknown> {
  id: string;
  country: string;
  users: number;
  share: number;
  delta: number;
}

const GEO: GeoRow[] = [
  {id: 'g1', country: 'United States', users: 384000, share: 30, delta: 3.1},
  {id: 'g2', country: 'India', users: 218000, share: 17, delta: 12.4},
  {id: 'g3', country: 'Brazil', users: 141000, share: 11, delta: 6.8},
  {id: 'g4', country: 'United Kingdom', users: 102000, share: 8, delta: 1.2},
  {id: 'g5', country: 'Germany', users: 89000, share: 7, delta: -0.6},
  {id: 'g6', country: 'Indonesia', users: 76000, share: 6, delta: 9.1},
  {id: 'g7', country: 'Canada', users: 64000, share: 5, delta: 2.3},
  {id: 'g8', country: 'France', users: 58000, share: 4, delta: -1.4},
];

const GEO_MAX = Math.max(...GEO.map(g => g.users));

// ============= FILTER OPTIONS =============

const RANGE_OPTIONS = [
  {value: '7d', label: 'Last 7 days'},
  {value: '30d', label: 'Last 30 days'},
  {value: '90d', label: 'Last 90 days'},
];
const SEGMENT_OPTIONS = [
  {value: 'all', label: 'All users'},
  {value: 'new', label: 'New users'},
  {value: 'returning', label: 'Returning users'},
];
const DEVICE_OPTIONS = [
  {value: 'all', label: 'All devices'},
  {value: 'mobile', label: 'Mobile'},
  {value: 'desktop', label: 'Desktop'},
  {value: 'tablet', label: 'Tablet'},
];

const TABS = ['Overview', 'Demographics', 'Engagement', 'Geography'];

// ============= SHARED PIECES =============

// Icon's `color` prop only takes semantic names, but the legend swatch must
// match the exact chart series color — inline color required (same pattern as
// the shipped dashboard templates).
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

function nf(n: number): string {
  return n.toLocaleString();
}

// ============= METRIC MINI-CARD (with sparkline + 4 deltas) =============

function DeltaValue({
  label,
  value,
  higherIsBetter,
}: {
  label: string;
  value: number;
  higherIsBetter: boolean;
}) {
  const flat = value === 0;
  const favorable = higherIsBetter ? value >= 0 : value <= 0;
  const variant = flat ? 'neutral' : favorable ? 'green' : 'red';
  const sign = value > 0 ? '+' : '';
  return (
    <VStack gap={1} hAlign="center">
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <Badge
        variant={variant}
        label={flat ? '—' : `${sign}${value.toFixed(1)}%`}
      />
    </VStack>
  );
}

function MiniSparkline({data, color}: {data: number[]; color: string}) {
  const chartData = data.map((v, i) => ({i, v}));
  return (
    <ResponsiveContainer width="100%" height={48}>
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

function MetricCard({metric}: {metric: Metric}) {
  const trendUp = metric.deltas.ww >= 0;
  const favorable = metric.higherIsBetter ? trendUp : !trendUp;
  const sparkColor = favorable ? COLORS.green : COLORS.orange;
  return (
    <Card>
      <VStack gap={2}>
        <HStack hAlign="between" vAlign="center">
          <Text type="label" color="secondary">
            {metric.label}
          </Text>
          <Icon
            icon={trendUp ? ArrowUpIcon : ArrowDownIcon}
            size="xsm"
            color={favorable ? 'success' : 'error'}
          />
        </HStack>
        <Heading level={3}>{metric.value}</Heading>
        <MiniSparkline data={metric.spark} color={sparkColor} />
        <Divider />
        <HStack hAlign="between">
          <DeltaValue
            label="d/d"
            value={metric.deltas.dd}
            higherIsBetter={metric.higherIsBetter}
          />
          <DeltaValue
            label="w/w"
            value={metric.deltas.ww}
            higherIsBetter={metric.higherIsBetter}
          />
          <DeltaValue
            label="m/m"
            value={metric.deltas.mm}
            higherIsBetter={metric.higherIsBetter}
          />
          <DeltaValue
            label="y/y"
            value={metric.deltas.yy}
            higherIsBetter={metric.higherIsBetter}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

// ============= ACTIVE USERS TREND =============

interface TrendTooltipEntry {
  name: string;
  value: number;
  color: string;
}

function ActiveTrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TrendTooltipEntry[];
  label?: number;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const day =
    typeof label === 'number' ? (ACTIVE_TREND[label]?.label ?? '') : '';
  return (
    <Card padding={3}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {day}
        </Text>
        {payload.map(entry => (
          <LegendDot
            key={entry.name}
            color={entry.color}
            label={`${entry.name}: ${nf(entry.value)}K`}
          />
        ))}
      </VStack>
    </Card>
  );
}

function ActiveUsersTrend() {
  return (
    <VStack gap={3}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={ACTIVE_TREND}
          margin={{top: 5, right: 12, left: 0, bottom: 5}}>
          <defs>
            <linearGradient id="au-mobile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="au-desktop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal vertical={false} stroke={GRID_STROKE} />
          <XAxis
            dataKey="t"
            type="number"
            domain={[0, 29]}
            ticks={ACTIVE_TICKS}
            tickFormatter={(v: number) => ACTIVE_TREND[v]?.label ?? ''}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={40}
            unit="K"
          />
          <Tooltip
            content={<ActiveTrendTooltip />}
            cursor={{stroke: GRID_STROKE}}
          />
          <Area
            type="monotone"
            dataKey="mobile"
            name="Mobile"
            stroke={COLORS.blue}
            strokeWidth={2}
            fill="url(#au-mobile)"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="desktop"
            name="Desktop"
            stroke={COLORS.teal}
            strokeWidth={2}
            fill="url(#au-desktop)"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="tablet"
            name="Tablet"
            stroke={COLORS.orange}
            strokeWidth={2}
            fill="none"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <HStack gap={5} vAlign="center" wrap="wrap">
        <LegendDot color={COLORS.blue} label="Mobile" />
        <LegendDot color={COLORS.teal} label="Desktop" />
        <LegendDot color={COLORS.orange} label="Tablet" />
      </HStack>
    </VStack>
  );
}

// ============= BREAKDOWN (horizontal stacked bar) =============

function BreakdownCard({title, data}: {title: string; data: Segment2[]}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const chartData = [Object.fromEntries(data.map(d => [d.label, d.value]))];
  return (
    <Card>
      <VStack gap={4}>
        <Heading level={4}>{title}</Heading>
        <ResponsiveContainer width="100%" height={24}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{top: 0, right: 0, bottom: 0, left: 0}}
            barCategoryGap={0}>
            <XAxis type="number" hide domain={[0, total]} />
            <YAxis type="category" hide />
            {data.map((d, i) => (
              <Bar
                key={d.label}
                dataKey={d.label}
                stackId="s"
                fill={d.color}
                isAnimationActive={false}
                radius={
                  i === 0
                    ? [4, 0, 0, 4]
                    : i === data.length - 1
                      ? [0, 4, 4, 0]
                      : [0, 0, 0, 0]
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <VStack gap={2}>
          {data.map(d => (
            <HStack key={d.label} hAlign="between" vAlign="center">
              <LegendDot color={d.color} label={d.label} />
              <Text type="supporting" weight="semibold">
                {d.value}%
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

// ============= TABLES =============

function DeltaBadge({value}: {value: number}) {
  const flat = value === 0;
  return (
    <Badge
      variant={flat ? 'neutral' : value > 0 ? 'green' : 'red'}
      label={`${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
    />
  );
}

const acquisitionColumns: TableColumn<AcqRow>[] = [
  {
    key: 'channel',
    header: 'Channel',
    width: pixel(160),
    renderCell: (item: AcqRow) => (
      <Text type="body" weight="semibold">
        {item.channel}
      </Text>
    ),
  },
  {
    key: 'users',
    header: 'Users',
    width: proportional(1),
    renderCell: (item: AcqRow) => (
      <VStack gap={1}>
        <ProgressBar
          value={item.users}
          max={ACQ_MAX}
          label={`${item.channel} users`}
          isLabelHidden
        />
        <Text type="supporting" color="secondary">
          {nf(item.users)}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'share',
    header: 'Share',
    width: pixel(90),
    renderCell: (item: AcqRow) => <Text type="body">{item.share}%</Text>,
  },
  {
    key: 'delta',
    header: 'w/w',
    width: pixel(100),
    renderCell: (item: AcqRow) => <DeltaBadge value={item.delta} />,
  },
];

const featureColumns: TableColumn<FeatureRow>[] = [
  {
    key: 'feature',
    header: 'Feature',
    width: pixel(160),
    renderCell: (item: FeatureRow) => (
      <Text type="body" weight="semibold">
        {item.feature}
      </Text>
    ),
  },
  {
    key: 'adoption',
    header: 'Adoption',
    width: proportional(1),
    renderCell: (item: FeatureRow) => (
      <VStack gap={1}>
        <ProgressBar
          value={item.adoption}
          max={100}
          variant={
            item.adoption >= 60
              ? 'success'
              : item.adoption >= 35
                ? 'accent'
                : 'warning'
          }
          label={`${item.feature} adoption`}
          isLabelHidden
        />
        <Text type="supporting" color="secondary">
          {item.adoption}% · {nf(item.users)} users
        </Text>
      </VStack>
    ),
  },
  {
    key: 'delta',
    header: 'w/w',
    width: pixel(100),
    renderCell: (item: FeatureRow) => <DeltaBadge value={item.delta} />,
  },
];

const pageColumns: TableColumn<PageRow>[] = [
  {
    key: 'page',
    header: 'Page',
    width: pixel(140),
    renderCell: (item: PageRow) => (
      <Text type="body" weight="semibold">
        {item.page}
      </Text>
    ),
  },
  {
    key: 'views',
    header: 'Views',
    width: proportional(1),
    renderCell: (item: PageRow) => (
      <VStack gap={1}>
        <ProgressBar
          value={item.views}
          max={PAGE_MAX}
          label={`${item.page} views`}
          isLabelHidden
        />
        <Text type="supporting" color="secondary">
          {nf(item.views)}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'avgTime',
    header: 'Avg. time',
    width: pixel(110),
    renderCell: (item: PageRow) => <Text type="body">{item.avgTime}</Text>,
  },
  {
    key: 'exitRate',
    header: 'Exit rate',
    width: pixel(100),
    renderCell: (item: PageRow) => <Text type="body">{item.exitRate}%</Text>,
  },
];

const geoColumns: TableColumn<GeoRow>[] = [
  {
    key: 'country',
    header: 'Country',
    width: pixel(180),
    renderCell: (item: GeoRow) => (
      <Text type="body" weight="semibold">
        {item.country}
      </Text>
    ),
  },
  {
    key: 'users',
    header: 'Users',
    width: proportional(1),
    renderCell: (item: GeoRow) => (
      <VStack gap={1}>
        <ProgressBar
          value={item.users}
          max={GEO_MAX}
          label={`${item.country} users`}
          isLabelHidden
        />
        <Text type="supporting" color="secondary">
          {nf(item.users)}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'share',
    header: 'Share',
    width: pixel(90),
    renderCell: (item: GeoRow) => <Text type="body">{item.share}%</Text>,
  },
  {
    key: 'delta',
    header: 'w/w',
    width: pixel(100),
    renderCell: (item: GeoRow) => <DeltaBadge value={item.delta} />,
  },
];

// ============= RETENTION CURVE =============

interface RetentionTooltipEntry {
  value: number;
  color: string;
}

function RetentionTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: RetentionTooltipEntry[];
  label?: number;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const d =
    typeof label === 'number' ? (RETENTION_CURVE[label]?.label ?? '') : '';
  return (
    <Card padding={3}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {d}
        </Text>
        <LegendDot
          color={payload[0].color}
          label={`Retention: ${payload[0].value}%`}
        />
      </VStack>
    </Card>
  );
}

function RetentionChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={RETENTION_CURVE}
        margin={{top: 5, right: 12, left: 0, bottom: 5}}>
        <defs>
          <linearGradient id="ret-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid horizontal vertical={false} stroke={GRID_STROKE} />
        <XAxis
          dataKey="t"
          type="number"
          domain={[0, RETENTION_CURVE.length - 1]}
          ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
          tickFormatter={(v: number) => RETENTION_CURVE[v]?.label ?? ''}
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={40}
          unit="%"
          domain={[0, 100]}
        />
        <Tooltip
          content={<RetentionTooltip />}
          cursor={{stroke: GRID_STROKE}}
        />
        <Area
          type="monotone"
          dataKey="pct"
          name="Retention"
          stroke={COLORS.purple}
          strokeWidth={2}
          fill="url(#ret-grad)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============= SECTION HEADING =============

function SectionHeading({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: typeof UsersIcon;
}) {
  return (
    <HStack hAlign="between" vAlign="center" gap={3}>
      <HStack gap={2} vAlign="center">
        {icon ? <Icon icon={icon} size="sm" color="secondary" /> : null}
        <Heading level={3}>{title}</Heading>
      </HStack>
      {hint ? (
        <Text type="supporting" color="secondary">
          {hint}
        </Text>
      ) : null}
    </HStack>
  );
}

// ============= MAIN =============

export default function DataDashboardPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [range, setRange] = useState<DateRange>('30d');
  const [segment, setSegment] = useState<Segment>('all');
  const [device, setDevice] = useState('all');

  const rangeLabel = RANGE_OPTIONS.find(o => o.value === range)?.label ?? '';
  const segmentLabel =
    SEGMENT_OPTIONS.find(o => o.value === segment)?.label ?? '';

  const summary = useMemo(
    () => `${segmentLabel} · ${rangeLabel}`,
    [segmentLabel, rangeLabel],
  );

  return (
    <Layout
      height="fill"
      contentWidth={1440}
      header={
        <LayoutHeader hasDivider>
          <VStack gap={3}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0}>
                  <Heading level={1}>Data Dashboard</Heading>
                  <Text type="supporting" color="secondary">
                    User analytics overview · {summary}
                  </Text>
                </VStack>
              </StackItem>
              <Selector
                label="Date range"
                isLabelHidden
                options={RANGE_OPTIONS}
                value={range}
                onChange={value => setRange(value as DateRange)}
              />
              <Selector
                label="Segment"
                isLabelHidden
                options={SEGMENT_OPTIONS}
                value={segment}
                onChange={value => setSegment(value as Segment)}
              />
              <Selector
                label="Device"
                isLabelHidden
                options={DEVICE_OPTIONS}
                value={device}
                onChange={setDevice}
              />
              <Button
                label="Export"
                variant="secondary"
                size="sm"
                icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
              />
            </HStack>
            <TabList value={activeTab} onChange={setActiveTab} layout="hug">
              {TABS.map(tab => (
                <Tab key={tab} value={tab} label={tab} />
              ))}
            </TabList>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          {activeTab === 'Overview' && (
            <VStack gap={6}>
              <SectionHeading
                title="Key metrics"
                hint={summary}
                icon={UsersIcon}
              />
              <Grid columns={{minWidth: 260, repeat: 'fit'}} gap={4}>
                {OVERVIEW_METRICS.map(metric => (
                  <MetricCard key={metric.key} metric={metric} />
                ))}
              </Grid>
              <Divider />
              <SectionHeading
                title="Active users by device"
                hint="Daily active users (thousands)"
                icon={CursorArrowRaysIcon}
              />
              <Card>
                <ActiveUsersTrend />
              </Card>
            </VStack>
          )}

          {activeTab === 'Demographics' && (
            <VStack gap={6}>
              <SectionHeading
                title="Audience demographics"
                hint={summary}
                icon={UsersIcon}
              />
              <Grid columns={{minWidth: 320, repeat: 'fit'}} gap={4}>
                <BreakdownCard title="Age" data={AGE_DATA} />
                <BreakdownCard title="Gender" data={GENDER_DATA} />
                <BreakdownCard title="Device" data={DEVICE_DATA} />
              </Grid>
              <Divider />
              <SectionHeading
                title="Acquisition channels"
                hint="How users find the product"
              />
              <Card>
                <Table<AcqRow>
                  data={ACQUISITION}
                  columns={acquisitionColumns}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                />
              </Card>
            </VStack>
          )}

          {activeTab === 'Engagement' && (
            <VStack gap={6}>
              <SectionHeading
                title="Feature engagement"
                hint="Adoption by feature"
                icon={ArrowPathRoundedSquareIcon}
              />
              <Card>
                <Table<FeatureRow>
                  data={FEATURES}
                  columns={featureColumns}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                />
              </Card>
              <Divider />
              <Grid columns={{minWidth: 380, repeat: 'fit'}} gap={6}>
                <VStack gap={4}>
                  <SectionHeading
                    title="Retention"
                    hint="Cohort still active by day"
                    icon={ClockIcon}
                  />
                  <Card>
                    <RetentionChart />
                  </Card>
                </VStack>
                <VStack gap={4}>
                  <SectionHeading title="Top pages" hint="By views" />
                  <Card>
                    <Table<PageRow>
                      data={TOP_PAGES}
                      columns={pageColumns}
                      idKey="id"
                      density="balanced"
                      dividers="rows"
                      hasHover
                    />
                  </Card>
                </VStack>
              </Grid>
            </VStack>
          )}

          {activeTab === 'Geography' && (
            <VStack gap={6}>
              <SectionHeading
                title="Users by country"
                hint={summary}
                icon={UsersIcon}
              />
              <Card>
                <Table<GeoRow>
                  data={GEO}
                  columns={geoColumns}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                />
              </Card>
            </VStack>
          )}
        </LayoutContent>
      }
    />
  );
}
