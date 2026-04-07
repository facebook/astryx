'use client';

import {useState} from 'react';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {XDSStack, XDSStackItem} from '@xds/core/Stack';
import {XDSTable, proportional} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSDivider} from '@xds/core/Divider';
import {XDSLink} from '@xds/core/Link';

// ============= ICONS =============

// SideNav icons
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const LifecycleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);
const AnalyticsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);
const ProjectsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
);
const TeamIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const DataIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const ReportsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);
const WordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  </svg>
);
const HelpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
  </svg>
);
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const MoreIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

// Content icons
const ReloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

// ============= DATA =============

// Active users chart data (24 points over 24h: Apr 1 14:00 → Apr 2 14:00)
// Each point has an hour index (0–23) for even spacing, plus a label for display
const activeUsersData = [
  {hour: 0, label: 'Apr 1 14:00', allUsers: 102, desktop: 72, mobile: 30},
  {hour: 1, label: 'Apr 1 15:00', allUsers: 98, desktop: 70, mobile: 28},
  {hour: 2, label: 'Apr 1 16:00', allUsers: 90, desktop: 65, mobile: 25},
  {hour: 3, label: 'Apr 1 17:00', allUsers: 95, desktop: 60, mobile: 35},
  {hour: 4, label: 'Apr 1 18:00', allUsers: 97, desktop: 52, mobile: 45},
  {hour: 5, label: 'Apr 1 19:00', allUsers: 95, desktop: 45, mobile: 50},
  {hour: 6, label: 'Apr 1 20:00', allUsers: 80, desktop: 38, mobile: 42},
  {hour: 7, label: 'Apr 1 21:00', allUsers: 67, desktop: 32, mobile: 35},
  {hour: 8, label: 'Apr 1 22:00', allUsers: 49, desktop: 25, mobile: 24},
  {hour: 9, label: 'Apr 1 23:00', allUsers: 36, desktop: 20, mobile: 16},
  {hour: 10, label: 'Apr 2 00:00', allUsers: 28, desktop: 16, mobile: 12},
  {hour: 11, label: 'Apr 2 01:00', allUsers: 20, desktop: 12, mobile: 8},
  {hour: 12, label: 'Apr 2 02:00', allUsers: 16, desktop: 10, mobile: 6},
  {hour: 13, label: 'Apr 2 03:00', allUsers: 13, desktop: 8, mobile: 5},
  {hour: 14, label: 'Apr 2 04:00', allUsers: 13, desktop: 8, mobile: 5},
  {hour: 15, label: 'Apr 2 05:00', allUsers: 16, desktop: 10, mobile: 6},
  {hour: 16, label: 'Apr 2 06:00', allUsers: 25, desktop: 15, mobile: 10},
  {hour: 17, label: 'Apr 2 07:00', allUsers: 60, desktop: 28, mobile: 32},
  {hour: 18, label: 'Apr 2 08:00', allUsers: 90, desktop: 48, mobile: 42},
  {hour: 19, label: 'Apr 2 09:00', allUsers: 97, desktop: 62, mobile: 35},
  {hour: 20, label: 'Apr 2 10:00', allUsers: 100, desktop: 72, mobile: 28},
  {hour: 21, label: 'Apr 2 11:00', allUsers: 100, desktop: 75, mobile: 25},
  {hour: 22, label: 'Apr 2 12:00', allUsers: 104, desktop: 74, mobile: 30},
  {hour: 23, label: 'Apr 2 14:00', allUsers: 104, desktop: 72, mobile: 32},
];

// X-axis tick indices and their display labels
const xAxisTicks = [0, 8, 16, 23];
const xAxisLabels: Record<number, string> = {
  0: 'Apr 1 14:00',
  8: 'Apr 1 22:00',
  16: 'Apr 2 06:00',
  23: 'Apr 2 14:00',
};

// Metric cards
const metrics = [
  {
    label: 'Monthly Visitors',
    value: '27.3 k',
    change: '+5.8%',
    positive: true,
  },
  {
    label: 'Monthly Page Views',
    value: '48.2 k',
    change: '+2.4%',
    positive: true,
  },
  {
    label: 'Avg. Session',
    value: '4.5 min',
    change: '-2s',
    positive: false,
  },
  {
    label: 'Bounce Rate',
    value: '42.3%',
    change: '-3.1%',
    positive: false,
  },
];

// Sparkline data for each metric card
const sparklines = [
  [20, 25, 22, 28, 30, 35, 32, 38, 40, 45, 42, 48, 50, 55, 52, 58, 60],
  [30, 45, 35, 50, 40, 55, 45, 60, 50, 55, 48, 52, 58, 50, 55, 62, 58],
  [55, 52, 50, 48, 52, 45, 48, 42, 45, 40, 38, 42, 35, 38, 32, 30, 28],
  [48, 46, 44, 46, 42, 44, 40, 42, 38, 40, 36, 38, 34, 36, 32, 34, 30],
];

// Demographics
const regionData = [
  {label: 'NORAM', value: 38, color: '#3B82F6'},
  {label: 'EMEA', value: 28, color: '#EF4444'},
  {label: 'APAC', value: 22, color: '#8B5CF6'},
  {label: 'LATAM', value: 8, color: '#EC4899'},
  {label: 'Other', value: 4, color: '#334155'},
];

const roleData = [
  {label: 'Engineer', value: 45, color: '#3B82F6'},
  {label: 'Manager', value: 20, color: '#F97316'},
  {label: 'Designer', value: 15, color: '#14B8A6'},
  {label: 'Data Scientist', value: 12, color: '#8B5CF6'},
  {label: 'Other', value: 8, color: '#1E3A5F'},
];

// Engagement — Top pages
interface PageRow extends Record<string, unknown> {
  id: string;
  page: string;
  views: number;
  newUsers: string;
  avgTime: string;
  exits: string;
}

const topPagesData: PageRow[] = [
  {
    id: '1',
    page: '/home',
    views: 8420,
    newUsers: '62.3%',
    avgTime: '3:42',
    exits: '18.5%',
  },
  {
    id: '2',
    page: '/products',
    views: 6150,
    newUsers: '45.1%',
    avgTime: '4:15',
    exits: '22.8%',
  },
  {
    id: '3',
    page: '/pricing',
    views: 4830,
    newUsers: '38.7%',
    avgTime: '2:58',
    exits: '35.2%',
  },
  {
    id: '4',
    page: '/blog',
    views: 3920,
    newUsers: '71.4%',
    avgTime: '5:30',
    exits: '12.1%',
  },
  {
    id: '5',
    page: '/docs',
    views: 3410,
    newUsers: '29.8%',
    avgTime: '6:12',
    exits: '8.4%',
  },
  {
    id: '6',
    page: '/about',
    views: 2980,
    newUsers: '55.6%',
    avgTime: '2:15',
    exits: '28.3%',
  },
  {
    id: '7',
    page: '/contact',
    views: 2540,
    newUsers: '48.2%',
    avgTime: '1:48',
    exits: '41.7%',
  },
  {
    id: '8',
    page: '/changelog',
    views: 2210,
    newUsers: '22.1%',
    avgTime: '4:55',
    exits: '15.6%',
  },
  {
    id: '9',
    page: '/support',
    views: 1870,
    newUsers: '59.3%',
    avgTime: '3:22',
    exits: '30.9%',
  },
  {
    id: '10',
    page: '/careers',
    views: 1520,
    newUsers: '83.1%',
    avgTime: '2:34',
    exits: '45.2%',
  },
];

// Engagement — Top events
interface EventRow extends Record<string, unknown> {
  id: string;
  event: string;
  count: number;
  users: number;
}

const topEventsData: EventRow[] = [
  {id: '1', event: 'page_view', count: 18420, users: 12300},
  {id: '2', event: 'session_start', count: 14850, users: 9870},
  {id: '3', event: 'first_visit', count: 8230, users: 8230},
  {id: '4', event: 'user_engagement', count: 6120, users: 4510},
  {id: '5', event: 'click', count: 3540, users: 2680},
  {id: '6', event: 'scroll', count: 2910, users: 2140},
  {id: '7', event: 'form_submit', count: 1870, users: 1350},
  {id: '8', event: 'video_play', count: 1240, users: 980},
  {id: '9', event: 'search', count: 960, users: 720},
  {id: '10', event: 'share', count: 580, users: 410},
];

// ============= CHART COMPONENTS =============

function ActiveUsersChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={activeUsersData}
        margin={{top: 5, right: 10, left: 0, bottom: 5}}>
        <CartesianGrid
          horizontal
          vertical={false}
          stroke="var(--color-divider, #e5e5e5)"
        />
        <XAxis
          dataKey="hour"
          type="number"
          domain={[0, 23]}
          ticks={xAxisTicks}
          tickFormatter={(v: number) => xAxisLabels[v] ?? ''}
          tick={{fontSize: 11}}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 120]}
          ticks={[0, 20, 40, 60, 80, 100, 120]}
          tick={{fontSize: 11}}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          labelFormatter={(v: number) => {
            const point = activeUsersData.find(d => d.hour === v);
            return point?.label ?? '';
          }}
        />
        <Legend wrapperStyle={{fontSize: 12}} />
        <Line
          type="monotone"
          dataKey="allUsers"
          name="All Users"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="desktop"
          name="Desktop"
          stroke="#F97316"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="mobile"
          name="Mobile"
          stroke="#4F46E5"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Sparkline({data}: {data: number[]}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const pad = 2;
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={40}
      preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-text-secondary, #999)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ============= CARD COMPONENTS =============

function MetricCard({
  label,
  value,
  change,
  positive,
  sparkline,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  sparkline: number[];
}) {
  return (
    <XDSCard>
      <XDSVStack gap={2}>
        <XDSHeading level={4}>{label}</XDSHeading>
        <XDSHStack gap={2} vAlign="center">
          <XDSHeading level={2}>{value}</XDSHeading>
          <XDSHStack gap={1} vAlign="center">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill={positive ? '#16a34a' : '#dc2626'}>
              {positive ? (
                <path d="M6 2L10 7H2L6 2Z" />
              ) : (
                <path d="M6 10L2 5H10L6 10Z" />
              )}
            </svg>
            <XDSText type="body" color="secondary">
              {change}
            </XDSText>
          </XDSHStack>
        </XDSHStack>
        <XDSText type="supporting" color="secondary">
          Last 30 days vs. Previous
        </XDSText>
        <Sparkline data={sparkline} />
      </XDSVStack>
    </XDSCard>
  );
}

function StackedBarCard({
  title,
  data,
}: {
  title: string;
  data: Array<{label: string; value: number; color: string}>;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSHeading level={4}>{title}</XDSHeading>
        {/* Stacked horizontal bar */}
        <div
          style={{
            display: 'flex',
            height: 24,
            borderRadius: 8,
            overflow: 'hidden',
          }}>
          {data.map(d => (
            <div
              key={d.label}
              style={{flex: d.value, backgroundColor: d.color}}
            />
          ))}
        </div>
        {/* Legend */}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
          {data.map(d => (
            <XDSVStack key={d.label} gap={0}>
              <XDSHStack gap={2} vAlign="center">
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: d.color,
                    flexShrink: 0,
                  }}
                />
                <XDSText type="supporting">{d.label}</XDSText>
              </XDSHStack>
              <XDSText type="supporting" color="secondary">
                {d.value} - {((d.value / total) * 100).toFixed(2)}%
              </XDSText>
            </XDSVStack>
          ))}
        </div>
      </XDSVStack>
    </XDSCard>
  );
}

// ============= TABLE COMPONENTS =============

function TopPagesCard() {
  const maxViews = Math.max(...topPagesData.map(d => d.views));

  const columns: XDSTableColumn<PageRow>[] = [
    {key: 'page', header: 'Page', width: proportional(1.5)},
    {
      key: 'views',
      header: 'Views',
      width: proportional(2),
      renderCell: (item: PageRow) => (
        <XDSVStack gap={1}>
          <XDSProgressBar
            value={item.views}
            max={maxViews}
            label={`${item.page} views`}
            isLabelHidden
          />
          <XDSText type="supporting">
            {item.views.toLocaleString()} views
          </XDSText>
        </XDSVStack>
      ),
    },
    {key: 'newUsers', header: 'New Users', width: proportional(1)},
    {key: 'avgTime', header: 'Avg. Time', width: proportional(1)},
    {key: 'exits', header: '% Exits', width: proportional(1)},
  ];

  return (
    <XDSCard padding={0}>
      <XDSVStack>
        <div
          style={{
            padding: '16px 16px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <XDSHeading level={4}>Top pages</XDSHeading>
          <XDSLink label="All pages" href="#">
            All pages
          </XDSLink>
        </div>
        <XDSTable<PageRow>
          data={topPagesData}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="rows"
        />
      </XDSVStack>
    </XDSCard>
  );
}

function TopEventsCard() {
  const maxCount = Math.max(...topEventsData.map(d => d.count));

  const columns: XDSTableColumn<EventRow>[] = [
    {key: 'event', header: 'Event', width: proportional(2)},
    {
      key: 'count',
      header: 'Count',
      width: proportional(2),
      renderCell: (item: EventRow) => (
        <XDSVStack gap={1}>
          <XDSProgressBar
            value={item.count}
            max={maxCount}
            label={`${item.count}`}
            isLabelHidden
          />
          <XDSText type="supporting">{item.count.toLocaleString()}</XDSText>
        </XDSVStack>
      ),
    },
    {key: 'users', header: 'Users', width: proportional(1)},
  ];

  return (
    <XDSCard padding={0}>
      <XDSVStack>
        <div
          style={{
            padding: '16px 16px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <XDSHeading level={4}>Top events</XDSHeading>
          <XDSLink label="All events" href="#">
            All events
          </XDSLink>
        </div>
        <XDSTable<EventRow>
          data={topEventsData}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="rows"
        />
      </XDSVStack>
    </XDSCard>
  );
}

// ============= SIDENAV =============

function DashboardSideNav() {
  const [active, setActive] = useState('dashboard');
  return (
    <XDSSideNav
      header={
        <XDSVStack gap={3} style={{padding: '12px 16px'}}>
          <XDSHStack gap={2} vAlign="center">
            <XDSNavIcon
              icon={<DashboardIcon style={{width: 16, height: 16}} />}
            />
            <XDSText type="body" weight="bold">
              Acme Inc.
            </XDSText>
          </XDSHStack>
          <XDSHStack gap={2}>
            <XDSButton
              label="Quick Create"
              variant="primary"
              size="sm"
              xstyle={{flex: 1} as never}
            />
            <XDSButton
              label="Mail"
              variant="ghost"
              size="sm"
              icon={<MailIcon style={{width: 16, height: 16}} />}
            />
          </XDSHStack>
        </XDSVStack>
      }
      footer={
        <XDSVStack gap={0} style={{padding: '8px 0'}}>
          <XDSSideNavItem
            label="Settings"
            icon={SettingsIcon}
            isSelected={active === 'settings'}
            onClick={() => setActive('settings')}
          />
          <XDSSideNavItem
            label="Get Help"
            icon={HelpIcon}
            isSelected={active === 'help'}
            onClick={() => setActive('help')}
          />
          <XDSSideNavItem
            label="Search"
            icon={SearchIcon}
            isSelected={active === 'search'}
            onClick={() => setActive('search')}
          />
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--color-divider)',
            }}>
            <XDSHStack gap={3} vAlign="center">
              <XDSAvatar name="shadcn" size="small" />
              <XDSVStack gap={0} style={{flex: 1}}>
                <XDSText type="body" weight="bold">
                  shadcn
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  m@example.com
                </XDSText>
              </XDSVStack>
              <XDSButton
                label="More"
                variant="ghost"
                size="sm"
                icon={<MoreIcon style={{width: 16, height: 16}} />}
              />
            </XDSHStack>
          </div>
        </XDSVStack>
      }>
      <XDSSideNavSection title="Platform">
        <XDSSideNavItem
          label="Dashboard"
          icon={DashboardIcon}
          isSelected={active === 'dashboard'}
          onClick={() => setActive('dashboard')}
        />
        <XDSSideNavItem
          label="Lifecycle"
          icon={LifecycleIcon}
          isSelected={active === 'lifecycle'}
          onClick={() => setActive('lifecycle')}
        />
        <XDSSideNavItem
          label="Analytics"
          icon={AnalyticsIcon}
          isSelected={active === 'analytics'}
          onClick={() => setActive('analytics')}
        />
        <XDSSideNavItem
          label="Projects"
          icon={ProjectsIcon}
          isSelected={active === 'projects'}
          onClick={() => setActive('projects')}
        />
        <XDSSideNavItem
          label="Team"
          icon={TeamIcon}
          isSelected={active === 'team'}
          onClick={() => setActive('team')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Documents">
        <XDSSideNavItem
          label="Data Library"
          icon={DataIcon}
          isSelected={active === 'data'}
          onClick={() => setActive('data')}
        />
        <XDSSideNavItem
          label="Reports"
          icon={ReportsIcon}
          isSelected={active === 'reports'}
          onClick={() => setActive('reports')}
        />
        <XDSSideNavItem
          label="Word Assistant"
          icon={WordIcon}
          isSelected={active === 'word'}
          onClick={() => setActive('word')}
        />
        <XDSSideNavItem
          label="More"
          icon={MoreIcon}
          isSelected={active === 'more'}
          onClick={() => setActive('more')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

// ============= MAIN COMPONENT =============

export default function DashboardTemplate() {
  return (
    <XDSAppShell
      sideNav={<DashboardSideNav />}
      topNav={
        <XDSTopNav
          endContent={
            <XDSLink label="GitHub" href="#">
              GitHub
            </XDSLink>
          }>
          <XDSTopNavHeading>Analytics</XDSTopNavHeading>
        </XDSTopNav>
      }
      variant="elevated"
      height="auto"
      contentPadding={6}>
      <XDSVStack gap={6}>
        {/* Active Users Chart */}
        <XDSVStack gap={4}>
          <XDSHStack hAlign="between" vAlign="center">
            <XDSHeading level={3}>Active users</XDSHeading>
            <XDSButton
              label="Reload"
              variant="secondary"
              size="md"
              icon={<ReloadIcon style={{width: 16, height: 16}} />}>
              Reload
            </XDSButton>
          </XDSHStack>
          <ActiveUsersChart />
        </XDSVStack>

        {/* Metric Cards */}
        <XDSStack direction="horizontal" gap={4}>
          {metrics.map((m, i) => (
            <XDSStackItem key={m.label} size="fill">
              <MetricCard {...m} sparkline={sparklines[i]} />
            </XDSStackItem>
          ))}
        </XDSStack>

        <XDSDivider />

        {/* Demographics */}
        <XDSHStack hAlign="between" vAlign="center">
          <XDSHeading level={3}>Demographics</XDSHeading>
          <XDSButton label="View more" variant="secondary" size="md" />
        </XDSHStack>
        <XDSStack direction="horizontal" gap={4}>
          <XDSStackItem size="fill" style={{flexBasis: 0}}>
            <StackedBarCard title="Region" data={regionData} />
          </XDSStackItem>
          <XDSStackItem size="fill" style={{flexBasis: 0}}>
            <StackedBarCard title="Role" data={roleData} />
          </XDSStackItem>
        </XDSStack>

        <XDSDivider />

        {/* Engagement */}
        <XDSHStack hAlign="between" vAlign="center">
          <XDSHeading level={3}>Engagement</XDSHeading>
          <XDSButton label="View more" variant="secondary" size="md" />
        </XDSHStack>
        <XDSStack direction="horizontal" gap={4}>
          <XDSStackItem size="fill">
            <TopPagesCard />
          </XDSStackItem>
          <XDSStackItem size="fill">
            <TopEventsCard />
          </XDSStackItem>
        </XDSStack>
      </XDSVStack>
    </XDSAppShell>
  );
}
