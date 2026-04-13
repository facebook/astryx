'use client';

import {useState} from 'react';

import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {XDSStack, XDSStackItem} from '@xds/core/Stack';
import {XDSTable, proportional} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSDivider} from '@xds/core/Divider';
import {XDSLink} from '@xds/core/Link';

// ============= ICONS =============

import {
  HomeIcon,
  FolderIcon,
  ChartBarIcon,
  UserGroupIcon,
  CircleStackIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

// ============= DATA =============

// Active users chart data (24 points over 24h: Apr 1 14:00 → Apr 2 14:00)
// Each point has an hour index (0–23) for even spacing, plus a label for display
const activeUsersData = [
  {hour: 0, label: 'Apr 1 14:00', allUsers: 130, desktop: 80, mobile: 50},
  {hour: 1, label: 'Apr 1 15:00', allUsers: 120, desktop: 70, mobile: 50},
  {hour: 2, label: 'Apr 1 16:00', allUsers: 115, desktop: 55, mobile: 60},
  {hour: 3, label: 'Apr 1 17:00', allUsers: 105, desktop: 55, mobile: 50},
  {hour: 4, label: 'Apr 1 18:00', allUsers: 100, desktop: 55, mobile: 45},
  {hour: 5, label: 'Apr 1 19:00', allUsers: 95, desktop: 55, mobile: 40},
  {hour: 6, label: 'Apr 1 20:00', allUsers: 95, desktop: 50, mobile: 45},
  {hour: 7, label: 'Apr 1 21:00', allUsers: 80, desktop: 42, mobile: 38},
  {hour: 8, label: 'Apr 1 22:00', allUsers: 70, desktop: 38, mobile: 32},
  {hour: 9, label: 'Apr 1 23:00', allUsers: 65, desktop: 35, mobile: 30},
  {hour: 10, label: 'Apr 2 00:00', allUsers: 60, desktop: 35, mobile: 25},
  {hour: 11, label: 'Apr 2 01:00', allUsers: 58, desktop: 34, mobile: 24},
  {hour: 12, label: 'Apr 2 02:00', allUsers: 60, desktop: 35, mobile: 25},
  {hour: 13, label: 'Apr 2 03:00', allUsers: 55, desktop: 32, mobile: 23},
  {hour: 14, label: 'Apr 2 04:00', allUsers: 50, desktop: 20, mobile: 30},
  {hour: 15, label: 'Apr 2 05:00', allUsers: 52, desktop: 18, mobile: 34},
  {hour: 16, label: 'Apr 2 06:00', allUsers: 62, desktop: 20, mobile: 42},
  {hour: 17, label: 'Apr 2 07:00', allUsers: 80, desktop: 25, mobile: 55},
  {hour: 18, label: 'Apr 2 08:00', allUsers: 105, desktop: 30, mobile: 75},
  {hour: 19, label: 'Apr 2 09:00', allUsers: 110, desktop: 30, mobile: 80},
  {hour: 20, label: 'Apr 2 10:00', allUsers: 115, desktop: 35, mobile: 80},
  {hour: 21, label: 'Apr 2 11:00', allUsers: 120, desktop: 55, mobile: 65},
  {hour: 22, label: 'Apr 2 12:00', allUsers: 125, desktop: 75, mobile: 50},
  {hour: 23, label: 'Apr 2 14:00', allUsers: 130, desktop: 80, mobile: 50},
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
  {label: 'NORAM', value: 38, color: 'var(--color-border-blue, #0171E3)'},
  {label: 'EMEA', value: 28, color: 'var(--color-border-red, #E3193B)'},
  {label: 'APAC', value: 22, color: 'var(--color-border-purple, #7952FF)'},
  {label: 'LATAM', value: 8, color: 'var(--color-border-pink, #E91E63)'},
  {label: 'Other', value: 4, color: 'var(--color-border-gray, #647685)'},
];

const roleData = [
  {label: 'Engineer', value: 45, color: 'var(--color-border-blue, #0171E3)'},
  {label: 'Manager', value: 20, color: 'var(--color-border-orange, #F27902)'},
  {label: 'Designer', value: 15, color: 'var(--color-border-teal, #0DB7AF)'},
  {
    label: 'Data Scientist',
    value: 12,
    color: 'var(--color-border-purple, #7952FF)',
  },
  {label: 'Other', value: 8, color: 'var(--color-border-gray, #647685)'},
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

// Workaround: XDS Table row dividers are not rendering due to a StyleX
// compilation issue in the core package build. Apply row dividers via CSS.
const tableDividerStyles = `
  .dashboard-table tr:not(:last-child) td {
    border-bottom: 1px solid var(--color-border, rgba(5, 54, 89, 0.1));
  }
`;

// Chart line colors via XDS design tokens (CSS custom properties)
const chartColors = {
  allUsers: 'var(--color-border-blue, #0171E3)',
  desktop: 'var(--color-border-orange, #F27902)',
  mobile: 'var(--color-border-purple, #7952FF)',
};

function ChartLegendItem({color, label}: {color: string; label: string}) {
  return (
    <XDSHStack gap={2} vAlign="center">
      <svg width="16" height="3">
        <line x1="0" y1="1.5" x2="16" y2="1.5" stroke={color} strokeWidth="2" />
      </svg>
      <XDSText type="supporting" color="secondary">
        {label}
      </XDSText>
    </XDSHStack>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{name: string; value: number; color: string}>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const point = activeUsersData.find(d => d.hour === label);
  return (
    <div
      style={{
        backgroundColor: 'var(--color-background-popover, #fff)',
        border: '1px solid var(--color-border, rgba(5, 54, 89, 0.1))',
        borderRadius: 'var(--radius-element, 8px)',
        padding: 'var(--spacing-3, 12px)',
        boxShadow: 'var(--shadow-med)',
      }}>
      <XDSVStack gap={1}>
        <XDSText type="supporting" color="secondary">
          {point?.label ?? ''}
        </XDSText>
        {payload.map(entry => (
          <XDSHStack key={entry.name} gap={2} vAlign="center">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 'var(--radius-full, 9999px)',
                backgroundColor: entry.color,
                flexShrink: 0,
              }}
            />
            <XDSText type="supporting">
              {entry.name}: {entry.value}
            </XDSText>
          </XDSHStack>
        ))}
      </XDSVStack>
    </div>
  );
}

function ActiveUsersChart() {
  return (
    <XDSVStack gap={3}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={activeUsersData}
          margin={{top: 5, right: 10, left: 0, bottom: 5}}>
          <CartesianGrid
            horizontal
            vertical={false}
            stroke="var(--color-border, rgba(5, 54, 89, 0.1))"
          />
          <XAxis
            dataKey="hour"
            type="number"
            domain={[0, 23]}
            ticks={xAxisTicks}
            tickFormatter={(v: number) => xAxisLabels[v] ?? ''}
            tick={{
              fontSize: 'var(--font-size-sm, 12px)',
              fill: 'var(--color-text-secondary, #4E606F)',
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 120]}
            ticks={[0, 20, 40, 60, 80, 100, 120]}
            tick={{
              fontSize: 'var(--font-size-sm, 12px)',
              fill: 'var(--color-text-secondary, #4E606F)',
            }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{stroke: 'var(--color-border, rgba(5, 54, 89, 0.1))'}}
          />
          <Line
            type="monotone"
            dataKey="allUsers"
            name="All Users"
            stroke={chartColors.allUsers}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="desktop"
            name="Desktop"
            stroke={chartColors.desktop}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="mobile"
            name="Mobile"
            stroke={chartColors.mobile}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <XDSHStack gap={6} vAlign="center">
        <ChartLegendItem color={chartColors.allUsers} label="All Users" />
        <ChartLegendItem color={chartColors.desktop} label="Desktop" />
        <ChartLegendItem color={chartColors.mobile} label="Mobile" />
      </XDSHStack>
    </XDSVStack>
  );
}

function Sparkline({data}: {data: number[]}) {
  const chartData = data.map((v, i) => ({i, v}));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke="var(--color-border-blue, #0171E3)"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
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
            {positive ? (
              <ArrowUpIcon
                style={{
                  width: 12,
                  height: 12,
                  color: 'var(--color-success, #0D8626)',
                }}
              />
            ) : (
              <ArrowDownIcon
                style={{
                  width: 12,
                  height: 12,
                  color: 'var(--color-error, #E3193B)',
                }}
              />
            )}
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
  // Recharts needs a single data row with each segment as a separate key
  const chartData = [Object.fromEntries(data.map(d => [d.label, d.value]))];

  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSHeading level={4}>{title}</XDSHeading>
        <ResponsiveContainer width="100%" height={24}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{top: 0, right: 0, bottom: 0, left: 0}}
            barCategoryGap={0}>
            <XAxis type="number" hide />
            <YAxis type="category" hide />
            {data.map((d, i) => (
              <Bar
                key={d.label}
                dataKey={d.label}
                stackId="stack"
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
        {/* Legend */}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
          {data.map(d => (
            <XDSVStack key={d.label} gap={0}>
              <XDSHStack gap={2} vAlign="center">
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 'var(--radius-full, 9999px)',
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
    {
      key: 'newUsers',
      header: <div style={{textAlign: 'right', width: '100%'}}>New Users</div>,
      width: proportional(1),
      renderCell: (item: PageRow) => (
        <div style={{textAlign: 'right'}}>{item.newUsers}</div>
      ),
    },
    {
      key: 'avgTime',
      header: <div style={{textAlign: 'right', width: '100%'}}>Avg. Time</div>,
      width: proportional(1),
      renderCell: (item: PageRow) => (
        <div style={{textAlign: 'right'}}>{item.avgTime}</div>
      ),
    },
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
        <div className="dashboard-table">
          <style>{tableDividerStyles}</style>
          <XDSTable<PageRow>
            data={topPagesData}
            columns={columns}
            idKey="id"
            density="compact"
            dividers="rows"
            hasHover
          />
        </div>
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
    {
      key: 'users',
      header: <div style={{textAlign: 'right', width: '100%'}}>Users</div>,
      width: proportional(1),
      renderCell: (item: EventRow) => (
        <div style={{textAlign: 'right'}}>{item.users.toLocaleString()}</div>
      ),
    },
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
        <div className="dashboard-table">
          <style>{tableDividerStyles}</style>
          <XDSTable<EventRow>
            data={topEventsData}
            columns={columns}
            idKey="id"
            density="compact"
            dividers="rows"
            hasHover
          />
        </div>
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
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />
          }
          heading="Analytics"
          headingHref="/"
        />
      }>
      <XDSSideNavSection title="Platform">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected={active === 'dashboard'}
          onClick={() => setActive('dashboard')}
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          isSelected={active === 'projects'}
          onClick={() => setActive('projects')}
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          isSelected={active === 'analytics'}
          onClick={() => setActive('analytics')}
        />
        <XDSSideNavItem
          label="Team"
          icon={UserGroupIcon}
          isSelected={active === 'team'}
          onClick={() => setActive('team')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Documents">
        <XDSSideNavItem
          label="Data Library"
          icon={CircleStackIcon}
          isSelected={active === 'data'}
          onClick={() => setActive('data')}
        />
        <XDSSideNavItem
          label="Reports"
          icon={DocumentTextIcon}
          isSelected={active === 'reports'}
          onClick={() => setActive('reports')}
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
              icon={<ArrowPathIcon style={{width: 16, height: 16}} />}
            />
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
