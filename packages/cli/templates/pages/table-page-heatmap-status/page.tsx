// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo} from 'react';
import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';
import {Button} from '@xds/core/Button';
import {IconButton} from '@xds/core/IconButton';
import {Icon} from '@xds/core/Icon';
import {Avatar} from '@xds/core/Avatar';
import {Badge} from '@xds/core/Badge';
import {Link} from '@xds/core/Link';
import {Table, proportional, pixel} from '@xds/core/Table';
import type {TableColumn} from '@xds/core/Table';
import {Chart, ChartAxis, ChartHeatmapGL} from '@xds/lab';
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// ============= DATA =============

type Severity = 'critical' | 'major' | 'minor' | 'resolved';
type ProductName =
  | 'Ads Manager'
  | 'Business Suite'
  | 'Commerce Manager'
  | 'Pages'
  | 'Messenger API'
  | 'Graph API'
  | 'WhatsApp Business'
  | 'Instagram API';

function avatarSvg(bg: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/><circle cx="50" cy="38" r="18" fill="white" opacity="0.85"/><ellipse cx="50" cy="90" rx="30" ry="28" fill="white" opacity="0.85"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const ONCALL_AVATARS: Record<string, string> = {
  'Sarah Chen': avatarSvg('#6366F1'),
  'David Kim': avatarSvg('#EC4899'),
  'Priya Sharma': avatarSvg('#F59E0B'),
  'Marcus Rivera': avatarSvg('#10B981'),
  'Elena Volkov': avatarSvg('#8B5CF6'),
  'Noah Williams': avatarSvg('#EF4444'),
  'Mei Lin': avatarSvg('#06B6D4'),
  'Carlos Mendez': avatarSvg('#F97316'),
  'Fatima Al-Rashid': avatarSvg('#3B82F6'),
  'Lucas Andersson': avatarSvg('#14B8A6'),
  'Sofia Garcia': avatarSvg('#A855F7'),
  'Raj Kapoor': avatarSvg('#E11D48'),
  'Emma Thompson': avatarSvg('#0EA5E9'),
  'Andre Santos': avatarSvg('#84CC16'),
};

interface IncidentRow extends Record<string, unknown> {
  id: string;
  product: ProductName;
  title: string;
  severity: Severity;
  status: 'ongoing' | 'identified' | 'monitoring' | 'resolved';
  oncall: string;
  startTime: string;
  duration: string;
  date: string;
  dayOfWeek: number;
  hour: number;
}

const incidents: IncidentRow[] = [
  // Active — ongoing
  {
    id: 'INC-4008',
    product: 'Business Suite',
    title:
      'Notification delivery delays affecting mobile push and email channels — queue saturation under investigation',
    severity: 'major',
    oncall: 'Carlos Mendez',
    status: 'ongoing',
    startTime: '09:15',
    duration: 'ongoing',
    date: '2025-01-15',
    dayOfWeek: 3,
    hour: 9,
  },
  // Tue (2) 3pm — the only major outage cluster (3 incidents)
  {
    id: 'INC-4001',
    product: 'Ads Manager',
    title:
      'Campaign creation timing out for ~12% of advertisers in EMEA region — root caused to elevated DB write latency',
    severity: 'critical',
    oncall: 'Sarah Chen',
    status: 'resolved',
    startTime: '15:10',
    duration: '2h 15m',
    date: '2025-01-14',
    dayOfWeek: 2,
    hour: 15,
  },
  {
    id: 'INC-4002',
    product: 'Graph API',
    title:
      'Elevated 5xx error rates on /me and /me/accounts endpoints affecting third-party integrations globally',
    severity: 'critical',
    oncall: 'David Kim',
    status: 'resolved',
    startTime: '15:30',
    duration: '3h 20m',
    date: '2025-01-14',
    dayOfWeek: 2,
    hour: 15,
  },
  {
    id: 'INC-4003',
    product: 'Instagram API',
    title:
      'Media upload failures for image and video content via /media endpoint affecting ~8% of publishers',
    severity: 'major',
    oncall: 'Priya Sharma',
    status: 'resolved',
    startTime: '15:05',
    duration: '1h 50m',
    date: '2025-01-14',
    dayOfWeek: 2,
    hour: 15,
  },
  // Tue (2) 4pm — spillover (2 incidents)
  {
    id: 'INC-4004',
    product: 'Ads Manager',
    title:
      'Audience insights tab returning empty results due to cache invalidation cascade from earlier outage',
    severity: 'minor',
    oncall: 'Marcus Rivera',
    status: 'resolved',
    startTime: '16:00',
    duration: '45m',
    date: '2025-01-14',
    dayOfWeek: 2,
    hour: 16,
  },
  {
    id: 'INC-4005',
    product: 'WhatsApp Business',
    title:
      'Outbound message delivery delays of 2-5 minutes for high-volume senders due to queue backpressure',
    severity: 'major',
    oncall: 'Elena Volkov',
    status: 'resolved',
    startTime: '16:20',
    duration: '1h 15m',
    date: '2025-01-14',
    dayOfWeek: 2,
    hour: 16,
  },
  // Thu (4) 10am — single incident
  {
    id: 'INC-4006',
    product: 'Commerce Manager',
    title:
      'Product catalog sync failures from Shopify and BigCommerce integrations after schema migration deployed',
    severity: 'major',
    oncall: 'Noah Williams',
    status: 'resolved',
    startTime: '10:15',
    duration: '2h 40m',
    date: '2025-01-16',
    dayOfWeek: 4,
    hour: 10,
  },
  // Fri (5) 4pm — single incident
  {
    id: 'INC-4007',
    product: 'Messenger API',
    title:
      'Webhook delivery failures for subscribed page events — retries succeeded but signaled false alerts',
    severity: 'minor',
    oncall: 'Mei Lin',
    status: 'resolved',
    startTime: '16:30',
    duration: '45m',
    date: '2025-01-17',
    dayOfWeek: 5,
    hour: 16,
  },
  // Active incident
  // Scattered minor blips — light pink cells
  {
    id: 'INC-4009',
    product: 'Pages',
    title:
      'Image upload timeouts for posts larger than 4MB — auto-recovered after CDN region failover',
    severity: 'minor',
    oncall: 'Fatima Al-Rashid',
    status: 'resolved',
    startTime: '11:00',
    duration: '20m',
    date: '2025-01-12',
    dayOfWeek: 0,
    hour: 11,
  },
  {
    id: 'INC-4010',
    product: 'Graph API',
    title:
      'Intermittent 503 errors on a single load balancer in us-east-1 — auto-healed by health check rotation',
    severity: 'minor',
    oncall: 'Lucas Andersson',
    status: 'resolved',
    startTime: '14:30',
    duration: '15m',
    date: '2025-01-13',
    dayOfWeek: 1,
    hour: 14,
  },
  {
    id: 'INC-4011',
    product: 'WhatsApp Business',
    title:
      'Template message rejections due to stale category cache for newly approved templates',
    severity: 'minor',
    oncall: 'Sofia Garcia',
    status: 'resolved',
    startTime: '13:00',
    duration: '30m',
    date: '2025-01-16',
    dayOfWeek: 4,
    hour: 13,
  },
  {
    id: 'INC-4012',
    product: 'Commerce Manager',
    title:
      'Inventory count mismatch between checkout and catalog services for ~200 SKUs in test region',
    severity: 'minor',
    oncall: 'Raj Kapoor',
    status: 'resolved',
    startTime: '12:00',
    duration: '1h 00m',
    date: '2025-01-17',
    dayOfWeek: 5,
    hour: 12,
  },
  {
    id: 'INC-4013',
    product: 'Instagram API',
    title:
      'Story insights data delayed by 30-60 minutes for accounts with >100K followers',
    severity: 'minor',
    oncall: 'Emma Thompson',
    status: 'resolved',
    startTime: '10:00',
    duration: '45m',
    date: '2025-01-18',
    dayOfWeek: 6,
    hour: 10,
  },
  {
    id: 'INC-4014',
    product: 'Business Suite',
    title:
      'Slow inbox loading times (>3s p95) for accounts with large message histories — index rebuild in progress',
    severity: 'minor',
    oncall: 'Andre Santos',
    status: 'resolved',
    startTime: '15:00',
    duration: '25m',
    date: '2025-01-15',
    dayOfWeek: 3,
    hour: 15,
  },
];

const DAYS = [
  'Jan 12',
  'Jan 13',
  'Jan 14',
  'Jan 15',
  'Jan 16',
  'Jan 17',
  'Jan 18',
];
const HOURS = [
  '9am',
  '10am',
  '11am',
  '12pm',
  '1pm',
  '2pm',
  '3pm',
  '4pm',
  '5pm',
];

function buildHeatmapData(data: IncidentRow[]) {
  return HOURS.flatMap((hour, hi) =>
    DAYS.map((day, di) => {
      const hourValue = 9 + hi;
      const count = data.filter(
        o => o.dayOfWeek === di && o.hour === hourValue,
      ).length;
      return {day, hour, incidents: count};
    }),
  );
}

const statusVariant: Record<string, 'error' | 'warning' | 'info' | 'success'> =
  {
    ongoing: 'error',
    identified: 'warning',
    monitoring: 'info',
    resolved: 'success',
  };

const columns: TableColumn<IncidentRow>[] = [
  {
    key: 'id',
    header: 'Incident',
    width: pixel(110),
    renderCell: (item: IncidentRow) => (
      <Link href="#" isStandalone>
        {item.id}
      </Link>
    ),
  },
  {
    key: 'product',
    header: 'Product',
    width: proportional(2),
    renderCell: (item: IncidentRow) => (
      <Text type="body">{item.product}</Text>
    ),
  },
  {
    key: 'title',
    header: 'Description',
    width: proportional(5),
    renderCell: (item: IncidentRow) => (
      <Text type="body">{item.title}</Text>
    ),
  },
  {
    key: 'startTime',
    header: 'Started',
    width: pixel(80),
    renderCell: (item: IncidentRow) => (
      <Text type="body">{item.startTime}</Text>
    ),
  },
  {
    key: 'duration',
    header: 'Duration',
    width: pixel(100),
    renderCell: (item: IncidentRow) => (
      <Text type="body">{item.duration}</Text>
    ),
  },
  {
    key: 'oncall',
    header: 'On-call',
    width: proportional(2),
    renderCell: (item: IncidentRow) => (
      <HStack gap={2} vAlign="center">
        <Avatar
          name={item.oncall}
          src={ONCALL_AVATARS[item.oncall]}
          size="xsmall"
        />
        <Text type="body">{item.oncall}</Text>
      </HStack>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(120),
    renderCell: (item: IncidentRow) => (
      <Badge
        label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        variant={statusVariant[item.status]}
      />
    ),
  },
  {
    key: 'date',
    header: 'Date',
    width: pixel(110),
    renderCell: (item: IncidentRow) => (
      <Text type="body">{item.date}</Text>
    ),
  },
];

// ============= HEATMAP =============

function OutageHeatmap() {
  const heatmapData = useMemo(() => buildHeatmapData(incidents), []);

  return (
    <Chart
      data={heatmapData}
      xKey="day"
      yKeys={['incidents']}
      height={280}
      margin={{left: 0, right: 0, top: 0, bottom: 30}}>
      <ChartAxis position="bottom" />
      <ChartHeatmapGL
        xKey="day"
        yKey="hour"
        valueKey="incidents"
        colorRange={['#dcfce7', '#fee2e2', '#fca5a5', '#ef4444', '#991b1b']}
      />
    </Chart>
  );
}

// ============= PAGE =============

export default function TablePageHeatmapStatusTemplate() {
  return (
    <Layout
      height="auto"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Heading level={1}>Status</Heading>
            </StackItem>
            <IconButton
              label="Filter"
              icon={<Icon icon={FunnelIcon} size="sm" />}
              variant="ghost"
            />
            <IconButton
              label="Export"
              icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
              variant="ghost"
            />
            <Button
              label="Refresh"
              icon={<Icon icon={ArrowPathIcon} size="sm" />}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={3}>
          <VStack gap={4}>
            <OutageHeatmap />

            <Table<IncidentRow>
              data={incidents}
              columns={columns}
              idKey="id"
              density="balanced"
              dividers="rows"
              hasHover
            />
          </VStack>
        </LayoutContent>
      }
    />
  );
}
