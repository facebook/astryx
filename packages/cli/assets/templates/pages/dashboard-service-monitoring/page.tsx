// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Service Health Monitor — a live-ops / SRE dashboard.
 *
 * Content-only (root `Layout`); the host supplies the app shell. Frame:
 *   header (global controls) | content (KPIs + charts) | triage rail 400 (end)
 *
 * The rail carries both drill-downs — active alerts over a per-service
 * breakdown — as two fixed-header sections that each own their scroll region,
 * so neither list bleeds into the other as it scrolls.
 *
 * The time-window control (1h/1d/7d), environment, and region selectors are
 * real: they reshape the charts, KPI sparklines, and the rail's service rows.
 *
 * The page is anchored to the viewport height, so the header stays put and the
 * content column and rail scroll within it — never the window.
 *
 * Responsive contract:
 *   > 1024px  content flex | rail 400 (two independently scrolling sections)
 *   <= 1024px rail folds into the content column as two stacked cards
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
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
import type {IconType} from '@astryxdesign/core/Icon';
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
  ServerStackIcon,
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

// Hash-based pseudo-noise in [0, 1). A hash rather than a seeded PRNG so any
// sample can be drawn independently of iteration order — the series is byte
// identical on every render, which keeps previews and snapshots stable.
function hashNoise(i: number, seed: number): number {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Signed jitter in [-1, 1) — the per-sample wobble every real metric carries.
function jitter(i: number, seed: number): number {
  return hashNoise(i, seed) * 2 - 1;
}

// Sparse heavy-tail burst in [0, 1], zero most of the time. Latency and traffic
// don't wander smoothly; they sit near baseline and occasionally kick.
function burstAt(i: number, seed: number, rate: number): number {
  const gate = hashNoise(i, seed);
  if (gate < 1 - rate) {
    return 0;
  }
  // Rescale the surviving tail to [0, 1], then square it so small kicks are
  // common and large ones are rare.
  const t = (gate - (1 - rate)) / rate;
  return t * t;
}

// Build a window deterministically — no clocks, no randomness — so previews
// and snapshots stay stable. Sampling is dense (120–168 points) so the lines
// read as real telemetry: a diurnal baseline under constant sample-to-sample
// jitter, punctuated by sparse bursts. A sustained latency spike is baked into
// the middle of each window to correlate with the SEV2 alert in the rail.
function buildWindow(kind: TimeWindow): WindowSeries {
  const config: Record<
    TimeWindow,
    {n: number; stepSec: number; cycles: number}
  > = {
    '1h': {n: 120, stepSec: 30, cycles: 1.2},
    '1d': {n: 144, stepSec: 600, cycles: 2},
    '7d': {n: 168, stepSec: 3600, cycles: 7},
  };
  const {n, stepSec, cycles} = config[kind];
  const points: SeriesPoint[] = [];

  // A localized latency incident, scaled to the sample density of the window.
  const spikeCenter = Math.round(n * 0.62);
  const spikeWidth = Math.max(3, Math.round(n * 0.05));

  for (let i = 0; i < n; i++) {
    const phase = (i / n) * Math.PI * 2 * cycles;
    const diurnal = Math.sin(phase);
    const diurnal2 = Math.sin(phase + 1.1);
    const diurnal3 = Math.sin(phase + 2.3);

    const dist = Math.abs(i - spikeCenter);
    const spike = dist <= spikeWidth ? (1 - dist / (spikeWidth + 1)) * 170 : 0;

    // One burst shared by all three percentiles — a real slowdown hits the
    // whole distribution, hardest at the tail — plus independent jitter so the
    // lines never move in lockstep.
    const burst = burstAt(i, 3.1, 0.14);
    const p50 = 46 + 9 * diurnal + spike * 0.15 + burst * 11 + jitter(i, 1) * 4;
    const p95 =
      158 + 38 * diurnal + spike * 0.6 + burst * 58 + jitter(i, 2) * 15;
    const p99 =
      312 + 88 * diurnal + spike * 1.6 + burst * 195 + jitter(i, 3) * 38;

    // Regional traffic: a shared load pulse (deploys, campaigns, and outages
    // move all regions together) over per-region jitter.
    const pulse = burstAt(i, 7.3, 0.18) - burstAt(i, 9.7, 0.12);
    const useast = 9200 + 2600 * diurnal + pulse * 1500 + jitter(i, 11) * 520;
    const uswest = 6100 + 1500 * diurnal2 + pulse * 900 + jitter(i, 13) * 380;
    const euwest = 3900 + 1200 * diurnal3 + pulse * 620 + jitter(i, 17) * 260;

    const totalMin = Math.floor((i * stepSec) / 60);
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
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
      useast: Math.round(useast),
      uswest: Math.round(uswest),
      euwest: Math.round(euwest),
    });
  }

  // A fixed handful of ticks regardless of sample count — dense sampling must
  // not crowd the axis. The 7d window pins its ticks to day boundaries so
  // every weekday label appears exactly once.
  const ticks: number[] = [];
  if (kind === '7d') {
    const perDay = Math.round((60 * 60 * 24) / stepSec);
    for (let d = 0; d < 7; d++) {
      ticks.push(d * perDay);
    }
  } else {
    for (let k = 0; k < 6; k++) {
      ticks.push(Math.round((k / 5) * (n - 1)));
    }
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

// Sparkline shapes keyed by KPI — 120 samples each, tail-sliced to the active
// window so every window ends "now". Sampled telemetry is noisy, so each series
// carries per-sample jitter over a slow drift, plus sharp incident spikes that
// attack in one sample and decay over the next two or three. Flat, smoothly
// curving sparklines read as decoration; these read as scraped metrics.
const SPARKLINES: Record<string, number[]> = {
  // prettier-ignore
  health: [97.6, 97.6, 97.7, 97.6, 98, 97.4, 96.5, 97.3, 97.3, 97, 97, 97.6, 96.8, 97.2, 91.7, 92.2, 95, 96.3, 96.5, 96.4, 96.8, 95.9, 96.7, 96.7, 96.4, 97.1, 97, 97, 96.1, 96.7, 96, 95.7, 96.9, 97.3, 96.1, 95.8, 96.9, 96.2, 96.6, 96.7, 97.2, 92.7, 96.5, 97.2, 96.5, 95.8, 96, 97.4, 96.8, 96.9, 96.4, 96.9, 97.3, 96.2, 97.3, 96.2, 97, 97.3, 89.5, 90.1, 91.8, 95.1, 96.4, 97.7, 97.2, 97.8, 97, 97.5, 97.1, 98, 96.8, 96.8, 97.7, 97.7, 96.8, 97.2, 93.2, 95.3, 97.2, 97.7, 97.3, 98.2, 97.6, 97.3, 97, 97.4, 96.5, 98, 96.9, 97.1, 96.5, 96.4, 97.6, 87.4, 90, 94.1, 97.1, 97.1, 97.5, 97.6, 96.9, 96.9, 96.8, 96.5, 95.8, 96.7, 96.7, 97.2, 91.7, 91.5, 92.3, 95.3, 96.9, 97.4, 96.8, 97.9, 97.5, 98.3, 97.9, 98.6],
  // prettier-ignore
  error: [0.62, 0.64, 0.98, 0.82, 0.86, 0.83, 1.02, 1.29, 1.24, 2.41, 1.57, 0.96, 0.91, 1.43, 1.36, 1.16, 1.33, 0.95, 1.18, 1.3, 1.48, 1.05, 1.41, 1.06, 1.03, 1.36, 1, 3.71, 2.85, 1.7, 1.41, 1.29, 1.35, 1.35, 1.19, 1.27, 1.2, 0.91, 0.95, 1.06, 1.26, 1.28, 1.19, 1.09, 2.21, 1.52, 0.83, 0.94, 1.17, 0.81, 1.11, 1.24, 1.18, 0.76, 1.09, 1.08, 1.22, 1.02, 1, 5.18, 4.39, 3.74, 2.23, 1, 1.3, 1.53, 1.42, 1.16, 1.18, 1.52, 1.45, 1.34, 3.13, 2.1, 1.66, 1.74, 1.69, 1.33, 1.43, 1.73, 1.73, 1.51, 1.63, 1.55, 1.56, 1.74, 2, 1.46, 5.44, 4.33, 2.3, 1.99, 1.77, 1.82, 1.98, 1.86, 1.88, 1.51, 1.42, 1.82, 1.71, 3.88, 2.22, 1.72, 1.65, 1.64, 1.42, 1.69, 1.39, 1.81, 1.66, 1.3, 1.32, 1.75, 6.22, 5.03, 2.35, 1.39, 1.25, 1.84],
  // prettier-ignore
  latency: [322, 371, 287, 357, 313, 353, 320, 617, 421, 363, 377, 399, 350, 401, 421, 420, 430, 365, 401, 797, 635, 477, 365, 412, 380, 421, 380, 411, 393, 401, 436, 378, 376, 569, 389, 419, 417, 342, 347, 376, 385, 347, 393, 328, 328, 367, 304, 871, 812, 707, 411, 317, 316, 367, 331, 320, 354, 349, 326, 309, 323, 631, 396, 306, 295, 293, 355, 334, 324, 372, 1012, 850, 489, 355, 324, 346, 353, 406, 365, 362, 377, 348, 437, 423, 664, 437, 397, 413, 402, 427, 404, 438, 491, 479, 447, 500, 440, 903, 776, 555, 476, 506, 439, 461, 502, 496, 485, 474, 470, 503, 1198, 1080, 930, 609, 456, 507, 426, 451, 427, 512],
  // prettier-ignore
  availability: [99.891, 99.956, 99.885, 99.964, 99.882, 99.92, 99.696, 99.897, 99.913, 99.948, 99.918, 99.942, 99.921, 99.928, 99.94, 99.902, 99.551, 99.853, 99.853, 99.891, 99.887, 99.926, 99.912, 99.911, 99.739, 99.873, 99.877, 99.85, 99.844, 99.895, 99.854, 99.851, 99.912, 99.426, 99.593, 99.821, 99.851, 99.928, 99.767, 99.852, 99.854, 99.866, 99.87, 99.929, 99.856, 99.925, 99.672, 99.882, 99.926, 99.865, 99.944, 99.941, 99.807, 99.91, 99.892, 99.922, 99.937, 99.338, 99.491, 99.743, 99.925, 99.871, 99.95, 99.909, 99.949, 99.687, 99.844, 99.911, 99.93, 99.882, 99.894, 99.536, 99.833, 99.867, 99.927, 99.88, 99.883, 99.926, 99.895, 99.653, 99.827, 99.906, 99.941, 99.893, 99.863, 99.916, 99.781, 99.885, 99.846, 99.896, 99.876, 99.485, 99.534, 99.738, 99.832, 99.241, 99.321, 99.422, 99.698, 99.828, 99.824, 99.837, 99.828, 99.61, 99.761, 99.878, 99.843, 99.845, 99.529, 99.75, 99.838, 99.83, 99.423, 99.728, 99.817, 99.827, 99.811, 99.871, 99.925, 99.98],
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

// Plain-language status, used as the accessible label on each row's StatusDot —
// the dot's color is the only visual carrier, so the text has to say it.
const STATUS_LABEL: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  warning: 'Degraded',
  critical: 'Down',
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

// The latency and traffic cards sit side by side in the same grid row, so both
// plots share a height — otherwise the shorter card's legend floats mid-card
// against the taller one's.
const CHART_HEIGHT = 280;

// Recharts centers each axis tick label on its tick, so the topmost y-label and
// the outermost x-labels overhang the plot area by half their line box. These
// margins reserve that overhang; without the top margin the tallest y-label
// ("800 ms") is clipped by the container edge.
const CHART_MARGIN = {top: 12, right: 16, left: 0, bottom: 4};

// Wide enough for the longest tick either axis produces — "800 ms" here,
// "13,400" on the traffic chart — at the 12px tick size.
const Y_AXIS_WIDTH = 56;

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
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid horizontal vertical={false} stroke={GRID_STROKE} />
            <TimeAxis series={series} />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={Y_AXIS_WIDTH}
              unit=" ms"
            />
            <Tooltip
              content={<ChartTooltip series={series} unit=" ms" />}
              cursor={{stroke: GRID_STROKE}}
            />
            {/* `linear` + miter joins keep every sample a straight segment —
                `monotone` would round the spikes off into a smooth curve that
                no latency metric actually produces. */}
            <Line
              type="linear"
              dataKey="p50"
              name="p50"
              stroke={CHART_COLORS.p50}
              strokeWidth={1.5}
              strokeLinejoin="miter"
              strokeLinecap="butt"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="p95"
              name="p95"
              stroke={CHART_COLORS.p95}
              strokeWidth={1.5}
              strokeLinejoin="miter"
              strokeLinecap="butt"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="p99"
              name="p99"
              stroke={CHART_COLORS.p99}
              strokeWidth={1.5}
              strokeLinejoin="miter"
              strokeLinecap="butt"
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
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid horizontal vertical={false} stroke={GRID_STROKE} />
            <TimeAxis series={series} />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip series={series} unit=" rpm" />}
              cursor={{stroke: GRID_STROKE}}
            />
            {/* Sharp segments, as above — request volume is a counter, not a
                curve. */}
            <Line
              type="linear"
              dataKey="useast"
              name="us-east-1"
              stroke={CHART_COLORS.useast}
              strokeWidth={1.5}
              strokeLinejoin="miter"
              strokeLinecap="butt"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="uswest"
              name="us-west-2"
              stroke={CHART_COLORS.uswest}
              strokeWidth={1.5}
              strokeLinejoin="miter"
              strokeLinecap="butt"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="euwest"
              name="eu-west-1"
              stroke={CHART_COLORS.euwest}
              strokeWidth={1.5}
              strokeLinejoin="miter"
              strokeLinecap="butt"
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
        margin={{top: 4, right: 0, left: 0, bottom: 2}}>
        {/* Fit the scale to the data. Recharts' implicit axis anchors the
            domain at 0, which flattens any metric that lives far from zero —
            availability (99.2–100%) collapses to a quarter-pixel of travel and
            health to ~4px, hiding every dip. Hidden axes contribute no width,
            so the line still spans the full tile. */}
        <YAxis hide domain={['dataMin', 'dataMax']} />
        {/* `linear` keeps every sample a straight segment — `monotone` would
            round the spikes off into a smooth curve that no metric produces. */}
        <Line
          type="linear"
          dataKey="v"
          stroke={color}
          strokeWidth={1.25}
          strokeLinejoin="miter"
          strokeLinecap="butt"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function KpiTile({kpi, spark}: {kpi: Kpi; spark: number[]}) {
  return (
    <Card padding={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StatusDot
            variant={STATUS_DOT[kpi.status]}
            label={kpi.statusLabel}
            tooltip={kpi.statusLabel}
            isPulsing={kpi.status === 'critical'}
          />
          <Text type="label" color="secondary">
            {kpi.label}
          </Text>
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

// ============= RAIL SECTIONS =============

const railStyles = stylex.create({
  // The rail is one flex column with no scroll of its own; each section claims
  // an equal share and scrolls internally, so a long alert list can never push
  // the service breakdown out of view.
  section: {
    flexBasis: 0,
    flexGrow: 1,
    minHeight: 0,
  },
  // Recessed band behind each section header. A translucent tint rather than a
  // flat color so it reads the same on the card surface (folded inline) and on
  // the panel (in the rail), in both light and dark themes.
  header: {
    backgroundColor: 'var(--color-background-muted)',
  },
});

/**
 * One labelled region of the triage rail: a fixed header band over a body.
 *
 * `isFilled` is the rail form — the section splits the panel height with its
 * sibling and its body owns the scroll. Folded inline (narrow screens) the
 * section sizes to its content instead and the page scroll carries it.
 */
function RailSection({
  icon,
  iconColor,
  title,
  subtitle,
  badge,
  isFilled = false,
  children,
}: {
  icon: IconType;
  iconColor: 'error' | 'secondary';
  title: string;
  subtitle: string;
  badge: ReactNode;
  isFilled?: boolean;
  children: ReactNode;
}) {
  return (
    <VStack gap={0} xstyle={isFilled ? railStyles.section : undefined}>
      <VStack gap={1} padding={4} xstyle={railStyles.header}>
        <HStack gap={2} vAlign="center">
          <Icon icon={icon} size="sm" color={iconColor} />
          <StackItem size="fill">
            <Heading level={3}>{title}</Heading>
          </StackItem>
          {badge}
        </HStack>
        <Text type="supporting" color="secondary">
          {subtitle}
        </Text>
      </VStack>
      <Divider />
      {isFilled ? (
        <StackItem size="fill" isScrollable>
          {children}
        </StackItem>
      ) : (
        children
      )}
    </VStack>
  );
}

// ============= ALERTS FEED =============

function AlertsFeed({isFilled = false}: {isFilled?: boolean}) {
  const groups = ALERT_ORDER.map(state => ({
    state,
    items: ALERTS.filter(a => a.state === state),
  })).filter(g => g.items.length > 0);

  const firing = ALERTS.filter(a => a.state === 'firing').length;

  return (
    <RailSection
      icon={BellAlertIcon}
      iconColor={firing > 0 ? 'error' : 'secondary'}
      title="Active alerts"
      subtitle={`${ALERTS.length} in the last 24h · newest first`}
      badge={
        <Badge
          label={`${firing} firing`}
          variant={firing > 0 ? 'error' : 'neutral'}
        />
      }
      isFilled={isFilled}>
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
    </RailSection>
  );
}

// ============= SERVICE BREAKDOWN =============

// Error-rate thresholds, carried by the row's Token color.
function errorColor(rate: number): 'red' | 'yellow' | 'green' {
  if (rate >= 5) {
    return 'red';
  }
  return rate >= 1.5 ? 'yellow' : 'green';
}

// Request volume is a supporting detail in a 400px rail, so it's abbreviated
// rather than shown in full — the traffic chart carries the exact figures.
function formatRpm(rpm: number): string {
  return rpm >= 1000 ? `${(rpm / 1000).toFixed(1)}k rpm` : `${rpm} rpm`;
}

const SEVERITY_RANK: Record<HealthStatus, number> = {
  critical: 0,
  warning: 1,
  healthy: 2,
};

/**
 * Per-service drill-down, as rail rows rather than the wide table it replaces.
 *
 * A table needs seven columns for this data and a rail has room for about two,
 * so each service collapses to a row: status + name on the first line, the
 * identifying detail (region, fleet size, volume) on the second, and the two
 * numbers an on-call actually triages on — p99 and error rate — end-aligned.
 * Rows sort worst-first, since a scrolling rail can't be scanned like a grid.
 */
function ServiceBreakdown({
  rows,
  contextLabel,
  isFilled = false,
}: {
  rows: HostRow[];
  contextLabel: string;
  isFilled?: boolean;
}) {
  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          SEVERITY_RANK[a.status] - SEVERITY_RANK[b.status] ||
          b.errorRate - a.errorRate,
      ),
    [rows],
  );

  return (
    <RailSection
      icon={ServerStackIcon}
      iconColor="secondary"
      title="Service breakdown"
      subtitle={contextLabel}
      badge={<Badge label={`${rows.length}`} variant="neutral" />}
      isFilled={isFilled}>
      {sorted.length === 0 ? (
        <EmptyState
          title="No services in this view"
          description="Nothing reports in the selected environment and region. Try widening the region filter."
          icon={<Icon icon={ServerStackIcon} size="lg" />}
          isCompact
        />
      ) : (
        <List density="compact" hasDividers>
          {sorted.map(row => (
            <ListItem
              key={row.id}
              label={row.service}
              description={`${row.region} · ${row.instances} hosts · ${formatRpm(row.rpm)}`}
              startContent={
                <StatusDot
                  variant={STATUS_DOT[row.status]}
                  label={STATUS_LABEL[row.status]}
                  isPulsing={row.status === 'critical'}
                />
              }
              endContent={
                <VStack gap={1} hAlign="end">
                  <HStack gap={1} vAlign="center">
                    <Text type="supporting" color="secondary">
                      p99
                    </Text>
                    <Text type="body" weight="semibold">
                      {row.p99} ms
                    </Text>
                  </HStack>
                  <Token
                    size="sm"
                    color={errorColor(row.errorRate)}
                    label={`${row.errorRate.toFixed(1)}% err`}
                  />
                </VStack>
              }
            />
          ))}
        </List>
      )}
    </RailSection>
  );
}

// ============= UPTIME HISTORY =============

// The status-page strip: one bar per day, colored by that day's worst state.
//
// This deliberately runs on its own time base rather than the header's 1h/1d/7d
// control. Uptime is a reliability record measured in days — bucketed into a
// one-hour window it would be 90 bars all saying the same thing. Environment
// and region still apply: they decide which services report here, and how rough
// each one's history reads.
const UPTIME_DAYS = 90;

type UptimeStatus = 'operational' | 'degraded' | 'down';

// Mirrors `uptimeStyles` below. The legend needs each color as a value and the
// bars need it as a static StyleX rule, and StyleX can't derive one from the
// other — keep the two lists in sync by hand.
const UPTIME_COLOR: Record<UptimeStatus, string> = {
  operational: 'var(--color-success, #0D8626)',
  degraded: 'var(--color-warning, #E9AF08)',
  down: 'var(--color-error, #E3193B)',
};

const UPTIME_LABEL: Record<UptimeStatus, string> = {
  operational: 'Operational',
  degraded: 'Partial degradation',
  down: 'Downtime',
};

// Percentage of the day served, per state. A degraded day still serves most
// traffic; a down day is a partial outage, not a lost 24 hours.
const DAY_UPTIME: Record<UptimeStatus, number> = {
  operational: 100,
  degraded: 98.4,
  down: 82,
};

// How much rougher each environment's history runs than production's.
const UPTIME_ENV_RISK: Record<Environment, number> = {
  production: 1,
  staging: 1.6,
  development: 3,
};

// A service that is unhealthy right now didn't get there in a day — its 90-day
// record should read visibly worse than a healthy peer's.
const UPTIME_STATUS_RISK: Record<HealthStatus, number> = {
  healthy: 1,
  warning: 3.5,
  critical: 7,
};

// Today's state, as the strip's last bar. Whatever the rest of the page reports
// for a service, the right-hand end of its strip has to agree.
const UPTIME_TODAY: Record<HealthStatus, UptimeStatus> = {
  healthy: 'operational',
  warning: 'degraded',
  critical: 'down',
};

interface ServiceUptime {
  service: string;
  status: HealthStatus;
  days: UptimeStatus[];
  uptime: number;
  degradedDays: number;
  downDays: number;
}

// Stable per-service seed, so a service's history doesn't reshuffle as the
// roster is filtered — checkout-api draws the same 90 days at every region.
function seedForService(service: string): number {
  let h = 7;
  for (let i = 0; i < service.length; i++) {
    h = (h * 31 + service.charCodeAt(i)) % 9973;
  }
  return h;
}

function buildUptime(
  service: string,
  environment: Environment,
  status: HealthStatus,
): ServiceUptime {
  const seed = seedForService(service);
  const risk = UPTIME_ENV_RISK[environment] * UPTIME_STATUS_RISK[status];

  // Fixed quotas rather than a per-day coin flip. Over only 90 draws the
  // variance of independent rolls swamps the risk signal — a critical service
  // can come out with a cleaner record than a healthy one, which reads as a bug
  // rather than as noise. Taking an exact count and placing it on the days that
  // rank worst keeps the placement pseudo-random while making the headline
  // number a strict function of status and environment.
  //
  // The ±40% wobble is per-service, so peers at the same status don't render as
  // identical rows. It stays well inside the ~3.5x gap between status bands, so
  // it can't reorder them. Both counts are capped: even the worst dev service
  // keeps a mostly-green strip — a wall of red would say "this dashboard is
  // broken", not "this service is".
  const downWobble = 0.6 + 0.8 * hashNoise(seed, 3.7);
  const degradedWobble = 0.6 + 0.8 * hashNoise(seed, 5.9);
  const downCount = Math.round(
    UPTIME_DAYS * Math.min(0.09, 0.005 * risk) * downWobble,
  );
  const degradedCount = Math.round(
    UPTIME_DAYS * Math.min(0.32, 0.02 * risk) * degradedWobble,
  );

  const ranked = [...Array(UPTIME_DAYS).keys()].sort(
    (a, b) => hashNoise(b, seed) - hashNoise(a, seed),
  );
  const days: UptimeStatus[] = new Array(UPTIME_DAYS).fill('operational');
  for (let k = 0; k < downCount; k++) {
    days[ranked[k]] = 'down';
  }
  for (let k = downCount; k < downCount + degradedCount; k++) {
    days[ranked[k]] = 'degraded';
  }
  days[UPTIME_DAYS - 1] = UPTIME_TODAY[status];

  // A per-service clean-day baseline just under 100%. Real measurement never
  // lands on an unbroken 100.00%, and a per-day wobble alone can't do this job:
  // averaged over ~85 days it converges to the same value for every service,
  // leaving peers with equal quotas showing an identical percentage.
  const cleanDay = DAY_UPTIME.operational - 0.02 - hashNoise(seed, 11.3) * 0.06;

  let served = 0;
  let degradedDays = 0;
  let downDays = 0;
  for (let i = 0; i < UPTIME_DAYS; i++) {
    const day = days[i];
    if (day === 'operational') {
      served += cleanDay - hashNoise(i, seed + 1) * 0.02;
    } else {
      served += DAY_UPTIME[day];
      if (day === 'degraded') {
        degradedDays++;
      } else {
        downDays++;
      }
    }
  }

  return {
    service,
    status,
    days,
    uptime: served / UPTIME_DAYS,
    degradedDays,
    downDays,
  };
}

// Index 0 is the oldest day, UPTIME_DAYS - 1 is today.
function dayLabel(i: number): string {
  const ago = UPTIME_DAYS - 1 - i;
  if (ago === 0) {
    return 'Today';
  }
  return ago === 1 ? 'Yesterday' : `${ago} days ago`;
}

const uptimeStyles = stylex.create({
  // Bars divide the row evenly: flexBasis 0 + flexGrow 1 gives every bar the
  // same width whatever the count. The 3px floor keeps them legible, and once
  // the row is too narrow to honor it (below roughly 420px) the strip scrolls
  // rather than compressing 90 bars into invisible slivers — dropping or
  // thinning bars would quietly hide the outage days this strip exists to show.
  strip: {
    display: 'flex',
    gap: '2px',
    overflowX: 'auto',
    overscrollBehaviorX: 'contain',
    scrollbarWidth: 'thin',
  },
  // No border radius: at 3–8px wide, any rounding turns a bar into a pill and
  // the smallest radius token (4px) would round it away entirely.
  bar: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: '3px',
    height: '30px',
  },
  // Mirrors UPTIME_COLOR above.
  operational: {backgroundColor: 'var(--color-success, #0D8626)'},
  degraded: {backgroundColor: 'var(--color-warning, #E9AF08)'},
  down: {backgroundColor: 'var(--color-error, #E3193B)'},
});

/**
 * One service's 90-day strip.
 *
 * The bars are one image to assistive tech, not 90 unlabelled boxes: the strip
 * carries a summary `aria-label` and the per-day detail rides on `title`, which
 * costs nothing next to 90 mounted Tooltips per row.
 */
function UptimeStrip({entry}: {entry: ServiceUptime}) {
  const summary =
    entry.downDays === 0 && entry.degradedDays === 0
      ? `${UPTIME_DAYS}-day uptime for ${entry.service}: no incidents.`
      : `${UPTIME_DAYS}-day uptime for ${entry.service}: ${entry.degradedDays} degraded ${
          entry.degradedDays === 1 ? 'day' : 'days'
        }, ${entry.downDays} with downtime.`;

  return (
    <div {...stylex.props(uptimeStyles.strip)} role="img" aria-label={summary}>
      {entry.days.map((day, i) => (
        <div
          key={i}
          {...stylex.props(uptimeStyles.bar, uptimeStyles[day])}
          title={`${dayLabel(i)} — ${UPTIME_LABEL[day]}`}
        />
      ))}
    </div>
  );
}

function UptimeRow({entry}: {entry: ServiceUptime}) {
  return (
    <VStack gap={2}>
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <StatusDot
              variant={STATUS_DOT[entry.status]}
              label={STATUS_LABEL[entry.status]}
              isPulsing={entry.status === 'critical'}
            />
            <Text type="body" weight="semibold">
              {entry.service}
            </Text>
          </HStack>
        </StackItem>
        <Text type="supporting" color="secondary">
          {entry.uptime.toFixed(2)}% uptime
        </Text>
      </HStack>
      <UptimeStrip entry={entry} />
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            {UPTIME_DAYS} days ago
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary">
          Today
        </Text>
      </HStack>
    </VStack>
  );
}

/**
 * The "All services" roster — every service in view, one uptime strip each.
 *
 * One strip per *service*, not per deployment: the rail's breakdown already
 * lists service × region rows, and repeating that split here would make the
 * section a second copy of it rather than a status page. A service's strip
 * takes the worst status across its regions.
 */
function AllServicesUptime({
  rows,
  environment,
  contextLabel,
}: {
  rows: HostRow[];
  environment: Environment;
  contextLabel: string;
}) {
  const entries = useMemo(() => {
    const worst = new Map<string, HealthStatus>();
    for (const row of rows) {
      const prev = worst.get(row.service);
      if (
        prev === undefined ||
        SEVERITY_RANK[row.status] < SEVERITY_RANK[prev]
      ) {
        worst.set(row.service, row.status);
      }
    }
    // Alphabetical, not worst-first: the rail already triages by severity, and
    // a roster that reorders itself as incidents land is hard to scan or point
    // a colleague at.
    return [...worst.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([service, status]) => buildUptime(service, environment, status));
  }, [rows, environment]);

  return (
    <Card>
      <VStack gap={5}>
        <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
          <VStack gap={1}>
            <Heading level={4}>All services</Heading>
            <Text type="supporting" color="secondary">
              Daily uptime over the last {UPTIME_DAYS} days · {contextLabel}
            </Text>
          </VStack>
          <HStack gap={4} vAlign="center" wrap="wrap">
            <LegendDot
              color={UPTIME_COLOR.operational}
              label={UPTIME_LABEL.operational}
            />
            <LegendDot
              color={UPTIME_COLOR.degraded}
              label={UPTIME_LABEL.degraded}
            />
            <LegendDot color={UPTIME_COLOR.down} label={UPTIME_LABEL.down} />
          </HStack>
        </HStack>
        {entries.length === 0 ? (
          <EmptyState
            title="No services in this view"
            description="Nothing reports in the selected environment and region. Try widening the region filter."
            icon={<Icon icon={ServerStackIcon} size="lg" />}
            isCompact
          />
        ) : (
          <VStack gap={5}>
            {entries.map(entry => (
              <UptimeRow key={entry.service} entry={entry} />
            ))}
          </VStack>
        )}
      </VStack>
    </Card>
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

// Fill the window. Layout height="fill" is height:100%, which only resolves
// against a definite height — and the host's <html>/<body> don't set one, so
// the layout anchors a definite viewport height itself. The rail depends on
// this: its two sections split the panel height and scroll internally, which
// needs a definite height to divide. No background; the host owns the page
// surface.
const pageStyle: CSSProperties = {height: '100dvh'};

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

  // Every window stays densely sampled — a sparkline thinned to ~30 points
  // stretches its jitter into a smooth wobble and its spikes into soft
  // triangles. Shorter windows just bucket finer, as a real backend would.
  const sparkLen =
    timeWindow === '1h'
      ? 60
      : timeWindow === '1d'
        ? 90
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

  // The breakdown lost its table header when it moved into the rail, so the
  // active filters have to be restated in the section subtitle instead.
  const breakdownContext = `${ENV_OPTIONS.find(e => e.value === environment)?.label} · ${REGION_OPTIONS.find(r => r.value === region)?.label}`;

  return (
    <Layout
      height="fill"
      style={pageStyle}
      header={
        <LayoutHeader padding={6} hasDivider>
          <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
            <VStack gap={0} vAlign="center">
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
            <HStack gap={2} vAlign="center">
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
            <VStack gap={6}>
              {/* Traffic-light KPI tiles */}
              <Grid columns={{minWidth: 240, repeat: 'fit'}} gap={3}>
                {kpis.map(kpi => (
                  <KpiTile
                    key={kpi.key}
                    kpi={kpi}
                    spark={SPARKLINES[kpi.key].slice(-sparkLen)}
                  />
                ))}
              </Grid>

              {/* Time-series charts */}
              <Grid columns={{minWidth: 320, repeat: 'fit'}} gap={3}>
                <LatencyChart series={series} latencyFactor={latencyFactor} />
                <TrafficChart series={series} factor={factor} />
              </Grid>
            </VStack>

            <Divider />

            {/* Status-page roster: one 90-day uptime strip per service. */}
            <AllServicesUptime
              rows={rows}
              environment={environment}
              contextLabel={breakdownContext}
            />

            {/* Below 1024px the rail folds in here as two stacked cards. The
                  cards carry the section boundary the panel gets from its strong
                  divider, so the two feeds stay just as separate. */}
            {isNarrow && (
              <VStack gap={4}>
                <Card padding={0}>
                  <AlertsFeed />
                </Card>
                <Card padding={0}>
                  <ServiceBreakdown
                    rows={rows}
                    contextLabel={breakdownContext}
                  />
                </Card>
              </VStack>
            )}
          </VStack>
        </LayoutContent>
      }
      end={
        isNarrow ? undefined : (
          <LayoutPanel
            width={400}
            padding={0}
            hasDivider
            role="complementary"
            label="Alerts and service breakdown"
            // The panel itself must not scroll: each section owns its own
            // scroll region so the two never slide past each other.
            isScrollable={false}>
            <VStack gap={0} height="100%">
              <AlertsFeed isFilled />
              {/* Strong rather than subtle — this separates two regions, not
                  two rows within one. */}
              <Divider variant="strong" />
              <ServiceBreakdown
                rows={rows}
                contextLabel={breakdownContext}
                isFilled
              />
            </VStack>
          </LayoutPanel>
        )
      }
    />
  );
}
